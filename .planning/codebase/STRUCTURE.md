# STRUCTURE

## Directory Layout
The codebase is structured within `src/` following Next.js App Router conventions.

```text
src/
├── app/                  # Next.js App Router roots
│   ├── admin/            # Admin dashboard and sub-routes (users, agents, vb.)
│   ├── api/              # Server-side Next.js API endpoints
│   ├── favorilerim/      # User favorites page
│   ├── ilanlar/          # Real estate listing pages
│   ├── ilan-ver/         # Create listing feature
│   ├── login/            # Authentication
│   ├── register/         # Authentication
│   ├── profil/           # User profile
│   └── globals.css       # Global styles
├── components/           # Reusable React components (UI, layouts)
├── constants/            # Static data, configurations, enums
├── context/              # React Context providers (AuthContext, etc.)
├── lib/                  # Shared utilities, library initializations (Firebase/AWS)
└── types/                # TypeScript interface and type definitions
```

## Key Files
- `src/app/layout.tsx`: Root layout, likely wraps the app in Context providers (Auth).
- `src/app/page.tsx`: Landing/Home page.
- `package.json`: Dependency manifests and scripts.
- `firebase.json` & `firestore.rules`: Firebase configuration and security layer.
- `next.config.mjs`: Next.js configuration.
- `tailwind.config.ts`: Tailwind theme and plugins config.