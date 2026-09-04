# Feng Nengyu · Learning Lab

The public learning site is generated from Markdown, YAML, existing notes, and verified learning evidence.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Before publishing, run:

```bash
npm run typecheck
npm run build
```

The static export is written to `out/`. GitHub Actions deploys that directory to GitHub Pages on pushes to `main`.

Content lives in `content/`; existing repository notes in `../notes/` are included as legacy notes without rewriting them.
