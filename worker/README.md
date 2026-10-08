# "Ask about me" AI backend — setup (about 10 minutes, free)

The chat on the portfolio works straight away in **Quick answers** mode (no AI, answers built from `data.js`).
Follow these steps once to switch it to **real AI answers**, powered by Cloudflare Workers AI (free: 10,000 neurons/day ≈ 75 questions/day).

## 1. Create a free Cloudflare account
Go to https://dash.cloudflare.com/sign-up and sign up. No card is needed.

## 2. Create the Worker
1. In the dashboard: **Compute (Workers) → Workers & Pages → Create → Create Worker** (start from "Hello World").
2. Name it `ask-zulfiqar` and click **Deploy**.
3. Click **Edit code**. Delete everything in `worker.js`, paste in the whole of [`worker.js`](worker.js) from this folder, and click **Deploy**.

## 3. Connect the AI
1. Open the Worker → **Settings → Bindings → Add → Workers AI**.
2. Variable name: `AI` (capitals). Save, then **Deploy** again if asked.

## 4. Test it
Open your Worker's address, e.g. `https://ask-zulfiqar.<your-name>.workers.dev/`.
You should see: `{"ok":true,"service":"ask-zulfiqar",...}`

## 5. Point the portfolio at it
In `data.js`, set:
```js
chat: { endpoint: "https://ask-zulfiqar.<your-name>.workers.dev/chat", ... }
```
Commit. The chat badge changes from **Quick answers** to **AI**.

## How it stays safe
- The AI key never leaves Cloudflare; the website only calls your Worker.
- Only `https://zulfiali2.github.io` may use it (see `ALLOWED_ORIGINS`).
- Each visitor is limited to 30 questions an hour; questions are capped at 500 characters.
- The AI may only use facts from `knowledge.json`, which the GitHub Action rebuilds from `data.js`. Update `data.js` and the AI knows within an hour.
- If the free daily limit runs out, the website quietly switches to Quick answers.
