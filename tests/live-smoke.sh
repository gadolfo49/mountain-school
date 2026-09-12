#!/usr/bin/env bash
set -euo pipefail
BASE='https://gadolfo49.github.io/mountain-school'
check_200(){ local url="$1"; code=$(curl -L -sS -o /tmp/mf_body -w '%{http_code}' "$url"); test "$code" = '200'; }
check_200 "$BASE/?smoke=20260912-17"
grep -q 'MF-20260912.17' /tmp/mf_body
grep -q 'app-v3.js' /tmp/mf_body
grep -q 'admin-gate.js' /tmp/mf_body
grep -q 'access-v6.js' /tmp/mf_body
grep -q 'admin-users-v1.js' /tmp/mf_body
grep -q 'admin-data-v1.js' /tmp/mf_body
grep -q 'admin-documents-v1.js' /tmp/mf_body
grep -q 'school-admin-v1.js' /tmp/mf_body
grep -q 'academic-v2.js' /tmp/mf_body
check_200 "$BASE/app-v3.js?v=20260911-10"
grep -q 'Maternal' /tmp/mf_body
grep -q 'Infantes' /tmp/mf_body
grep -q 'Párvulos' /tmp/mf_body
grep -q 'Pre-Kínder' /tmp/mf_body
grep -q 'Kínder' /tmp/mf_body
grep -q 'Preprimario' /tmp/mf_body
grep -q 'all_families' /tmp/mf_body
grep -q 'selected_students' /tmp/mf_body
grep -q 'type="file"' /tmp/mf_body
check_200 "$BASE/admin-users-v1.js?v=20260912-16"
grep -q 'Asignar grados' /tmp/mf_body
grep -q 'Cuenta administrativa principal protegida' /tmp/mf_body
check_200 "$BASE/admin-data-v1.js?v=20260912-14"
grep -q 'Registrar pago' /tmp/mf_body
grep -q 'Agregar persona autorizada' /tmp/mf_body
check_200 "$BASE/admin-documents-v1.js?v=20260912-15"
grep -q 'Nuevo documento' /tmp/mf_body
check_200 "$BASE/school-admin-v1.js?v=20260912-16"
grep -q 'Agregar estudiante' /tmp/mf_body
grep -q 'Nueva planificación' /tmp/mf_body
check_200 "$BASE/academic-v2.js?v=20260912-17"
grep -q 'Matemáticas' /tmp/mf_body
grep -q 'Lectoescritura' /tmp/mf_body
grep -q 'Inglés' /tmp/mf_body
check_200 "$BASE/sw.js?smoke=20260912-17"
grep -q 'mountain-family-shell-v12' /tmp/mf_body
echo 'LIVE_SMOKE_OK_V17'