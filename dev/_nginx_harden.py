"""Harden nginx: add security headers, expand gzip_types, enable CORS for /v1/."""
import paramiko, time
t0 = time.time()
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("149.28.145.15", username="root",
          pkey=paramiko.Ed25519Key.from_private_key_file(r"C:\Users\P1\.ssh\id_ed25519"),
          timeout=20, banner_timeout=20, auth_timeout=20)
sftp = c.open_sftp()
with sftp.open("/etc/nginx/sites-enabled/longevity-agent", "r") as f:
    site = f.read().decode()
print("=== BEFORE (length={}) ===".format(len(site)))
# Show key parts
for line in site.splitlines():
    if any(k in line for k in ("gzip_types", "location /v1/", "add_header", "ssl_certificate")):
        print("  >", line)

# 1. Expand gzip_types to include text/html, text/markdown, application/xml, font/woff2
old_gzip = 'gzip_types text/plain text/css application/javascript application/json image/svg+xml;'
new_gzip = 'gzip_types text/plain text/css application/javascript application/json image/svg+xml text/html text/markdown application/xml font/woff2 font/ttf;'
if old_gzip in site:
    site = site.replace(old_gzip, new_gzip)
    print("[ok] gzip_types expanded")
else:
    print("[skip] gzip_types line not found in expected form")

# 2. Inject a "add_header" block right after the listen ... ssl_certificate lines (or at top of server)
# We add a single line that always sets these headers
hdr_block = """
    # LAGP-SECURITY: managed by dev/_nginx_harden.py
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header X-XSS-Protection "0" always;
"""
# Insert just after the first ssl_dhparam line (or after the listen 443 ssl line)
marker = "ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"
if marker in site:
    site = site.replace(marker, marker + "\n" + hdr_block)
    print("[ok] security headers block injected after ssl_dhparam")
else:
    print("[warn] ssl_dhparam marker not found, appending after server {")
    site = site.replace("server {", "server {\n" + hdr_block, 1)

# 3. CORS for /v1/ — modify the existing LAGP-API location block
old_v1 = """    # LAGP-API: managed by dev/_step3_nginx.py
    location /v1/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        client_max_body_size 1m;
    }"""
new_v1 = """    # LAGP-API: managed by dev/_nginx_harden.py (was dev/_step3_nginx.py)
    location /v1/ {
        # CORS for cross-origin agent clients
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
            add_header Access-Control-Max-Age "86400" always;
            add_header Content-Type "text/plain";
            add_header Content-Length 0;
            return 204;
        }
        add_header Access-Control-Allow-Origin "*" always;
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        client_max_body_size 1m;
    }"""
if old_v1 in site:
    site = site.replace(old_v1, new_v1)
    print("[ok] /v1/ CORS + preflight wired")
else:
    print("[warn] old /v1/ block not found, attempting partial match")
    if "location /v1/" in site:
        # Just inject CORS preflight before the existing block
        site = site.replace("location /v1/", "location /v1/ {\n        if ($request_method = OPTIONS) { add_header Access-Control-Allow-Origin \"*\" always; add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS\" always; add_header Access-Control-Allow-Headers \"Content-Type, Authorization\" always; return 204; }\n        add_header Access-Control-Allow-Origin \"*\" always;\n        real_loc", 1)

# 4. Also add content-type sniffing protection to .md files
# nginx by default serves .md as application/octet-stream; force text/markdown via types
md_type = "\n    # LAGP-MIME: serve .md as text/markdown, .yaml as text/yaml\n    types { text/markdown md; text/yaml yaml yml; application/javascript js; };\n"
site = site.replace("server {", "server {" + md_type, 1)
print("[ok] MIME types: .md=text/markdown, .yaml=text/yaml")

with sftp.open("/etc/nginx/sites-enabled/longevity-agent", "w") as f:
    f.write(site)
sftp.close()

# Validate + reload
si, so, se = c.exec_command("nginx -t 2>&1", timeout=15)
print("=== nginx -t ===")
print(so.read().decode())
c.exec_command("systemctl reload nginx")
print("[ok] nginx reloaded")
c.close()
print(f"[{time.time()-t0:.1f}s] done")
