# صوت الخبر | Sawt Al Khabar

A multilingual automated newsroom starter for Arabic, Spanish and French.

## Selected editorial settings
- Publishing: Smart (routine stories may auto-publish; sensitive stories require review)
- Coverage: Morocco, Spain, France, International, Sports, Economy
- Volume: all qualifying important stories; no fixed daily cap
- Languages: ar, es, fr

## Stack
- Next.js App Router + TypeScript
- Supabase Postgres (public reading, server-only writes)
- RSS ingestion + OpenAI API for original summaries and translations
- Scheduled ingestion through GitHub Actions

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the credentials.
4. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
5. Run `npm run dev`.

## Required secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it to the browser)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (a model available to your API account)
- `CRON_SECRET`

For GitHub Actions, add `APP_BASE_URL` and `CRON_SECRET` as repository Actions secrets.

## Important launch checklist
- Review each feed's terms and permitted use before enabling it.
- Add only licensed/permissioned RSS/API sources.
- The ingestion pipeline uses feed metadata and short descriptions as research context; it does not copy full articles or reuse publisher images.
- Stories with sensitive subjects, weak corroboration, or uncertain facts go to review.
- Configure Supabase and deployment before expecting scheduled ingestion to run.
- This starter does not yet include a production admin login, domain, or a live news license.

## Deployment
Deploy the Next.js app to Vercel or another Node.js host, configure the environment variables, then enable the GitHub Actions workflow. The workflow calls the protected ingestion endpoint every 15 minutes.

## Editorial principle
Every published story should retain its source links and timestamps. AI output is a draft based on source facts, not an independent confirmation of truth.
