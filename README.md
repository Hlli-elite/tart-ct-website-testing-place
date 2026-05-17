# ⚔️ Tartaros — BTD6 Recruitment Site

## Editing content

All text on the site lives in the `content/` folder. You never need to touch `index.html`, `style.css`, or `js/app.js` just to update wording.

```
content/
├── site.json          ← clan icon, hero text, stat bar, recruiters, footer, webhook URL
├── about.json         ← about page text, pillars, values
├── perks.json         ← benefits page
├── join.json          ← join page text, form labels, success message
└── teams/
    ├── tartaros-main.json
    ├── the-hlls.json
    ├── tartaros-academy.json
    ├── tartaros-university.json
    ├── banana-battalion.json
    ├── tartaros-sanctum.json
    ├── banana-bunch.json
    ├── tartaros-sandbox.json
    ├── banana-blitz.json
    └── banana-brigade.json
```

---

## Common edits

### Change a team code
Open the relevant file in `content/teams/` and update `"code"`.

### Change a recruiter
Open `content/site.json` and edit the `recruiters` array.

### Update the webhook URL
Open `content/site.json` and update `"webhook_url"`.

### Edit team description or requirements
Open the relevant file in `content/teams/` and edit `"modal_desc"` or `"requirements"`.

### Add a new team
1. Create a new JSON file in `content/teams/` using an existing one as a template.
2. Open `js/app.js` and add the filename to the `teamFiles` array near the bottom of the file.
3. Set `"section"` to `"ct"` (shows in CT grid) or `"other"` (shows in Boss Rush & Seasonal grid).

### Remove a team
Remove its filename from the `teamFiles` array in `js/app.js`. The JSON file can stay.

### Change the 24-hour response time message
Open `content/join.json` and edit `"success_message"`.

---

## Running locally

Because the site fetches JSON files, you need a local server (browsers block `fetch()` on `file://`).

**Quickest option — Python:**
```bash
cd tartaros
python3 -m http.server 8080
# then open http://localhost:8080
```

**Or Node.js:**
```bash
npx serve .
```

---

## Deploying

The site is plain HTML/CSS/JS with no build step. Just push to GitHub and enable **GitHub Pages** (Settings → Pages → Deploy from branch → `main` / `root`). The site will be live at `https://yourusername.github.io/tartaros`.
