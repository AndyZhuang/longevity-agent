#!/usr/bin/env python3
"""
dev/deploy-stub.py — install the LAGP API stub on 149.28.145.15.

Steps (idempotent):
  1. SFTP dev/lagp-api-stub/ → /opt/lagp-api-stub/
  2. ssh 'cd /opt/lagp-api-stub && npm install --omit=dev'
  3. Write /etc/systemd/system/longevity-agent-api.service
  4. systemctl daemon-reload && systemctl enable --now longevity-agent-api
  5. Patch /etc/nginx/sites-enabled/longevity-agent to add
     `location /v1/ { proxy_pass http://127.0.0.1:3001; ... }`
  6. nginx -t && systemctl reload nginx
  7. curl https://longevityagent.top/v1/tracks → expect 200 JSON

Run from project root.
"""
import os, sys, time, posixpath
import paramiko

HOST = "149.28.145.15"
USER = "root"
KEY  = os.environ["USERPROFILE"] + "\\.ssh\\id_ed25519"
LOCAL_STUB  = "dev/lagp-api-stub"
REMOTE_STUB = "/opt/lagp-api-stub"
SERVICE_FILE = "dev/lagp-api-stub/longevity-agent-api.service"
REMOTE_SERVICE = "/etc/systemd/system/longevity-agent-api.service"
NGINX_SITE = "/etc/nginx/sites-enabled/longevity-agent"
NGINX_MARKER = "# LAGP-API: managed by dev/deploy-stub.py"

print("Connecting...", flush=True)
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=15)
sftp = c.open_sftp()
print("Connected.", flush=True)

def run(cmd, t=60):
    print(f"\n$ {cmd}", flush=True)
    si, so, se = c.exec_command(cmd, timeout=t)
    out = so.read().decode("utf-8", errors="replace")
    err = se.read().decode("utf-8", errors="replace")
    if out: print(out, end="" if out.endswith("\n") else "\n", flush=True)
    if err.strip(): print("[STDERR]", err, flush=True)
    return out, err

# 1. wipe + upload stub
print(f"\n[1/6] Upload {LOCAL_STUB} → {REMOTE_STUB}")
def rmtree(sftp, path):
    try: entries = sftp.listdir(path)
    except IOError: return
    for e in entries:
        full = posixpath.join(path, e)
        try: sftp.unlink(full)
        except IOError:
            rmtree(sftp, full)
            try: sftp.rmdir(full)
            except IOError: pass
try: sftp.rmdir(REMOTE_STUB)
except IOError: pass
rmtree(sftp, REMOTE_STUB)
try: sftp.rmdir(REMOTE_STUB)
except IOError: pass
sftp.mkdir(REMOTE_STUB, mode=0o755)
made = set([REMOTE_STUB])
files = []
for root, dirs, names in os.walk(LOCAL_STUB):
    if "node_modules" in dirs: dirs.remove("node_modules")
    if "test-data" in dirs: dirs.remove("test-data")
    for n in names:
        lp = os.path.join(root, n)
        rel = os.path.relpath(lp, LOCAL_STUB).replace(os.sep, "/")
        files.append((lp, posixpath.join(REMOTE_STUB, rel)))
print(f"  {len(files)} files to upload")
for lp, rp in files:
    parent = posixpath.dirname(rp)
    parts = parent[len(REMOTE_STUB):].strip("/").split("/") if parent != REMOTE_STUB else []
    cur = REMOTE_STUB
    for p in parts:
        cur = posixpath.join(cur, p)
        if cur not in made:
            try: sftp.mkdir(cur, mode=0o755)
            except IOError: pass
            made.add(cur)
    sftp.put(lp, rp)
sftp.close()
print("  done")

# 2. npm install on server
print("\n[2/6] npm install on server")
run("which npm || (apt-get install -y npm 2>&1 | tail -3)")
run("which node || (apt-get install -y nodejs 2>&1 | tail -3)")
out, _ = run("cd /opt/lagp-api-stub && npm install --omit=dev 2>&1 | tail -10", t=180)
print("  done")

# 3. systemd unit
print("\n[3/6] Write systemd unit")
sftp = c.open_sftp()
sftp.put(SERVICE_FILE, REMOTE_SERVICE)
run(f"chmod 644 {REMOTE_SERVICE}")
sftp.close()
print("  done")

# 4. enable + start
print("\n[4/6] systemctl enable --now")
run("systemctl daemon-reload")
run("systemctl enable --now longevity-agent-api")
out, _ = run("systemctl is-active longevity-agent-api")
print(f"  status: {out.strip()}")
run("sleep 1 && curl -sS -o - -w '\\nHTTP=%{http_code}\\n' http://127.0.0.1:3001/health")

# 5. patch nginx
print("\n[5/6] Patch nginx site to add /v1/ proxy_pass")
si, so, se = c.exec_command(f"cat {NGINX_SITE}", timeout=10)
existing = so.read().decode()
se.read()
if "/v1/" in existing and "proxy_pass" in existing:
    print("  /v1/ already present, skip")
else:
    # inject location /v1/ block right before the final `}` of the first server { ... }
    inject = """
    # LAGP-API: managed by dev/deploy-stub.py
    location /v1/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        client_max_body_size 1m;
    }
"""
    # find the first server { block and insert before its closing }
    idx = existing.index("server {")
    depth = 0
    end = -1
    for i in range(idx, len(existing)):
        if existing[i] == "{": depth += 1
        elif existing[i] == "}":
            depth -= 1
            if depth == 0: end = i; break
    if end < 0:
        raise RuntimeError("could not find end of first server block")
    new_conf = existing[:end] + inject + existing[end:]
    sftp = c.open_sftp()
    with sftp.open(NGINX_SITE, "w") as f:
        f.write(new_conf)
    sftp.close()
    print("  patched")

out, err = run("nginx -t 2>&1", t=15)
if "test is successful" not in out:
    print("  NGINX TEST FAILED:", out, err)
    sys.exit(2)
run("systemctl reload nginx")
print("  nginx reloaded")

# 6. final smoke
print("\n[6/6] Production smoke test")
out, _ = run("curl -sS -o - -w '\\nHTTP=%{http_code}  ct=%{content_type}  t=%{time_total}s\\n' -k https://longevityagent.top/v1/tracks", t=30)
out, _ = run("curl -sS -o /tmp/oa.json -w 'HTTP=%{http_code}  size=%{size_download}\\n' -k https://longevityagent.top/api/openapi.json", t=30)
run("python3 -c \"import json; d=json.load(open('/tmp/oa.json')); print('openapi version=', d.get('info',{}).get('version'))\"")
out, _ = run("curl -sS -o - -w '\\nHTTP=%{http_code}\\n' -k -X POST https://longevityagent.top/v1/agent/register -H 'Content-Type: application/json' -d '{\"handle\":\"prod-diag-1\",\"email\":\"diag@x.com\",\"primary_model\":\"Mavis / M3\"}'", t=30)

c.close()
print("\nDONE")
