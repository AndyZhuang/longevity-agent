"""Inspect + fix nginx config: remove bad types{} block, use default_type instead."""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("149.28.145.15", username="root",
          pkey=paramiko.Ed25519Key.from_private_key_file(r"C:\Users\P1\.ssh\id_ed25519"),
          timeout=20, banner_timeout=20, auth_timeout=20)
sftp = c.open_sftp()
with sftp.open("/etc/nginx/sites-enabled/longevity-agent", "r") as f:
    site = f.read().decode()
print("=== first 10 lines ===")
for i, line in enumerate(site.splitlines()[:12], 1):
    print(f"  {i:2d}: {line}")

# Remove the bad types{} block
bad = "\n    # LAGP-MIME: serve .md as text/markdown, .yaml as text/yaml\n    types { text/markdown md; text/yaml yaml yml; application/javascript js; };\n"
if bad in site:
    site = site.replace(bad, "\n    # LAGP-MIME: handled by nginx default mime.types (md defaults to application/octet-stream, yaml likewise)\n")
    print("[ok] removed bad types{} block")
else:
    print("[warn] bad block not found as expected; searching for 'types {'")
    import re
    site2 = re.sub(r"\n    # LAGP-MIME:.*?;\n", "\n", site, flags=re.DOTALL)
    if site2 != site:
        site = site2
        print("[ok] removed via regex")

# Insert proper default_type per location for /skill*.md
md_loc = """
    # LAGP-MIME: serve .md as text/markdown, .yaml as text/yaml
    location ~* \\.md$ { default_type text/markdown; add_header Cache-Control "public, max-age=300"; }
    location ~* \\.ya?ml$ { default_type text/yaml; add_header Cache-Control "public, max-age=300"; }
"""
if "LAGP-MIME" not in site:
    site = site.replace("server {", "server {\n" + md_loc, 1)
    print("[ok] .md/.yaml default_type per location")

with sftp.open("/etc/nginx/sites-enabled/longevity-agent", "w") as f:
    f.write(site)
sftp.close()

# Validate
si, so, se = c.exec_command("nginx -t 2>&1", timeout=15)
print("=== nginx -t ===")
print(so.read().decode())
out = so.read().decode() if so.peek(1) else ""
err = se.read().decode()
if err.strip(): print("[ERR]", err)
c.exec_command("systemctl reload nginx")
print("[ok] nginx reloaded")
c.close()
