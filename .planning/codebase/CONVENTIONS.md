# CONVENTIONS

## Routing & Naming
- **URL Structure**: Uses kebab-case routing conventions typical for SEO-friendly Turkish sites (e.g., `/ilan-ver`, `/yasal-bilgiler`, `/hakkimizda`).
- **Component Naming**: Typically PascalCase for components, though directory structures align to route names.

## Styling
- Extensive use of **Tailwind CSS**.
- Dynamic classes are merged using `clsx` and `tailwind-merge` to avoid class conflicts, suggesting a modular component approach (like `cn` utility patterns often found with modern UI kits like Radix/shadcn).

## State Management
- **Context API** is preferred over external state managers for global states (evident by the `src/context/` directory).

## Type Safety
- **TypeScript** is enforced. Custom types and interfaces are centralized in the `src/types/` directory to share definitions between frontend and API layers.

## Backend/APIs
- Direct Firebase integration on the client side for real-time reads/writes, augmented by Next.js API routes (`src/app/api`) for operations requiring secrets or Admin SDK capabilities.