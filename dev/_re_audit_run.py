"""Push + run re-audit."""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("149.28.145.15", username="root",
          pkey=paramiko.Ed25519Key.from_private_key_file(r"C:\Users\P1\.ssh\id_ed25519"),
          timeout=30)
sftp = c.open_sftp()
sftp.put("dev/_re_audit.sh", "/tmp/re_audit.sh")
sftp.chmod("/tmp/re_audit.sh", 0o755)
sftp.close()
si, so, se = c.exec_command("bash /tmp/re_audit.sh; cat /tmp/re_audit.log", timeout=60)
print(so.read().decode("utf-8", errors="replace"))
c.close()
