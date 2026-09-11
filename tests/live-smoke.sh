#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
SUPA='https://kbtjkjdjvkorekzzhxcx.supabase.co'
KEY='sb_publishable_4uce_DqQ7LpVOSnGAGnfmA_ZXEUWofq'

check_200(){
  local url="$1"
  code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url")
  test "$code" = '200'
}

check_200 "$BASE/?smoke=20260911"
grep -q 'auth-v5.js?v=20260910-9' /tmp/mf_body
grep -q 'MF-20260910.9' /tmp/mf_body
check_200 "$BASE/auth-v5.js?v=20260910-9"
grep -q 'mountain-admin-pin' /tmp/mf_body
check_200 "$BASE/app-v3.js?v=20260910-9"
check_200 "$BASE/sw.js?smoke=20260911"
grep -q 'mountain-family-shell-v7' /tmp/mf_body
check_200 "$BASE/manifest.webmanifest?v=20260910-9"

code=$(curl -sS -o /tmp/pin_body -w '%{http_code}' -X POST "$SUPA/functions/v1/mountain-admin-pin" -H 'Content-Type: application/json' -H "apikey: $KEY" --data '{"pin":"123"}')
test "$code" = '400'
grep -q '4 dígitos' /tmp/pin_body

code=$(curl -sS -o /tmp/register_body -w '%{http_code}' -X POST "$SUPA/functions/v1/mountain-register" -H 'Content-Type: application/json' -H "apikey: $KEY" --data '{"email":"invalid","password":"12345678","full_name":"Smoke Test","requested_role":"family"}')
test "$code" = '400'
grep -q 'Correo inválido' /tmp/register_body

echo 'LIVE_SMOKE_OK'