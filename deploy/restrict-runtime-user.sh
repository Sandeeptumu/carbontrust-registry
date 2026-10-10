#!/bin/bash
set -euo pipefail
# mysql image creates MYSQL_USER before this init hook. Restrict it to application DML.
[[ "$MYSQL_USER" =~ ^[a-zA-Z0-9_]+$ && "$MYSQL_DATABASE" =~ ^[a-zA-Z0-9_]+$ ]] || exit 1
MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot <<SQL
REVOKE ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* FROM '$MYSQL_USER'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'%';
SQL
