# Project Calyx

This folder is the canonical hosted baseline for Calyx.

## Source of truth

- Edit source in `src/`
- Generate deployable frontend files with `npm run build`
- Serve the generated frontend plus API together with `npm run stable`
- Do not hand-edit `dist/`

`dist/` is generated output. It is temporary and rebuildable.

## Trusted local command

Run this from the project root:

```bash
npm run stable
```

App URL:

```text
http://127.0.0.1:8787
```

What it does:

1. Rebuilds `dist/` from `src/`
2. Starts the stable server
3. Opens the browser after the health check succeeds

## Supported build and package commands

Rebuild the hosted frontend:

```bash
npm run build
```

Create a shareable hosted-baseline zip in `/workspace/output`:

```bash
npm run package:static
```

## Secondary paths

`npm run dev` is still available for source experimentation, but it is not the trusted runtime path.

`npm run preview` is intentionally blocked.

`npm run preview:dist-only` exists only for quick static inspection of the generated `dist/` folder.

## Hosting

This repo is prepared for source-controlled hosting:

- `render.yaml` for Render deployment from a Git-backed repo
- `Dockerfile` for any container-based host

Default hosting shape:

1. Push this folder to one Git repository
2. Connect that repository to your host
3. Let the host run `npm ci && npm run build`
4. Let the host start with `npm start`

## API state

The backend still defaults to placeholder mode.

The main health endpoint is:

```text
GET /api/health
```

The execution endpoint is:

```text
POST /api/run-agent
```

## Asset folder

Put generated sprite PNGs here:

```text
public/assets/command-center/
```

Required filenames:

```text
sprite_pixelphaze.png
sprite_signalsage.png
sprite_templatefox.png
sprite_cudapunk.png
sprite_taskmoth.png
sprite_bosscat.png
sprite_kindknife.png
sprite_plainjane.png
sprite_chartmonk.png
sprite_botboi.png
sprite_scrublord.png
sprite_patchbyte.png
```
