# thousif-ask: the lab's free "ask about me" endpoint

A Cloudflare Worker that answers visitor questions using **only** `src/content/content.json`
(bundled at deploy time) and a free Workers AI model. No API keys, no secrets.

## Deploy (once)

```bash
cd worker
npx wrangler login      # opens the browser; use your Cloudflare account
npx wrangler deploy     # prints https://thousif-ask.<your-subdomain>.workers.dev
```

Quick test (the Worker only accepts calls whose `Origin` is in `ALLOWED_ORIGINS`):

```bash
curl -s -X POST https://thousif-ask.<your-subdomain>.workers.dev \
  -H "content-type: application/json" -H "origin: https://thousifshaik.com" \
  -d '{"question":"What is ANTA?"}'
```

Then in the GitHub repo: **Settings → Secrets and variables → Actions → Variables → New**:
`ASK_URL` = the Worker URL. Re-run the "Build and deploy portfolio" workflow.

## Keeping answers current

The profile is baked into the Worker. After you change `src/content/content.json`, run
`npx wrangler deploy` again in `worker/`.

## Limits and safety

- Free allowance: 10,000 Neurons/day across Workers AI. With the profile in every request that is
  roughly 20 Neurons per question, so a few hundred questions a day (estimate). After that the
  free plan simply stops answering; it does not bill. The site falls back to its normal search.
- If the first model is refused on the free plan (error 5035 / HTTP 403), the Worker tries
  `FALLBACK_MODEL`. You can change both in `wrangler.toml`.
- The per-IP limiter is best-effort (it lives in one Worker instance). The origin check stops other
  websites in browsers, not scripts. Neither is a hard guarantee, which is why the free-tier cap matters.
- The model is told to answer only from the profile and to say so when it doesn't know. Small models
  can still slip, which is why the site labels answers as AI-generated.
