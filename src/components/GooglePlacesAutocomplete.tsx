'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import GoogleMapsLoader from '@/utils/googleMapsLoader';

// Stockholm bounds for restricting search (moved outside component to avoid re-renders)
const STOCKHOLM_BOUNDS = {
  north: 59.5,
  south: 59.17,
  east: 18.4,
  west: 17.8,
};

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

  // Memoize the place selection handler
  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Validate Stockholm bounds
    if (
      lat >= STOCKHOLM_BOUNDS.south &&
      lat <= STOCKHOLM_BOUNDS.north &&
      lng >= STOCKHOLM_BOUNDS.west &&
      lng <= STOCKHOLM_BOUNDS.east
    ) {
      const placeDetails: PlaceDetails = {
        address: place.formatted_address || '',
        coordinates: {
          lat,
          lng,
        },
        placeId: place.place_id || '',
      };
      
      onPlaceSelect(placeDetails);
    } else {
      // Show error and clear input for locations outside Stockholm
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.placeholder = 'Please select a location within Stockholm area';
        inputRef.current.style.borderColor = '#ef4444';
        
        // Reset placeholder and border after 3 seconds
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.placeholder = placeholder;
            inputRef.current.style.borderColor = '';
          }
        }, 3000);
      }
    }
  }, [onPlaceSelect, placeholder]);

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
        return false;
      }

      if (isInitialized) {
        return true;
      }

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


        // Set Stockholm bounds
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(STOCKHOLM_BOUNDS.south, STOCKHOLM_BOUNDS.west),
          new google.maps.LatLng(STOCKHOLM_BOUNDS.north, STOCKHOLM_BOUNDS.east)
        );
        autocomplete.setBounds(bounds);

        // Add place selection listener
        autocomplete.addListener('place_changed', handlePlaceSelect);

        autocompleteRef.current = autocomplete;
        setIsInitialized(true);
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
  }, [isLoaded, isInitialized, handlePlaceSelect]);

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
          // Force re-initialization if autocomplete seems broken
          if (!autocompleteRef.current && isLoaded) {
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
