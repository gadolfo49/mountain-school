#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
EDGE='https://kbtjkjdjvkorekzzhxcx.supabase.co/functions/v1'
ORIGIN='https://gadolfo49.github.io'
check_200(){ local url="$1"; code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url"); test "$code" = '200'; }
check_cors(){
  local fn="$1"
  code=$(curl -sS -o /tmp/mf_cors_body -D /tmp/mf_cors_headers -w '%{http_code}' -X OPTIONS "$EDGE/$fn" \
    -H "Origin: $ORIGIN" \
    -H 'Access-Control-Request-Method: POST' \
    -H 'Access-Control-Request-Headers: authorization,apikey,content-type,x-client-info')
  test "$code" = '204'
  grep -qi '^access-control-allow-origin: https://gadolfo49.github.io' /tmp/mf_cors_headers
  grep -qi '^access-control-allow-methods: .*POST.*OPTIONS' /tmp/mf_cors_headers
  grep -qi '^access-control-allow-headers: .*authorization' /tmp/mf_cors_headers
}
check_200 "$BASE/?smoke=final-20260912-r4"
grep -q 'MF-FINAL-20260912-R4' /tmp/mf_body
grep -q 'mounty-guide-v1.js' /tmp/mf_body
grep -q 'teacher-experience-v1.js' /tmp/mf_body
grep -q 'notifications-v1.js' /tmp/mf_body
grep -q 'final-flow-v1.js' /tmp/mf_body
grep -q 'family-documents-v1.js' /tmp/mf_body
grep -q 'network-guard-v1.js' /tmp/mf_body
! grep -q 'auth-v5.js' /tmp/mf_body
check_200 "$BASE/admin-documents-v1.js?v=20260912-final-r4"
grep -q 'type="file"' /tmp/mf_body
grep -q 'prepare_document_upload' /tmp/mf_body
grep -q 'storage_path' /tmp/mf_body
grep -q 'Abrir archivo' /tmp/mf_body
check_200 "$BASE/family-documents-v1.js?v=20260912-final-r4"
grep -q 'signed_document_read' /tmp/mf_body
grep -q 'Abrir documento' /tmp/mf_body
check_200 "$BASE/network-guard-v1.js?v=20260912-final-r4"
grep -q 'unhandledrejection' /tmp/mf_body
grep -q 'La conexión se interrumpió' /tmp/mf_body
check_200 "$BASE/mounty-guide-v1.js?v=20260912-final-r4"
grep -q 'Mounty Guide' /tmp/mf_body
grep -q 'mounty-compose' /tmp/mf_body
grep -q 'Compartir evidencia' /tmp/mf_body
grep -q 'Toda la comunidad' /tmp/mf_body
grep -q 'Un ciclo' /tmp/mf_body
grep -q 'Un grado' /tmp/mf_body
grep -q 'Estudiantes seleccionados' /tmp/mf_body
grep -q '24 horas' /tmp/mf_body
check_200 "$BASE/teacher-experience-v1.js?v=20260912-final-r4"
grep -q 'Panel de maestra' /tmp/mf_body
grep -q 'mf_classroom_staff' /tmp/mf_body
grep -q 'Entrada / salida' /tmp/mf_body
check_200 "$BASE/notifications-v1.js?v=20260912-final-r4"
grep -q 'Preferencias de notificación' /tmp/mf_body
grep -q 'mf_notifications' /tmp/mf_body
check_200 "$BASE/final-flow-v1.js?v=20260912-final-r4"
grep -q "a==='broadcast'" /tmp/mf_body
grep -q "a==='media'" /tmp/mf_body
check_200 "$BASE/app-v3.js?v=20260912-final-r4"
grep -q 'Maternal' /tmp/mf_body
grep -q 'Infantes' /tmp/mf_body
grep -q 'Párvulos' /tmp/mf_body
grep -q 'Pre-Kínder' /tmp/mf_body
grep -q 'Kínder' /tmp/mf_body
grep -q 'Preprimario' /tmp/mf_body
check_200 "$BASE/access-v6.js?v=20260912-final-r4"
grep -q "'#authBack'" /tmp/mf_body
grep -q 'mountain-register-cors' /tmp/mf_body
check_200 "$BASE/sw.js?smoke=final-20260912-r4"
grep -q 'mountain-family-shell-final-20260912-r4' /tmp/mf_body
grep -q "'./network-guard-v1.js'" /tmp/mf_body
grep -q "'./family-documents-v1.js'" /tmp/mf_body
grep -q "'./teacher-experience-v1.js'" /tmp/mf_body
grep -q "'./notifications-v1.js'" /tmp/mf_body
grep -q "'./final-flow-v1.js'" /tmp/mf_body
! grep -q "'./auth-v5.js'" /tmp/mf_body

# Browser/iPhone preflight checks for every Edge Function used by Mounty Guide and documents.
check_cors mounty-compose
check_cors mountain-media
check_cors mounty-agent
check_cors mounty-review
check_cors mountain-thread

echo 'LIVE_SMOKE_OK_FINAL_R4_WITH_DOCUMENTS_AND_NETWORK_GUARD'