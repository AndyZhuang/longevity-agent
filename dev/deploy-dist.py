#!/usr/bin/env python3
"""dev/deploy-dist.py — SFTP upload via paramiko with concurrency"""
import os
import sys
import posixpath
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import paramiko

HOST = "149.28.145.15"
USER = "root"
KEY = os.environ["USERPROFILE"] + "\\.ssh\\id_ed25519"
LOCAL = "dist"
REMOTE = "/var/www/longevity-agent/dist"
CONCURRENCY = 8

print("Connecting...", flush=True)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, key_filename=KEY, timeout=15)
print("Connected.", flush=True)

sftp_main = client.open_sftp()
def rmtree(sftp, path):
    """Recursively remove a directory tree over SFTP."""
    try:
        entries = sftp.listdir(path)
    except IOError:
        return
    for entry in entries:
        full = posixpath.join(path, entry)
        try:
            # If it's a file, unlink
            sftp.unlink(full)
        except IOError:
            # It's a directory, recurse
            rmtree(sftp, full)
            try:
                sftp.rmdir(full)
            except IOError:
                pass


print(f"Wiping {REMOTE}...", flush=True)
try:
    sftp_main.rmdir(REMOTE)  # remove the dir itself if empty
except IOError:
    pass
rmtree(sftp_main, REMOTE)
try:
    sftp_main.rmdir(REMOTE)  # try again after cleaning contents
except IOError:
    pass
sftp_main.mkdir(REMOTE, mode=0o755)
sftp_main.close()
print("Remote dir ready.", flush=True)

# Collect files
files = []
for root, dirs, names in os.walk(LOCAL):
    for n in names:
        lp = os.path.join(root, n)
        rel = os.path.relpath(lp, LOCAL).replace(os.sep, "/")
        files.append((lp, posixpath.join(REMOTE, rel)))
print(f"Uploading {len(files)} files with concurrency {CONCURRENCY}...", flush=True)


t0 = time.time()
sftp = client.open_sftp()  # single sftp session
done = 0
made_dirs = set()
for lp, rp in files:
    # Ensure parent directory exists
    parent = posixpath.dirname(rp)
    if parent and parent not in made_dirs:
        # Walk up the chain to create all needed parents
        parts = parent[len(REMOTE):].strip("/").split("/")
        cur = REMOTE
        for p in parts:
            cur = posixpath.join(cur, p)
            if cur not in made_dirs:
                try:
                    sftp.mkdir(cur, mode=0o755)
                except IOError:
                    pass
                made_dirs.add(cur)
    sftp.put(lp, rp)
    done += 1
    if done % 10 == 0 or done == len(files):
        print(f"  {done}/{len(files)} uploaded ({time.time()-t0:.1f}s)", flush=True)

sftp.close()
client.close()
print(f"Done. {len(files)} files in {time.time()-t0:.1f}s", flush=True)
