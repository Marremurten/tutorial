// Global Google Maps API loader to prevent multiple script loading
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private isLoading = false;
  private isLoaded = false;
  private callbacks: (() => void)[] = [];

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  load(): Promise<void> {
    return new Promise((resolve) => {
      // If already loaded, resolve immediately
      if (this.isLoaded) {
        resolve();
        return;
      }

      // Add callback to queue
      this.callbacks.push(resolve);

      // If already loading, don't load again
      if (this.isLoading) {
        return;
      }

      // Check if Google Maps is already available
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        this.isLoaded = true;
        this.executeCallbacks();
        return;
      }

      this.isLoading = true;

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script exists but may not be loaded yet
        existingScript.addEventListener('load', () => {
          this.isLoaded = true;
          this.isLoading = false;
          this.executeCallbacks();
        });
        existingScript.addEventListener('error', () => {
          this.isLoading = false;
          this.executeCallbacksWithError(new Error('Failed to load Google Maps API'));
        });
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Verify the API is working
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
          this.isLoaded = true;
          this.isLoading = false;
          this.executeCallbacks();
        } else {
          console.error('Google Maps Places API not available after script load');
          this.executeCallbacksWithError(new Error('Google Maps Places API not available'));
        }
      };

      script.onerror = () => {
        this.isLoading = false;
        this.executeCallbacksWithError(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  private executeCallbacks() {
    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
  }

  private executeCallbacksWithError(error: Error) {
    console.error('Google Maps API loading error:', error);
    this.callbacks = [];
  }

  isApiLoaded(): boolean {
    return this.isLoaded;
  }
}

export default GoogleMapsLoader;