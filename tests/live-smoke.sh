#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
EDGE='https://kbtjkjdjvkorekzzhxcx.supabase.co/functions/v1'
ORIGIN='https://gadolfo49.github.io'
check_200(){ local url="$1"; code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url"); test "$code" = '200'; }
check_cors(){ local fn="$1"; code=$(curl -sS -o /tmp/mf_cors_body -D /tmp/mf_cors_headers -w '%{http_code}' -X OPTIONS "$EDGE/$fn" -H "Origin: $ORIGIN" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,apikey,content-type,x-client-info'); test "$code" = '204'; grep -qi '^access-control-allow-origin: https://gadolfo49.github.io' /tmp/mf_cors_headers; grep -qi '^access-control-allow-methods: .*POST.*OPTIONS' /tmp/mf_cors_headers; }
check_410(){ local fn="$1"; code=$(curl -sS -o /tmp/mf_retired -w '%{http_code}' -X POST "$EDGE/$fn" -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -H 'apikey: sb_publishable_4uce_DqQ7LpVOSnGAGnfmA_ZXEUWofq' --data '{}'); test "$code" = '410'; }
check_200 "$BASE/?smoke=r5-5-managed-access"
grep -q 'MF-R5.5-MANAGED-ACCESS-20260912' /tmp/mf_body
grep -q '@supabase/supabase-js@2.116.0' /tmp/mf_body
grep -q 'access-v6.js?v=20260912-r5-5' /tmp/mf_body
grep -q 'admin-users-v1.js?v=20260912-r5-5' /tmp/mf_body
grep -q 'account-controls-v1.js?v=20260912-r5-5' /tmp/mf_body
grep -q 'mounty-guide-v1.js?v=20260912-r5-3' /tmp/mf_body
grep -q 'styles-a11y-v1.css?v=20260912-r5-3' /tmp/mf_body
grep -q 'privacy.html' /tmp/mf_body
grep -q 'account-deletion.html' /tmp/mf_body
grep -q 'offlineBanner' /tmp/mf_body
grep -q 'assets/mountain-logo-192.png' /tmp/mf_body
! grep -q 'signup-family' /tmp/mf_body
! grep -q 'Registrarme como familia' /tmp/mf_body
! grep -q 'auth-v5.js' /tmp/mf_body
check_200 "$BASE/admin-users-v1.js?v=20260912-r5-5"
grep -q "action:'create'" /tmp/mf_body
grep -q "action:'reset_password'" /tmp/mf_body
grep -q "action:'revoke_access'" /tmp/mf_body
grep -q 'tempPassword' /tmp/mf_body
check_200 "$BASE/access-v6.js?v=20260912-r5-5"
grep -q 'must_change_password' /tmp/mf_body
grep -q 'Crea tu contraseña personal' /tmp/mf_body
! grep -q 'mountain-register-cors' /tmp/mf_body
check_200 "$BASE/account-controls-v1.js?v=20260912-r5-5"
grep -q 'Cambiar contraseña' /tmp/mf_body
grep -q 'auth.updateUser' /tmp/mf_body
check_200 "$BASE/mounty-guide-v1.js?v=20260912-r5-3"
grep -q 'Toda la comunidad' /tmp/mf_body
grep -q 'Un ciclo' /tmp/mf_body
grep -q 'Un grado' /tmp/mf_body
grep -q 'Un estudiante' /tmp/mf_body
grep -q 'Estudiantes seleccionados' /tmp/mf_body
check_200 "$BASE/privacy.html?smoke=r5-5"
grep -q 'Política de privacidad' /tmp/mf_body
check_200 "$BASE/account-deletion.html?smoke=r5-5"
grep -q 'Solicitud de eliminación de cuenta' /tmp/mf_body
check_200 "$BASE/styles-a11y-v1.css?smoke=r5-5"
grep -q ':focus-visible' /tmp/mf_body
check_200 "$BASE/sw.js?smoke=r5-5"
grep -q 'mountain-family-shell-r5-5-managed-access-20260912' /tmp/mf_body
grep -q "'./assets/mountain-logo-512.png'" /tmp/mf_body
! grep -q "'./auth-v5.js'" /tmp/mf_body
for fn in mounty-compose mountain-media mounty-agent mounty-review mountain-thread mountain-account-deletion-request mountain-account-deletion-public mountain-admin-users; do check_cors "$fn"; done
check_410 mountain-register-cors
echo 'LIVE_SMOKE_OK_R5_5_MANAGED_ACCESS'