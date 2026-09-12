#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
EDGE='https://kbtjkjdjvkorekzzhxcx.supabase.co/functions/v1'
ORIGIN='https://gadolfo49.github.io'
check_200(){ local url="$1"; code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url"); test "$code" = '200'; }
check_cors(){ local fn="$1"; code=$(curl -sS -o /tmp/mf_cors_body -D /tmp/mf_cors_headers -w '%{http_code}' -X OPTIONS "$EDGE/$fn" -H "Origin: $ORIGIN" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,apikey,content-type,x-client-info'); test "$code" = '204'; grep -qi '^access-control-allow-origin: https://gadolfo49.github.io' /tmp/mf_cors_headers; grep -qi '^access-control-allow-methods: .*POST.*OPTIONS' /tmp/mf_cors_headers; }
check_200 "$BASE/?smoke=r5-3-principal-audit"
grep -q 'MF-R5.3-PRINCIPAL-AUDIT-20260912' /tmp/mf_body
grep -q '@supabase/supabase-js@2.116.0' /tmp/mf_body
grep -q 'runtime-v2.js?v=20260912-r5-3' /tmp/mf_body
grep -q 'mounty-guide-v1.js?v=20260912-r5-3' /tmp/mf_body
grep -q 'account-controls-v1.js?v=20260912-r5-3' /tmp/mf_body
grep -q 'styles-a11y-v1.css?v=20260912-r5-3' /tmp/mf_body
grep -q 'privacy.html' /tmp/mf_body
grep -q 'account-deletion.html' /tmp/mf_body
grep -q 'offlineBanner' /tmp/mf_body
! grep -q 'auth-v5.js' /tmp/mf_body
check_200 "$BASE/mounty-guide-v1.js?v=20260912-r5-3"
grep -q 'Toda la comunidad' /tmp/mf_body
grep -q 'Un ciclo' /tmp/mf_body
grep -q 'Un grado' /tmp/mf_body
grep -q 'Un estudiante' /tmp/mf_body
grep -q 'Estudiantes seleccionados' /tmp/mf_body
grep -q "a.type==='single_student'" /tmp/mf_body
grep -q "type:'selected_students'" /tmp/mf_body
check_200 "$BASE/privacy.html?smoke=r5-3"
grep -q 'Política de privacidad' /tmp/mf_body
grep -q 'Datos que puede tratar la aplicación' /tmp/mf_body
check_200 "$BASE/account-deletion.html?smoke=r5-3"
grep -q 'Solicitud de eliminación de cuenta' /tmp/mf_body
grep -q 'mountain-account-deletion-public' /tmp/mf_body
check_200 "$BASE/styles-a11y-v1.css?smoke=r5-3"
grep -q ':focus-visible' /tmp/mf_body
grep -q 'prefers-reduced-motion' /tmp/mf_body
check_200 "$BASE/final-flow-v1.js?v=20260912-r5-3"
grep -q "\['broadcast','mountyCompose'\]" /tmp/mf_body
grep -q "a==='media'" /tmp/mf_body
check_200 "$BASE/sw.js?smoke=r5-3-principal-audit"
grep -q 'mountain-family-shell-r5-3-principal-audit-20260912' /tmp/mf_body
grep -q "'./styles-a11y-v1.css'" /tmp/mf_body
grep -q "'./account-controls-v1.js'" /tmp/mf_body
grep -q "'./privacy.html'" /tmp/mf_body
! grep -q "'./auth-v5.js'" /tmp/mf_body
for fn in mounty-compose mountain-media mounty-agent mounty-review mountain-thread mountain-account-deletion-request mountain-account-deletion-public; do check_cors "$fn"; done
echo 'LIVE_SMOKE_OK_R5_3_PRINCIPAL_AUDIT'