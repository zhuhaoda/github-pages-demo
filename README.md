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

The archive distinguishes four peer-reviewed publications and one arXiv preprint, research and engineering projects, research notes, and personal essays. FAST-LIVO-RS is listed as a published RA-L 2026 paper with its official DOI and a clean accepted-author PDF. DALIO's published paper and the original design notes have separate entries. Publication titles, authors, venues, and DOIs were checked against publisher-deposited Crossref records and the available paper; shared first authorship for the data-driven CDPR paper follows the owner's explicit confirmation.

Selected Work contains FAST-LIVO-RS and DALIO, in that order. Projects shows only the cable-driven humanoid arm, ROBOCON 2022, and Safe RL for mobile robots; other research records remain in the archive. Social links use the owner’s Google Scholar, LinkedIn, and GitHub profiles. The photo gallery preserves natural image ratios in a responsive multi-column layout, and the experience timeline uses explicit year/content columns with a stacked mobile layout.

Each Selected Work entry includes an original research visualization: FAST-LIVO-RS Figure 4, the complete DALIO Figure 1 without its below-figure caption, and the original multi-LiDAR point-cloud image. The homepage badge above the name is removed; the FAST-LIVO-RS publication remains available. Experience is limited to PhD in robotics (2024–2028) and Robospectra (Strutt) (2023–2026), with the owner's founding-member and SLAM-team-lead role.

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
