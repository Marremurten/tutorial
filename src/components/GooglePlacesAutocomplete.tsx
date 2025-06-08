'use client';

import { useEffect, useRef, useState } from 'react';
import GoogleMapsLoader from '@/utils/googleMapsLoader';

interface PlaceDetails {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId: string;
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  error?: string;
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = 'Search for Stockholm addresses...',
  className = '',
  value = '',
  error,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Stockholm bounds for restricting search
  const stockholmBounds = {
    north: 59.5,
    south: 59.17,
    east: 18.4,
    west: 17.8,
  };

  // Load Google Maps API
  useEffect(() => {
    const loader = GoogleMapsLoader.getInstance();

    if (loader.isApiLoaded()) {
      setIsLoaded(true);
    } else {
      loader
        .load()
        .then(() => {
          setIsLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load Google Maps API:', error);
        });
    }
  }, []);

  // Initialize autocomplete when both API is loaded and input is available
  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!isLoaded || !inputRef.current) {
        console.log(
          'Cannot initialize - isLoaded:',
          isLoaded,
          'inputRef.current:',
          !!inputRef.current
        );
        return false;
      }

      if (isInitialized) {
        console.log('Already initialized, skipping');
        return true;
      }

      console.log('Initializing Google Places Autocomplete...');

      try {
        // Clean up any existing autocomplete
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }

        // Create new autocomplete instance
        const autocomplete = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: 'se' },
            fields: ['place_id', 'formatted_address', 'geometry', 'name'],
            types: ['establishment', 'geocode'],
          }
        );

        console.log('Autocomplete created successfully');

        // Set Stockholm bounds
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(stockholmBounds.south, stockholmBounds.west),
          new google.maps.LatLng(stockholmBounds.north, stockholmBounds.east)
        );
        autocomplete.setBounds(bounds);

        // Add place selection listener
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          console.log('Place selected:', place);

          if (!place.geometry || !place.geometry.location) {
            console.warn('No location details available');
            return;
          }

          const placeDetails: PlaceDetails = {
            address: place.formatted_address || '',
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            placeId: place.place_id || '',
          };

          // Check Stockholm bounds
          const lat = placeDetails.coordinates.lat;
          const lng = placeDetails.coordinates.lng;

          if (
            lat >= stockholmBounds.south &&
            lat <= stockholmBounds.north &&
            lng >= stockholmBounds.west &&
            lng <= stockholmBounds.east
          ) {
            onPlaceSelect(placeDetails);
          } else {
            alert('Please select a location within Stockholm area');
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }
        });

        autocompleteRef.current = autocomplete;
        setIsInitialized(true);
        console.log(
          'Autocomplete initialization complete - isInitialized set to true'
        );
        return true;
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        return false;
      }
    };

    // Try to initialize immediately
    if (!initializeAutocomplete()) {
      // If immediate initialization fails, try again after a short delay
      console.log('Initial initialization failed, retrying in 100ms...');
      const timer = setTimeout(() => {
        initializeAutocomplete();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isInitialized, onPlaceSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className={`${className}`}>
        <input
          type="text"
          placeholder="Loading Google Places..."
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        autoComplete="off"
        spellCheck="false"
        onFocus={() => {
          console.log('Input focused - checking autocomplete state');
          console.log(
            'isLoaded:',
            isLoaded,
            'isInitialized:',
            isInitialized,
            'autocompleteRef.current:',
            !!autocompleteRef.current
          );

          // Force re-initialization if autocomplete seems broken
          if (!autocompleteRef.current && isLoaded) {
            console.log('Re-initializing autocomplete on focus');
            setIsInitialized(false);
          }
        }}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
