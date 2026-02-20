# MSME Loan Portal Web (Admin and Loan Officer)

Frontend web app for MSME loan operations, built with React + TypeScript + Vite.

## What This App Covers
- Admin portal: dashboard, applications/workload, products, officers/admins, audit logs, settings.
- Loan officer portal: dashboard, applications, documents, payments, payment history, settings.
- Role/permission guards and 2FA login flow.

For detailed implementation/testing coverage, see `readmes/FEATURE_COVERAGE_AND_TESTING_GUIDE.md`.

## Prerequisites
- Node.js `>=20` (recommended `22`)
- npm `>=10`
- Backend API running locally (default `http://localhost:8000`)

## Quick Start
1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Set:
```env
VITE_API_URL=http://localhost:8000
```

3. Start frontend:
```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

4. Start backend (separate terminal):
```bash
cd backend
python manage.py runserver
```

Frontend runs at `http://localhost:5173`.

## Common Commands
| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with Biome |
| `npm run lint:fix` | Apply auto-fixes |
| `npm run format` | Format code |
| `npm run type-check` | Run TypeScript checks |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:coverage` | Unit test coverage |
| `npm run test:e2e` | E2E tests (Playwright) |

## Project Docs
- Tech stack details: `readmes/TECH_STACK.md`
- Feature coverage + testing guide: `readmes/FEATURE_COVERAGE_AND_TESTING_GUIDE.md`
- Phase-by-phase implementation/testing guide: `readmes/PHASES_1_TO_7_IMPLEMENTATION_AND_GUI_TESTING_GUIDE.md`
- Implemented security controls summary: `readmes/IMPLEMENTED_SECURITY_CONTROLS_SUMMARY.md`

## Structure (High Level)
```text
Capstone-Web/
├── backend/            # API service (Django)
├── src/                # Frontend source code
├── e2e/                # Playwright tests
├── readmes/            # Extended documentation
├── package.json
└── README.md
```

## Notes
- This repository currently does not include a `LICENSE` file.
- Keep root `README.md` short; place deep guides in `readmes/`.
