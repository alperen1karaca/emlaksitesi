# ARCHITECTURE

## Main Patterns
- **Next.js App Router**: The application heavily relies on the modern Next.js App Router paradigm (`src/app`), heavily utilizing server/client component boundaries.
- **Data Flow**: Combines client-side data fetching (Firebase Client SDK) and server-side operations (Next.js API routes `src/app/api` + Firebase Admin).

## Component Architecture
- **Pages & Layouts**: Next.js routing structure defines the architecture. Shared layouts reside at `src/app/layout.tsx`.
- **UI Components**: Reusable interface elements are stored in `src/components/`, isolating logic from page routing.
- **State Management**: Handled via React Context (`src/context/`), likely used for global Auth state and user preferences, rather than Redux/Zustand.

## Application Layers
1. **Public/User Layer**: Public listings, property details, user profile, and authentication (`login`, `register`, `ilanlar`).
2. **Admin Layer**: Protected dashboard for managing users, listings, requests, etc. (`src/app/admin/`).
3. **API Layer**: Backend routes within Next.js (`src/app/api/`) acting as a middle-tier for secure operations.
4. **Data Layer**: Firebase (Firestore) for metadata and S3/Firebase for media storage.

## Media Handling Pipeline
Images are likely cropped on the client (`react-easy-crop`) before being submitted to the backend/storage.