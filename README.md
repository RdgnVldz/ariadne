# Ariadne

> Your thread through the job search.

[![CI](https://github.com/RdgnVldz/ariadne/actions/workflows/ci.yml/badge.svg)](https://github.com/RdgnVldz/ariadne/actions/workflows/ci.yml)

Ariadne is a full-stack web app that turns one master profile into a tailored, ATS-friendly resume and cover letter for every job you apply to, and keeps track of each application. AI writes the drafts. Code decides what is allowed to reach the page.

**Live app:** [your-live-url](https://ariadne-swart.vercel.app/)
Sign-ups are invitation only, to keep AI costs under control. The screenshots below show the main flow.


![Home page](docs/screenshots/home.png)
![Job analysis](docs/screenshots/analysis.png)
![Tailored resume](docs/screenshots/resume.png)
![Application tracker](docs/screenshots/tracker.png)


The name comes from Greek myth: Ariadne gave Theseus a thread so he could find his way out of the labyrinth. The logo and the home page animation are that thread.

## What it does

1. **Master profile.** Store your contact details, summary, work experience, projects, education, and skills once.
2. **Job analysis.** Paste a job posting. Ariadne extracts the requirements, compares them to your profile, and gives a fit score with evidence for every requirement and a list of keywords your profile is missing.
3. **Tailored resume.** Generate a resume for that specific posting. It is a single-column document with standard section headings, which is what applicant tracking systems parse best. A built-in ATS check and a plain-text view show how a parser would read it.
4. **Cover letter.** Generate a letter from the posting and your real experience, then edit it.
5. **Export.** Download the resume or letter as a Word file (.docx), or save either as a PDF from a print-optimized layout.
6. **Application tracker.** Move each job through Saved, Applied, Interviewing, Offer, and Rejected, with notes, a link to the posting, an applied date, a follow-up date, and a history of stage changes.

## How the AI is kept honest

A resume is a document where an invented detail can cost someone an offer. So the model is never trusted to write facts.

```mermaid
flowchart LR
  P[Master profile<br/>from the database] --> M[Claude<br/>structured output]
  J[Job posting] --> M
  M --> S[Code checks<br/>drop unsupported claims]
  S --> D[Resume and<br/>cover letter]
  D --> E[Word and PDF]
```

- **Facts come from the database.** Employers, job titles, dates, education, and contact details are copied from your profile. The model only rewrites and reorders bullets, writes a headline and summary, and chooses which projects and skills to show.
- **Every work experience always appears.** The model cannot hide a job or create a gap in your history.
- **Output is checked before it is saved.** References to things that are not in your profile are dropped, skills you never listed are removed, and any bullet or sentence containing a number that is not in your own text is removed. Everything removed is shown to you.
- **The model judges, code scores.** For job analysis, Claude marks each requirement as a strong, partial, or missing match. The fit score is plain arithmetic in code (required items weigh three times more than preferred ones), so it is consistent and unit tested.
- **Structured output.** The Claude API is given a schema and returns data that matches it, so nothing is parsed from free text.
- **Untrusted input.** The job posting is treated as data, never as instructions.

These checks catch invented metrics and invented skills. They cannot catch every exaggeration in a reworded sentence, so you should read the result before sending it.

## Why there is no auto-apply

Many job platforms prohibit bots and automated tools in their terms, and the fastest way to lose an account is to automate applications. Ariadne prepares the application and leaves submitting it to you.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Docker locally, Neon in production) with Drizzle ORM |
| Auth | Better Auth (email and password) |
| Validation | Zod |
| AI | Anthropic Claude API with structured outputs |
| Word export | docx |
| Tests | Vitest, Testing Library, integration tests against a real Postgres |
| CI | GitHub Actions with a Postgres service |
| Hosting | Vercel and Neon |

## Design decisions

- **Every query is scoped to the signed-in user.** Server actions and API routes check the session themselves, and the data layer filters by user id. Integration tests prove that one user cannot read, change, or delete another user's data.
- **All form input is validated on the server** with Zod. Links must be http or https, so a `javascript:` link cannot be saved.
- **Multi-step writes use transactions.** A stage change and its history entry are saved together, so the history can never disagree with the current stage.
- **Cost controls.** Sign-ups are restricted by an allow list, each user has a daily limit on analyses, resumes, and letters, and the production API key has a spend limit set in the Claude Console.
- **Real tests, not mocks, for data.** The data layer is tested against PostgreSQL in a separate database, locally and in CI.
- **Cache Components.** Pages read the session inside Suspense boundaries, so a static shell streams first and personal data follows.
- **Secrets stay in the environment.** API keys and database URLs live in environment variables, never in the code or the repository.

## Getting started

### Prerequisites

- Node.js 22 or newer
- Docker Desktop
- An [Anthropic API key](https://platform.claude.com) for the AI features

### Setup

```bash
git clone https://github.com/RdgnVldz/ariadne.git
cd ariadne
npm install
```

Start the local database (it listens on port 5434):

```bash
docker compose up -d
```

Create your environment file:

```bash
# macOS or Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Fill in `.env.local`. Generate the auth secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Create the tables and start the app:

```bash
npm run db:migrate
npm run dev
```

Open http://localhost:3000, create an account, fill in your profile, and paste a job posting.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. Locally: `postgres://ariadne:ariadne_dev@localhost:5434/ariadne` |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign sessions. Generate a new one for each environment. |
| `BETTER_AUTH_URL` | Yes | The app's address, for example `http://localhost:3000` |
| `ANTHROPIC_API_KEY` | For AI features | Your Claude API key |
| `ANTHROPIC_MODEL` | No | Overrides the default model, `claude-haiku-5-5` |
| `ALLOWED_EMAILS` | In production | Comma-separated emails allowed to sign up. `*` allows everyone. When empty in production, all sign-ups are blocked. |
| `TEST_DATABASE_URL` | No | Test database. Defaults to the local `ariadne_test` database. |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm test` | Run all tests |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Testing

Tests use Vitest. Integration tests run against a separate PostgreSQL database named `ariadne_test`, so they never touch your development data. Migrations are applied to it automatically before the tests start.

Create the test database once:

```bash
docker compose exec db psql -U ariadne -d postgres -c "create database ariadne_test;"
```

Then run:

```bash
npm test
```

The AI calls are not exercised in tests, because they cost money and are not deterministic. The logic around them (validation, sanitizing, scoring, document building) is unit tested.

GitHub Actions runs lint, type checking, tests (with a Postgres service), and a production build on every push and pull request.

## Deployment

Ariadne runs on Vercel with a Neon Postgres database.

1. Create a Neon project and copy two connection strings. Use the **pooled** one (the host contains `-pooler`) for the app, and the **direct** one for migrations.
2. Run the migrations against Neon, using the direct string for this one command:

   ```powershell
   $env:DATABASE_URL = Read-Host "Paste the DIRECT Neon URL"
   npm run db:migrate
   Remove-Item Env:DATABASE_URL
   ```

3. Import the repository in Vercel and set `DATABASE_URL` (pooled), `BETTER_AUTH_SECRET` (a new value), `BETTER_AUTH_URL` (the production address), `ANTHROPIC_API_KEY` (a separate production key with a spend limit), and `ALLOWED_EMAILS`.
4. Set the function region close to the database, then redeploy.

Pushes to `main` deploy automatically.

## Project structure

```text
src/
  app/             Routes and server actions
    api/           Auth endpoint and Word download endpoints
    jobs/          Job analysis, resume, and cover letter pages
    profile/       Master profile pages
    tracker/       Application tracker
  components/      Shared UI components
  db/              Drizzle schema
  lib/             Business logic: validation, scoring, document building,
                   AI calls, data access
tests/             Test setup (runs migrations before the tests)
drizzle/           Generated SQL migrations
```

## Known limitations and roadmap

- PDF output comes from the browser's print dialog, using a print-optimized layout. A server-side PDF export is a possible later step.
- Dates are shown in one fixed time zone. A per-user setting would replace it.
- Sign-in does not work on Vercel preview deployments until their addresses are added to the trusted origins.
- Planned: a dashboard with follow-ups due and recent activity, end-to-end browser tests, and a browser extension that autofills application forms while you review and submit them yourself.

## Author

Built by [Rodgen Valdez](https://github.com/RdgnVldz).