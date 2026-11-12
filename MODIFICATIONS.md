# NFC Baku modifications to LinkStack 4.8.8

This is a modified deployment of LinkStack 4.8.8, distributed with its original `LICENSE` (GNU AGPL version 3). It is not a new upstream release and the original project remains at https://linkstack.org/.

Main changes in this corresponding source:

- NFC Baku presentation: visible application branding, translated strings, page assets and a custom site logo; structural LinkStack identifiers remain for compatibility. The Turab public profile has an individually scoped responsive visual design without changing its account record, credentials, avatar, links or permissions.
- Bundled custom themes, including Galaxy animation adjustments and other theme assets.
- Local development router (`server.php`), guarded file access, administrative security-probe and notification fixes, request timeout and output handling, and version comparison corrections.
- Railway Dockerfile, Apache routing/security configuration, startup script and instructions for keeping SQLite, images and the application environment on a persistent Volume.
- An AGPL source link in public page footers.

The repository is the corresponding source for the code and configuration used to build the application. It deliberately excludes user data, `.env` secrets, SQLite database contents, uploads, cache, logs and dependency binaries (`vendor/`). Dependencies are specified in `composer.json` and `composer.lock`; build instructions are in `Dockerfile` and `DEPLOY_RAILWAY.md`.

When deploying another revision, publish the matching revision here before exposing it to visitors.
