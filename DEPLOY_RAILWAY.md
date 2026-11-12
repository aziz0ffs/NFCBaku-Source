# Railway deployment status

The PHP/Apache Docker image and Volume-aware startup are provided in `Dockerfile` and `deploy/railway/`. A private staging deployment was verified via Railway SSH: project `nfc-baku-staging`, service `nfc-baku`, GitHub source `aziz0ffs/NFCBaku-LinkStack`, persistent Volume mounted at `/data`. No public domain has been assigned. HTTP home/login/profile and static assets returned 200 over the container's loopback; sensitive paths returned 403. Authenticated login, external HTTPS, and upload writes are not yet tested. Do not expose the service publicly before the access and license checks below.

- Keep `.env`, `database/database.sqlite`, user-uploaded files under `assets/img/`, runtime `storage/` contents, and backups out of Git. Upload the existing `.env` and `database.sqlite` to the persistent Railway Volume at `/data/.env` and `/data/database/database.sqlite`. Preserve the original `APP_KEY`. The app's environment editor reads `.env` from the Volume; it is deliberately not baked into the image or imported wholesale into Railway Variables.
- Upload the current `assets/img/` to `/data/assets/img/` and `assets/linkstack/images/` to `/data/assets/linkstack/images/`, preserving the site avatar/favicon. The startup script links these paths and the runtime `storage/` to subdirectories of the same Volume; defaults are copied only if missing. Never mount an empty Volume on `/app`.
- Attach one Volume to the service at `/data`. Railway mounts it at runtime, not at build time. The startup script refuses to create a blank SQLite database and only starts after the real database and `.env` are present.
- Ensure `APP_ENV=production`, `APP_DEBUG=false`, `DB_CONNECTION=sqlite` in the uploaded `.env`. Keep the Volume and its backup access private. Set `PORT=8080` in Railway Variables. Configure the external HTTPS URL/proxy settings after a domain is assigned; verify generated links, cookies, redirects, login, uploaded images, and sensitive-file denial on the deployed URL.
- The local `start-local.sh`/`php -S` is not used for Railway. Enable regular Volume backups, and test restoration of database and images together. Do not regenerate `APP_KEY` when restoring existing data.

Upstream LinkStack is distributed under AGPL-3.0 (see `LICENSE`). Before serving this modified version publicly, arrange a way for users to obtain its corresponding source, including modifications; a private GitHub repository alone is not a public source offer.

Railway documentation: https://docs.railway.com/volumes and https://docs.railway.com/guides/laravel
