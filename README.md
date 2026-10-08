# Zulfiqar Ali Nasir — Portfolio

Live at **https://zulfiali2.github.io**

A small web app with no framework, hosted on GitHub Pages.

## Features
- **Live site previews**: the hero browser cycles through real client websites with screenshots
- **Work wall**: filter 26 projects by industry, search by name or domain, open details with ← → navigation
- **Command palette**: press `Ctrl K` / `⌘K` or `/` to jump to any section, project or action
- **Project planner**: visitors pick site type, pages and extras, get a timeline and email the brief
- **Live status**: shows availability and the current time in Islamabad
- **Ask about me**: a chat that answers recruiter questions from the CV and project data. Works instantly in Quick answers mode; switches to real AI (Cloudflare Workers AI, free) once `worker/` is set up, see [worker/README.md](worker/README.md)
- **Speed scores, phone views, uptime**: a GitHub Action captures desktop and mobile screenshots, runs Google Lighthouse and rebuilds the AI's knowledge file every Monday
- Light and dark themes, mobile-friendly, respects reduced motion

## Edit the content
Everything (profile, projects, experience, skills) lives in **`data.js`**.
To add a project, copy one `{ ... }` block in `projects`, change it, commit. The site updates in about a minute.

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Design and themes |
| `app.js` | All features |
| `data.js` | All content (and chat settings) |
| `chat.js` | Ask about me chat |
| `knowledge.json` | Facts the AI may use (auto-built from data.js) |
| `worker/` | Cloudflare AI backend + setup guide |
| `Zulfiqar-Ali-Nasir-CV.pdf` | Downloadable CV |
