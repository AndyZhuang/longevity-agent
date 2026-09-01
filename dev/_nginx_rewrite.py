"""Overwrite nginx site with clean config from local file."""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("149.28.145.15", username="root",
          pkey=paramiko.Ed25519Key.from_private_key_file(r"C:\Users\P1\.ssh\id_ed25519"),
          timeout=20, banner_timeout=20, auth_timeout=20)
sftp = c.open_sftp()
sftp.put("dev/nginx-site.conf", "/etc/nginx/sites-enabled/longevity-agent")
sftp.chmod("/etc/nginx/sites-enabled/longevity-agent", 0o644)
sftp.close()
print("[ok] site config uploaded")
si, so, se = c.exec_command("nginx -t 2>&1", timeout=10)
print("--- nginx -t ---")
print(so.read().decode())
err = se.read().decode()
if err.strip(): print("[ERR]", err)
si, so, se = c.exec_command("systemctl reload nginx 2>&1", timeout=10)
print("--- reload ---")
print(so.read().decode())
err = se.read().decode()
if err.strip(): print("[ERR]", err)
c.close()
print("[done]")
