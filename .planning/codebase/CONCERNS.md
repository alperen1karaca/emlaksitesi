# CONCERNS

## Tech Debt & Architecture Quirks
- **Dual Storage Providers**: The codebase includes both Firebase (`firebase`, `firebase-admin`) and AWS S3 (`@aws-sdk/client-s3`). Using AWS S3 for storage while using Firebase for database/auth can complicate architecture, increase infrastructure points of failure, and duplicate configurations.
- **Unpinned Dependencies**: In `package.json`, dependencies like `"firebase": "latest"`, `"next": "latest"`, and `"react": "latest"` are extremely risky. They can automatically pull breaking changes and destroy builds. These should be pinned to specific versions (e.g., `^14.2.0`).

## Security & Reliability
- **Firebase Security Rules**: The presence of `firestore.rules` is good, but without automated tests, any mistake during manual edits can silently expose private user data (e.g., phone numbers or private admin details).
- **Missing Error Tracking**: No logging or error tracking service (like Sentry) is configured in dependencies, making debugging production issues difficult.

## Testing Debt
- **Zero Automated Tests**: See `TESTING.md`. The complete lack of automated testing processes is a severe concern for an application handling user authentication and property sales/listings. Any refactoring carries a high risk of breaking existing features.

## Performance
- **Map Library Weights**: `leaflet` and `react-leaflet` can be heavy if not dynamically imported properly in a Next.js SSR environment. This could impact hydration and Core Web Vitals if loaded incorrectly on the main pages.