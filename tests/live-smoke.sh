#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
check_200(){ local url="$1"; code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url"); test "$code" = '200'; }
check_200 "$BASE/?smoke=final-20260912"
grep -q 'MF-FINAL-20260912' /tmp/mf_body
grep -q 'mounty-guide-v1.js' /tmp/mf_body
! grep -q 'auth-v5.js' /tmp/mf_body
check_200 "$BASE/mounty-guide-v1.js?v=20260912-final"
grep -q 'Mounty Guide' /tmp/mf_body
grep -q 'mounty-compose' /tmp/mf_body
grep -q 'Compartir evidencia' /tmp/mf_body
grep -q 'Toda la comunidad' /tmp/mf_body
grep -q 'Un ciclo' /tmp/mf_body
grep -q 'Un grado' /tmp/mf_body
grep -q 'Estudiantes seleccionados' /tmp/mf_body
grep -q '24 horas' /tmp/mf_body
check_200 "$BASE/app-v3.js?v=20260912-final"
grep -q 'Maternal' /tmp/mf_body
grep -q 'Infantes' /tmp/mf_body
grep -q 'Párvulos' /tmp/mf_body
grep -q 'Pre-Kínder' /tmp/mf_body
grep -q 'Kínder' /tmp/mf_body
grep -q 'Preprimario' /tmp/mf_body
check_200 "$BASE/access-v6.js?v=20260912-final"
grep -q "'#authBack'" /tmp/mf_body
grep -q 'mountain-register-cors' /tmp/mf_body
check_200 "$BASE/sw.js?smoke=final-20260912"
grep -q 'mountain-family-shell-final-20260912' /tmp/mf_body
! grep -q "'./auth-v5.js'" /tmp/mf_body
echo 'LIVE_SMOKE_OK_FINAL'