# MSME Loan Portal - Admin Dashboard

A modern, production-ready admin dashboard for managing MSME (Micro, Small, and Medium Enterprise) loan applications. Built with React 19, TypeScript, and Vite.

![Login Page](docs/login-preview.png)

---

## 🚀 Tech Stack

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI library with latest features |
| TypeScript | 5.9.3 | Type-safe JavaScript |
| Vite (Rolldown) | 7.2.5 | Lightning-fast build tool |
| React Router | 7.11.0 | Client-side routing |

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | 4.1.18 | Utility-first CSS framework |
| shadcn/ui | - | Accessible, customizable components |
| Lucide React | 0.562.0 | Beautiful icon library |
| Framer Motion | 12.6.0 | Animation library |

### Data & State
| Package | Version | Purpose |
|---------|---------|---------|
| TanStack Query | 5.90.16 | Async state management |
| Zustand | 5.0.9 | Lightweight global state |
| Axios | 1.13.2 | HTTP client |

### Forms & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| React Hook Form | 7.70.0 | Performant form handling |
| Zod | 4.3.5 | Schema validation |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| Vitest | 3.2.1 | Unit test framework |
| Playwright | 1.52.0 | E2E testing |
| Testing Library | 16.3.0 | Component testing utilities |

### Code Quality
| Package | Version | Purpose |
|---------|---------|---------|
| Biome | 2.3.11 | Linting & formatting (replaces ESLint + Prettier) |
| Husky | 9.1.7 | Git hooks |
| lint-staged | 16.1.0 | Run linters on staged files |

### Additional
| Package | Purpose |
|---------|---------|
| Sonner | Toast notifications |
| Recharts | Data visualization |
| TanStack Table | Data tables |
| date-fns | Date utilities |
| react-error-boundary | Error handling |

---

## 📋 Prerequisites

- **Node.js** >= 20.x (we recommend v22+)
- **npm** >= 10.x

### Installing Node.js (macOS)

```bash
# Using Homebrew (recommended)
brew install node

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22
```

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eligabsoriano/Capstone-Web.git
cd Capstone-Web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure your backend API URL:

```env
VITE_API_URL=http://localhost:8000
```

### 4. Start development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📜 Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Check code with Biome |
| `npm run lint:fix` | Fix auto-fixable lint issues |
| `npm run format` | Format code with Biome |
| `npm run type-check` | Run TypeScript type checking |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests in watch mode |
| `npm run test:ui` | Run tests with visual UI |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Run E2E tests with visual UI |

---

## 📁 Project Structure

```
Capstone-Web/
├── .husky/                 # Git hooks
│   └── pre-commit          # Runs lint-staged before commits
├── e2e/                    # Playwright E2E tests
│   └── login.spec.ts
├── public/                 # Static assets
├── src/
│   ├── app/                # App-level configuration
│   │   ├── providers.tsx   # Global providers (Query, Error, Toast)
│   │   └── router.tsx      # Route definitions
│   ├── components/
│   │   ├── common/         # Shared business components
│   │   │   └── ErrorBoundary.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── features/           # Feature modules
│   │   └── auth/           # Authentication feature
│   │       ├── api/        # API calls
│   │       ├── components/ # UI components
│   │       ├── hooks/      # Custom hooks
│   │       └── store/      # Zustand store
│   ├── lib/                # Utility functions
│   ├── shared/             # Shared code
│   │   └── api/            # Axios client configuration
│   ├── test/               # Test utilities
│   │   ├── setup.ts        # Vitest setup
│   │   └── test-utils.tsx  # Custom render helpers
│   └── types/              # TypeScript types
├── biome.json              # Biome configuration
├── playwright.config.ts    # Playwright configuration
├── vitest.config.ts        # Vitest configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run tests in watch mode
npm run test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Tests are located in `src/**/*.test.ts(x)` files alongside the code they test.

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run E2E tests
npm run test:e2e

# Run with visual UI
npm run test:e2e:ui
```

E2E tests are located in the `e2e/` directory.

---

## 🎨 Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add new components:

```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add dialog dropdown-menu select

# View all available components
npx shadcn@latest add
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `biome.json` | Linting and formatting rules |
| `vite.config.ts` | Vite build configuration |
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |
| `tsconfig.json` | TypeScript compiler options |
| `components.json` | shadcn/ui configuration |

---

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

> **Note**: All Vite environment variables must be prefixed with `VITE_`.

---

## 📝 Code Quality

### Pre-commit Hooks

Husky runs lint-staged before each commit, which:
- Formats code with Biome
- Fixes auto-fixable lint issues
- Blocks commits with errors

### Biome

Biome replaces ESLint + Prettier with a single, faster tool:

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run lint:fix

# Format files
npm run format
```

---

## 🏗️ Building for Production

```bash
# Create production build
npm run build

# Preview the build
npm run preview
```

The build output will be in the `dist/` directory.

---

## 🔗 Related Projects

- **Backend API**: [Your Django/FastAPI backend repo]
- **Mobile App**: [Your React Native/Flutter repo]

---

## 📄 License

[MIT](LICENSE)

---

## 👥 Contributors

- Your Name (@github-username)
