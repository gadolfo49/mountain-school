#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
EDGE='https://kbtjkjdjvkorekzzhxcx.supabase.co/functions/v1'
ORIGIN='https://gadolfo49.github.io'
check_200(){ local url="$1"; code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url"); test "$code" = '200'; }
check_cors(){ local fn="$1"; code=$(curl -sS -o /tmp/mf_cors_body -D /tmp/mf_cors_headers -w '%{http_code}' -X OPTIONS "$EDGE/$fn" -H "Origin: $ORIGIN" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,apikey,content-type,x-client-info'); test "$code" = '204'; grep -qi '^access-control-allow-origin: https://gadolfo49.github.io' /tmp/mf_cors_headers; grep -qi '^access-control-allow-methods: .*POST.*OPTIONS' /tmp/mf_cors_headers; grep -qi '^access-control-allow-headers: .*authorization' /tmp/mf_cors_headers; }
check_200 "$BASE/?smoke=r5-1-mounty"
grep -q 'MF-R5.1-MOUNTY-RELIABILITY-20260912' /tmp/mf_body
grep -q '@supabase/supabase-js@2.116.0' /tmp/mf_body
grep -q 'runtime-v2.js?v=20260912-r5-1' /tmp/mf_body
grep -q 'mounty-guide-v1.js?v=20260912-r5-1' /tmp/mf_body
! grep -q 'auth-v5.js' /tmp/mf_body
check_200 "$BASE/runtime-v2.js?v=20260912-r5-1"
grep -q 'R5.1-MOUNTY-RELIABILITY' /tmp/mf_body
grep -q 'parseFunctionError' /tmp/mf_body
grep -q 'invokeFunction' /tmp/mf_body
grep -q 'refreshSession' /tmp/mf_body
check_200 "$BASE/mounty-guide-v1.js?v=20260912-r5-1"
grep -q 'rt.invokeFunction' /tmp/mf_body
grep -q 'Mounty está redactando' /tmp/mf_body
grep -q 'Referencia:' /tmp/mf_body
grep -q 'mf_broadcast_preview_count' /tmp/mf_body
grep -q 'finalize_upload' /tmp/mf_body
grep -q 'cancel_upload' /tmp/mf_body
check_200 "$BASE/sw.js?smoke=r5-1-mounty"
grep -q 'mountain-family-shell-r5-1-mounty-reliability-20260912' /tmp/mf_body
grep -q "'./runtime-v2.js'" /tmp/mf_body
! grep -q "'./auth-v5.js'" /tmp/mf_body
for fn in mounty-compose mountain-media mounty-agent mounty-review mountain-thread; do check_cors "$fn"; done
echo 'LIVE_SMOKE_OK_R5_1_MOUNTY_RELIABILITY'
