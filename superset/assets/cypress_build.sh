#!/bin/bash
set -e

superset/bin/superset db upgrade
superset/bin/superset load_test_users
superset/bin/superset load_examples
superset/bin/superset init
superset/bin/superset runserver &

cd "$(dirname "$0")"

echo "TEST BUILD"
echo $TEST_ENV
yarn install --frozen-lockfile
npm run build
npm run cypress run -- --record
kill %1
