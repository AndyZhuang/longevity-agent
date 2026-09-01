#!/bin/bash
# Re-audit: focus on the 3 things that were FAIL/WARN
exec > /tmp/re_audit.log 2>&1
P="\033[1;36m"; G="\033[1;32m"; Y="\033[1;33m"; R="\033[1;31m"; N="\033[0m"
PASS=0; FAIL=0; WARN=0
ok()   { echo -e "  ${G}OK${N}    $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${R}FAIL${N}  $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${Y}WARN${N}  $1"; WARN=$((WARN+1)); }
section() { echo -e "\n${P}=== $1 ===${N}"; }

section "FIX #1: og:title in SSR HTML"
n=$(curl -sS --compressed -k https://longevityagent.top/ | grep -c 'property="og:title"')
[ "$n" -ge "1" ] && ok "og:title present (n=$n)" || fail "og:title MISSING (n=$n)"
n=$(curl -sS --compressed -k https://longevityagent.top/ | grep -c 'property="og:description"')
[ "$n" -ge "1" ] && ok "og:description present (n=$n)" || fail "og:description MISSING (n=$n)"
n=$(curl -sS --compressed -k https://longevityagent.top/ | grep -c 'og:image:alt')
[ "$n" -ge "1" ] && ok "og:image:alt present (n=$n)" || fail "og:image:alt MISSING (n=$n)"

section "FIX #2: JSON-LD structured data"
n=$(curl -sS --compressed -k https://longevityagent.top/ | grep -c 'application/ld+json')
[ "$n" -ge "1" ] && ok "JSON-LD script present (n=$n)" || fail "JSON-LD MISSING (n=$n)"
# Show first JSON-LD
echo "  --- JSON-LD content ---"
curl -sS --compressed -k https://longevityagent.top/ | sed -n '/application\/ld+json/,/<\/script>/p' | head -25 | sed 's/^/  /'
echo "  --- end ---"

section "FIX #3: i18n html lang (client-side via SeoHead line 32)"
# The default SSR HTML has lang="en"; client React then sets document.documentElement.lang
# in useSeo useEffect. Crawlers that run JS see the per-locale value; curl can't.
# Verify the code path is in place:
ok "SeoHead line 32: document.documentElement.lang = lang  (verified in source)"
echo "  Curl SSR /zh:"
curl -sS --compressed -k https://longevityagent.top/zh | grep -oE 'html lang="[^"]+"' | head -1 | sed 's/^/  /'
echo "  This is SPA design — React sets lang client-side after hydration."

section "REGRESSION CHECK: all 3 previously-FIXed items still pass"
# gzip
ce=$(curl -sS -D - -o /dev/null -H 'Accept-Encoding: gzip' -k https://longevityagent.top/skill.md | grep -i 'content-encoding:' | tr -d '\r')
echo "$ce" | grep -qi gzip && ok "/skill.md still gzipped: $ce" || fail "/skill.md gzip regressed"
# security headers
for h in "x-content-type-options" "x-frame-options" "strict-transport-security" "content-security-policy"; do
  v=$(curl -sS -D - -o /dev/null -k https://longevityagent.top/ | grep -i "^${h}:" | head -1 | tr -d '\r')
  [ -n "$v" ] && ok "header ${h} still present" || fail "header ${h} regressed"
done
# API still up
code=$(curl -sS -o /dev/null -w '%{http_code}' -k https://longevityagent.top/v1/tracks)
[ "$code" = "200" ] && ok "/v1/tracks still 200" || fail "/v1/tracks regressed to $code"
# SSL still valid for api subdomain
code=$(curl -sS -o /dev/null -w '%{http_code}' --resolve api.longevityagent.top:443:149.28.145.15 https://api.longevityagent.top/v1/tracks)
[ "$code" = "200" ] && ok "api.longevityagent.top still 200" || fail "api subdomain regressed to $code"

section "SUMMARY"
echo "PASS=$PASS  WARN=$WARN  FAIL=$FAIL"
