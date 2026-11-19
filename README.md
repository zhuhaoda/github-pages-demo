# haoda · Personal website

The public personal website at **https://haodazhu.com/**, hosted with GitHub Pages.

The site's published WordPress text, photographs, figures, captions, and PDF attachments were copied into static HTML on 2026-11-19. Original page and article permalinks are retained. The current site uses a simple responsive layout rather than the old WordPress theme or interactive effects.

## Contents

- Homepage: `index.html`
- About Me: `about-me/index.html`
- My Research: `blog/index.html`
- Essays: `随笔/index.html`
- All articles: `archive/index.html`
- Articles: original year/month/day/slug paths
- Local images and documents: `assets/images/` and `assets/files/`
- Shared styles: `assets/site.css`

The source contains 3 original pages and 16 original articles. The six pre-existing WordPress-hosted videos are retained as links; their video files were not copied. No comments, drafts, forms, WordPress scripts, tracking code, or private account data are included.

## Local preview

No build or dependencies are required to serve the website. From this directory:

```bash
python3 -u -m http.server 0 --bind 127.0.0.1
```

Open the address printed by the server. Stop it with Ctrl+C.

## Publishing

GitHub Pages publishes the `main` branch at its root. Preserve the `CNAME` file containing `haodazhu.com` and the `.nojekyll` file. Images and documents are served from this repository and do not depend on the WordPress hosting plan.

To add or update content, edit the corresponding HTML file, commit the change, and push to `main`. The one-time migration tooling and raw API snapshots are intentionally outside this public repository.
