# Google Maps API Setup

## Required for Places Form Feature

The places form feature requires a Google Maps API key with the Places API enabled to provide address autocomplete functionality restricted to Stockholm.

## Setup Instructions

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Places API" and "Maps JavaScript API"
   - Generate an API key

2. **Configure API Key Restrictions (Recommended):**
   - Set HTTP referrer restrictions to your domain
   - Restrict API key to only "Places API" and "Maps JavaScript API"

3. **Add to Environment Variables:**
   - Update `.env.local` file:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

4. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## Features Enabled

- **Stockholm Area Restriction:** Places autocomplete is bounded to Stockholm metropolitan area (lat: 59.17-59.5, lng: 17.8-18.4)
- **Country Restriction:** Limited to Sweden (SE)
- **Place Types:** Supports both establishments and addresses
- **Automatic Coordinates:** Extracts latitude and longitude automatically
- **Place ID Storage:** Stores Google Place ID for future reference

## Testing

1. Navigate to the application
2. Click "Add New Place" 
3. Start typing in the Location field
4. Verify autocomplete suggestions are limited to Stockholm area
5. Select a place and verify coordinates are captured

## Troubleshooting

- **No autocomplete suggestions:** Check API key is valid and Places API is enabled
- **Places outside Stockholm:** The component validates coordinates and restricts to Stockholm bounds
- **Loading issues:** Check browser console for API loading errors