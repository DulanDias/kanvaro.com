#!/bin/sh
set -e

# Replace NEXT_PUBLIC_ placeholders with actual environment values
printenv | grep NEXT_PUBLIC_ | while IFS='=' read -r key value; do
  echo "Replacing placeholder $key with runtime value..."
  find /app/.next -type f -exec sed -i "s|$key|$value|g" {} \;
done

exec "$@"