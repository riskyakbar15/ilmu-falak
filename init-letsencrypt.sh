#!/bin/sh
# Bootstrap sertifikat Let's Encrypt pertama kali.
# Jalankan sekali di VPS setelah mengisi .env:  ./init-letsencrypt.sh
set -e

if [ -f .env ]; then
  # shellcheck disable=SC1091
  . ./.env
fi

if [ -z "$DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ]; then
  echo "Isi DOMAIN dan CERTBOT_EMAIL di .env terlebih dahulu." >&2
  exit 1
fi

# Set STAGING=1 untuk uji coba (hindari rate limit Let's Encrypt).
STAGING="${STAGING:-0}"
staging_arg=""
[ "$STAGING" != "0" ] && staging_arg="--staging"

echo "### Membuat sertifikat sementara agar nginx bisa start ..."
docker compose run --rm --entrypoint "sh -c \
  'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
   openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
     -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
     -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
     -subj /CN=localhost'" certbot

echo "### Menjalankan nginx (dan web) ..."
docker compose up -d nginx

echo "### Menghapus sertifikat sementara ..."
docker compose run --rm --entrypoint "sh -c \
  'rm -rf /etc/letsencrypt/live/$DOMAIN \
          /etc/letsencrypt/archive/$DOMAIN \
          /etc/letsencrypt/renewal/$DOMAIN.conf'" certbot

echo "### Meminta sertifikat Let's Encrypt untuk $DOMAIN ..."
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot \
  $staging_arg \
  --email $CERTBOT_EMAIL \
  -d $DOMAIN \
  --rsa-key-size 2048 \
  --agree-tos \
  --no-eff-email \
  --force-renewal" certbot

echo "### Memuat ulang nginx ..."
docker compose exec nginx nginx -s reload

echo "Selesai. Jalankan: docker compose up -d"
echo "Situs aktif di https://$DOMAIN"
