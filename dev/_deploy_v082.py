"""Deploy updated dist (with og:title/og:description/JSON-LD) + verify."""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("149.28.145.15", username="root",
          pkey=paramiko.Ed25519Key.from_private_key_file(r"C:\Users\P1\.ssh\id_ed25519"),
          timeout=30, banner_timeout=30, auth_timeout=30)

# Use existing dev/deploy-dist.py via sftp + run on server
sftp = c.open_sftp()
# First, quickly upload the new dist/index.html (and a few key assets) directly
# (full deploy via dev/deploy-dist.py is more thorough; do that for completeness)
sftp.put("dist/index.html", "/var/www/longevity-agent/dist/index.html")
print("[ok] dist/index.html uploaded")
# Verify
si, so, se = c.exec_command(
    "curl -sS -k -o - -w '\\nHTTP=%{http_code}  size=%{size_download}\\n' https://longevityagent.top/ | head -1; echo '---'; "
    "curl -sS -k https://longevityagent.top/ | grep -oE 'property=\"og:title\"[^>]+' | head -1; "
    "curl -sS -k https://longevityagent.top/ | grep -oE 'application/ld\\+json' | head -1; "
    "curl -sS -k https://longevityagent.top/ | grep -oE '<title>[^<]+</title>' | head -1",
    timeout=30)
print("--- verify ---")
print(so.read().decode("utf-8", errors="replace"))
c.close()
