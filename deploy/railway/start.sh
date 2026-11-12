#!/bin/sh
set -eu

: "${RAILWAY_VOLUME_MOUNT_PATH:?Attach a persistent Railway Volume before starting}"
DATA="$RAILWAY_VOLUME_MOUNT_PATH"

mkdir -p "$DATA/database" "$DATA/assets/img/background-img" "$DATA/assets/linkstack/images" \
    "$DATA/storage/framework/cache/data" "$DATA/storage/framework/sessions" \
    "$DATA/storage/framework/views" "$DATA/storage/logs" "$DATA/storage/app"

# Copy bundled defaults once. Existing user data on the Volume is never replaced.
cp -an /app/assets/img/. "$DATA/assets/img/"
cp -an /app/assets/linkstack/images/. "$DATA/assets/linkstack/images/"
cp -an /app/storage/. "$DATA/storage/"

rm -rf /app/assets/img /app/assets/linkstack/images /app/storage
ln -s "$DATA/assets/img" /app/assets/img
ln -s "$DATA/assets/linkstack/images" /app/assets/linkstack/images
ln -s "$DATA/storage" /app/storage

DB_PATH="$DATA/database/database.sqlite"
if [ ! -s "$DB_PATH" ]; then
    echo 'No existing SQLite database on the persistent Volume. Upload database.sqlite before starting; refusing to create a blank replacement.' >&2
    exit 1
fi
if [ ! -s "$DATA/.env" ] || ! grep -q '^APP_KEY=base64:' "$DATA/.env"; then
    echo 'The existing .env with APP_KEY must be uploaded to the persistent Volume before starting.' >&2
    exit 1
fi

# The app reads .env via EnvEditor, so preserve the existing settings and APP_KEY.
# Never bake this file or the database into the Git repository or Docker image.
ln -sfn "$DB_PATH" /app/database/database.sqlite
ln -sfn "$DATA/.env" /app/.env
touch "$DATA/storage/app/ISINSTALLED"
chown -R www-data:www-data "$DATA" /app/bootstrap/cache

sed -i 's/^Listen 80$/Listen 8080/' /etc/apache2/ports.conf
# Some container runtimes enable an additional Apache MPM; mod_php requires prefork only.
a2dismod -q mpm_event mpm_worker || true
a2enmod -q mpm_prefork
apache2ctl configtest
exec apache2-foreground
