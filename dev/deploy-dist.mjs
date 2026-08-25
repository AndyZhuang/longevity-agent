#!/usr/bin/env node
// dev/deploy-dist.mjs — SFTP upload via paramiko (Python) for speed
// Concurrency: 8 parallel file uploads. Mirrors local dist/ to remote.
import { execSync } from "node:child_process";

const HOST = "149.28.145.15";
const USER = "root";
const KEY_PATH = process.env.USERPROFILE + "\\.ssh\\id_ed25519";
const LOCAL_DIST = "dist";
const REMOTE_DIST = "/var/www/longevity-agent/dist";

const py = `
import os
import sys
import posixpath
import time
from pathlib import Path
import paramiko

HOST = ${JSON.stringify(HOST)}
USER = ${JSON.stringify(USER)}
KEY = ${JSON.stringify(KEY_PATH)}
LOCAL = ${JSON.stringify(LOCAL_DIST)}
REMOTE = ${JSON.stringify(REMOTE_DIST)}
CONCURRENCY = 8

pk = paramiko.RSAKey.from_private_key_file(KEY) if 'RSAKey.from_private_key_file' in dir(paramiko) else paramiko.Ed25519Key.from_private_key_file(KEY)

print("Connecting...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pk, timeout=15)
print("Connected.")

sftp = client.open_sftp()
print(f"Wiping {REMOTE}...")
try:
    for entry in sftp.listdir(REMOTE):
        full = posixpath.join(REMOTE, entry)
        sftp.rmtree(full)
except IOError as e:
    if "No such file" not in str(e):
        print(f"Wipe err: {e}")
sftp.mkdir(REMOTE, mode=0o755)
print("Remote dir ready.")

# Collect files
files = []
for root, dirs, names in os.walk(LOCAL):
    for n in names:
        lp = os.path.join(root, n)
        rel = os.path.relpath(lp, LOCAL).replace(os.sep, "/")
        files.append((lp, posixpath.join(REMOTE, rel)))
print(f"Uploading {len(files)} files with concurrency {CONCURRENCY}...")

from concurrent.futures import ThreadPoolExecutor, as_completed

def upload_one(args):
    lp, rp = args
    sftp.put(lp, rp)
    return rp

t0 = time.time()
done = 0
with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
    # Use 8 separate sftp sessions for true concurrency
    sftps = [client.open_sftp() for _ in range(CONCURRENCY)]
    def upload(args):
        i, (lp, rp) = args
        sftps[i].put(lp, rp)
        return rp
    futures = [ex.submit(upload, (i % CONCURRENCY, f)) for i, f in enumerate(files)]
    for f in as_completed(futures):
        rp = f.result()
        done += 1
        if done % 10 == 0 or done == len(files):
            print(f"  {done}/{len(files)} uploaded ({time.time()-t0:.1f}s)")

for s in sftps:
    s.close()
sftp.close()
client.close()
print(f"Done. {len(files)} files in {time.time()-t0:.1f}s")
`;

execSync(`python -c "${py.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { stdio: "inherit" });
