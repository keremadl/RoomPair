#!/usr/bin/env bash
# Builds the schema on a throwaway PostgreSQL database and runs the policy
# tests against it. Needs psql and a server you can create databases on:
#
#   DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres supabase/tests/run-local.sh
set -euo pipefail
cd "$(dirname "$0")/.."

admin_url="${DATABASE_URL:-postgres:///postgres}"
database="roompair_test_$$"
run() { psql -X -q -v ON_ERROR_STOP=1 "$@"; }

run "$admin_url" -c "create database $database"
trap 'psql -X -q "$admin_url" -c "drop database if exists $database" >/dev/null' EXIT
test_url="$(printf '%s' "$admin_url" | sed -E "s#/[^/?]*(\?.*)?\$#/$database\1#")"

run "$test_url" -f tests/local-stub.sql
for migration in migrations/*.sql; do run "$test_url" -f "$migration"; done
run "$test_url" -f seed.sql
run "$test_url" -f seed.sql # the seed must be safe to repeat
run "$test_url" -At -c "select count(*) || ' demo profiles, ' || (select count(*) from public.rooms) || ' rooms' from public.profiles where is_demo"
run "$test_url" -At -f tests/policies.sql
