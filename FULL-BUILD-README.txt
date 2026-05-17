Project Calyx Hosted Baseline

What this is
- This folder is the canonical Calyx app baseline.
- Source lives in `src/`.
- Deployable frontend output is generated into `dist/`.
- Future hosting and sync should come from this one folder, not from parallel zip copies.

Trusted local command
- From the project root, run:
  npm run stable
- App URL:
  http://127.0.0.1:8787

What `npm run stable` does
1. Rebuilds `dist/` from `src/`
2. Starts the stable server
3. Waits for `/api/health`
4. Opens the browser only after the app is actually ready

Supported build and package commands
- Rebuild frontend output:
  npm run build
- Create a shareable hosted-baseline zip:
  npm run package:static

Important notes
- `dist/` is generated output. Do not edit it by hand.
- `npm run dev` is secondary and not the trusted runtime path.
- `npm run preview` is intentionally blocked.
- Current backend mode is placeholder unless a real key/config is added later.

Hosting
- `render.yaml` is included for Render deployment from a Git-backed repo.
- `Dockerfile` is included for container-based hosting.
- The intended long-term flow is:
  one repo -> one host -> one public URL
