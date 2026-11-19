# Haoda Zhu · Robotics & SLAM

The public personal website at **https://haodazhu.com/**, hosted with GitHub Pages.

The site's original published text, photographs, figures, captions, and PDF attachments are preserved. On 2026-11-19 the presentation was redesigned using [siqi.app](https://siqi.app/) as the layout reference: Geist typography, a soft blue gradient, a floating navigation capsule, light/dark themes, and separate research and writing archives.

## Contents

- Homepage: `index.html`
- About: `about/index.html`
- Publications: `publication/index.html`
- Engineering projects and research notes: `projects/index.html`
- Personal writing: `writing/index.html`
- Searchable archive: `archive/index.html`
- Original articles: original year/month/day/slug paths, also available at their new archive routes
- Local images and documents: `assets/images/` and `assets/files/`
- Shared styles: `assets/site.css`
- Theme and client-only filtering: `assets/theme-init.js` and `assets/site.js`
- Self-hosted Geist font and its SIL Open Font License: `assets/fonts/`

The archive distinguishes three verified publications, two engineering projects, research notes, and personal essays. DALIO's published paper and the original design notes have separate entries. Publication titles, authors, venues, and DOIs were checked against publisher-deposited Crossref records and the available paper.

All 16 original articles and their inline images are retained. The old About/Research/Writing pages remain as readable legacy archives. Old WordPress upload paths are also preserved, including the DALIO PDF URL used by external citations.

The six original WordPress videos remain external links; their video files were not copied. There are no comments, drafts, WordPress scripts, analytics, or private account data. Search and category filters run locally in the browser. Only the light/dark theme preference is saved in localStorage.

## Local preview

No build or dependencies are required to serve the website. From this directory:

```bash
python3 -u -m http.server 0 --bind 127.0.0.1
```

Open the address printed by the server. Stop it with Ctrl+C.

## Publishing

GitHub Pages publishes the `main` branch at its root. Preserve the `CNAME` file containing `haodazhu.com` and the `.nojekyll` file. Images and documents are served from this repository and do not depend on the WordPress hosting plan.

To add or update content, edit the corresponding HTML file, commit the change, and push to `main`. The one-time migration tooling and raw API snapshots are intentionally outside this public repository.
