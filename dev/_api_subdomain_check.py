"""Verify api.longevityagent.top is now reachable + same routes as canonical."""
import paramiko, time
t0 = time.time()
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("149.28.145.15", username="root",
          pkey=paramiko.Ed25519Key.from_private_key_file(r"C:\Users\P1\.ssh\id_ed25519"),
          timeout=20, banner_timeout=20, auth_timeout=20)
print(f"[{time.time()-t0:.1f}s] connected")

script = r"""
echo "=== DNS ==="
getent hosts api.longevityagent.top || echo "(no getent result)"
echo
echo "=== 1. POST /v1/agent/register via api subdomain ==="
curl -sS -o /tmp/r.json -w 'HTTP=%{http_code}  ct=%{content_type}  size=%{size_download}  t=%{time_total}s\n' -k -X POST https://api.longevityagent.top/v1/agent/register \
  -H 'Content-Type: application/json' \
  -d '{"handle":"api-diag-1","email":"api@x.com","primary_model":"Mavis / M3"}'
cat /tmp/r.json; echo
KEY=$(python3 -c 'import json; print(json.load(open("/tmp/r.json"))["api_key"])')
echo "KEY=$KEY"
echo
echo "=== 2. GET /v1/tracks via api subdomain ==="
curl -sS -o - -w 'HTTP=%{http_code}  size=%{size_download}\n' -k https://api.longevityagent.top/v1/tracks | head -c 250; echo
echo
echo "=== 3. POST /v1/submissions via api subdomain (with key) ==="
SUB='{"schema_version":"0.7.1","channel":"http_post","track":"q1","owner_lane":"moa-novelty","human_input_digest":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","human_input_questions_answered":5,"human_input_meta_digest":"sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","human_input_meta_questions_answered":5,"human_input_meta_visibility":"public","human_input_meta_answers":{"q1":"5h/week","q2":"1-shot","q3":"learn","q4":"solo","q5":"aggressive"},"candidate":{"inchi_key":"InChI=1S/C8H9NO2/c10-7-3-1-5-2-4-6(11)8(5)9/h1-4,9H,10-11H2"},"reproducibility":{"agent":"M3","prompt_sha256":"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc","seed":7}}'
curl -sS -o /tmp/s.json -w 'HTTP=%{http_code}  size=%{size_download}\n' -k -X POST https://api.longevityagent.top/v1/submissions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $KEY" \
  -d "$SUB"
head -c 400 /tmp/s.json; echo
SID=$(python3 -c 'import json; print(json.load(open("/tmp/s.json"))["id"])')
echo "SID=$SID"
echo
echo "=== 4. GET /v1/leaderboard?track=q1 via api subdomain ==="
curl -sS -o - -w 'HTTP=%{http_code}\n' -k 'https://api.longevityagent.top/v1/leaderboard?track=q1' | head -c 400; echo
echo
echo "=== 5. GET /v1/agents via api subdomain ==="
curl -sS -o - -w 'HTTP=%{http_code}\n' -k https://api.longevityagent.top/v1/agents | head -c 300; echo
echo
echo "=== 6. GET /v1/judges via api subdomain ==="
curl -sS -o - -w 'HTTP=%{http_code}  ' -k https://api.longevityagent.top/v1/judges
python3 -c 'import json; d=json.load(open("/dev/stdin")); print("count=", len(d.get("judges",[])))' < <(curl -sS -k https://api.longevityagent.top/v1/judges)
echo
echo "=== 7. Parallel: same call, canonical vs api subdomain (should be byte-identical) ==="
A=$(curl -sS -k https://longevityagent.top/v1/tracks | sha256sum | awk '{print $1}')
B=$(curl -sS -k https://api.longevityagent.top/v1/tracks | sha256sum | awk '{print $1}')
echo "canonical sha256: $A"
echo "api subdomain sha256: $B"
[ "$A" = "$B" ] && echo "MATCH ✓" || echo "DIFFER ✗"
echo
echo "=== 8. SSL cert valid for api subdomain? ==="
echo | openssl s_client -servername api.longevityagent.top -connect api.longevityagent.top:443 2>/dev/null | openssl x509 -noout -subject -issuer 2>&1 | head -4
"""
si, so, se = c.exec_command(script, timeout=60)
out = so.read().decode("utf-8", errors="replace")
err = se.read().decode("utf-8", errors="replace")
print(out)
if err.strip(): print("[ERR]", err)
c.close()
print(f"\n[{time.time()-t0:.1f}s] done")
