# STACK

## Frontend Frameowrk
- **Next.js**: The core framework (using App Router, indicated by the `src/app` directory).
- **React**: UI library (`react`, `react-dom`).
- **Language**: TypeScript (with configured `tsconfig.json`).

## Styling & Animations
- **CSS Framework**: Tailwind CSS (with `autoprefixer` and `postcss`).
- **Animation**: Framer Motion (`framer-motion`).
- **Icons**: Lucide React (`lucide-react`).
- **Utility**: `clsx` and `tailwind-merge` for dynamic CSS classes.

## Maps & Geolocation
- **Leaflet**: Core map library (`leaflet`, `@types/leaflet`).
- **React Leaflet**: React wrappers for Leaflet (`react-leaflet`).
- **Geosearch**: `leaflet-geosearch` for location search functionality.

## Media Processing
- **Image Cropping**: `react-easy-crop` for client-side image adjustments.

## Backend & Database Services
- **Firebase**: Used broadly (`firebase` client, `firebase-admin` for server-side). Used for database (Firestore) and likely authentication.
- **AWS S3**: `@aws-sdk/client-s3` used for object storage (potentially for images/assets).

## Infrastructure & Tooling
- **Node.js**: Underlying runtime.
- **npm**: Package manager (evidenced by `package-lock.json`).