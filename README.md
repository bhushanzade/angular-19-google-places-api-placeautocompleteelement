# AngularGoogleMapPlaces

## Enabling Firebase and Google Places API

### 1. Enable Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the setup steps.
3. Once your project is created, click the gear icon and select **Project settings**.
4. Under **Your apps**, register your web app and follow the instructions to add Firebase SDK to your Angular project.
5. Copy the Firebase config object and add it to your Angular environment files.

### 2. Enable Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project (or create a new one).
3. Navigate to **APIs & Services > Library**.
4. Search for **Places API** and click **Enable**.
5. Go to **APIs & Services > Credentials** and create an API key.
6. Restrict the API key for security (HTTP referrers recommended).
7. Use the API key in your Angular app to access Google Places services.


### 3. Configure API Key in `googlemap.service.ts`

1. Open the `googlemap.service.ts` file in your Angular project.
2. Instead of hardcoding your API key, import the environment configuration:
  ```typescript
  import { environment } from '../environments/environment';
  ```
3. Use `environment.googleMapsApiKey` (or your configured key name) wherever the API key is required, for example:
  ```typescript
  const apiKey = environment.googleMapsApiKey;
  ```
4. Make sure your `environment.ts` and `environment.prod.ts` files contain the `googleMapsApiKey` property with your actual API key:
  ```typescript
  export const environment = {
    // ...other properties
    googleMapsApiKey: 'YOUR_API_KEY_HERE'
  };
  ```
This approach keeps your API key secure and makes it easy to manage different keys for development and production.