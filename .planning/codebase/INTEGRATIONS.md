# INTEGRATIONS

## Firebase
- **Client SDK (`firebase`)**: Used on the frontend for authentication, Firestore access, etc.
- **Admin SDK (`firebase-admin`)**: Used on the server/API routes for elevated privileges to interact with Firebase services securely.
- **Firestore**: Configured with `firestore.rules` and `firestore.indexes.json` indicating a NoSQL database structure for properties, users, etc.

## AWS S3
- **AWS SDK (`@aws-sdk/client-s3`)**: Integrated for object storage. Likely used for uploading and serving property images and user avatars, potentially instead of Firebase Storage.

## Authentication
- **Google Auth Library (`google-auth-library`)**: Specifically installed, likely for handling backend OAuth verification or service account authentication.
- **Firebase Auth**: Likely the primary authentication provider based on standard Firebase stacks.

## Maps & Geocoding
- **Leaflet / Geosearch**: Integrates with map tile providers (like OpenStreetMap) and geocoding services to display property locations and search by address.