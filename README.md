# 2026 World Cup Predictions

Nuxt 4 web app for the 2026 FIFA World Cup with live predictions, group standings,
match prediction, and a knockout bracket with dynamic championship probabilities.

## Local development

```bash
pnpm install
cp .env.example .env  # fill in FOOTBALL_DATA_API_KEY
pnpm dev
```

## Tests

```bash
pnpm test
pnpm typecheck
```

## Deploy to Vercel

1. Push to GitHub.
2. Import repo on Vercel (Hobby tier is enough).
3. Set environment variables:
   - `FOOTBALL_DATA_API_KEY` — get one at https://www.football-data.org/client/register
   - `CRON_SECRET` — random string; passed as `Authorization: Bearer ...` by Vercel cron
4. Add the Vercel KV integration from the Vercel dashboard → Storage → KV.
5. Deploy. Cron job will run at 02:00 / 09:00 / 14:00 / 22:00 UTC.
# WroldCup2026
