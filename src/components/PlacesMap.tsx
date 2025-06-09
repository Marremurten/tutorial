'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { Place, PLACE_CATEGORIES } from '@/types/place'

interface PlacesMapProps {
  className?: string
}

interface PlaceMarkerProps {
  place: Place
  onMarkerClick: (place: Place) => void
}

const STOCKHOLM_CENTER = { lat: 59.3293, lng: 18.0686 }

// Individual marker component
function PlaceMarker({ place, onMarkerClick }: PlaceMarkerProps) {
  const handleClick = useCallback(() => {
    onMarkerClick(place)
  }, [place, onMarkerClick])

  const position = {
    lat: place.location.coordinates.lat,
    lng: place.location.coordinates.lng,
  }

  return (
    <AdvancedMarker
      position={position}
      title={place.name}
      onClick={handleClick}
    />
  )
}

// Main map component that uses the map instance
function PlacesMapContent({ className = '' }: PlacesMapProps) {
  const map = useMap()
  
  const [places, setPlaces] = useState<Place[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate fallback coordinates for places missing lat/lng
  const generateFallbackCoordinates = () => {
    // Random position within ~1km radius of Stockholm center
    const radiusInDegrees = 0.01 // Approximately 1km
    const randomLat = STOCKHOLM_CENTER.lat + (Math.random() - 0.5) * radiusInDegrees * 2
    const randomLng = STOCKHOLM_CENTER.lng + (Math.random() - 0.5) * radiusInDegrees * 2
    
    return { lat: randomLat, lng: randomLng }
  }

  // Fetch places from API
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch('/api/places')
        if (!response.ok) {
          throw new Error('Failed to fetch places')
        }
        const data = await response.json()
        const placesData = data.places || data
        
        // Process places and add fallback coordinates if needed
        const processedPlaces = placesData.map((place: Place) => {
          if (!place.location?.coordinates?.lat || !place.location?.coordinates?.lng) {
            const fallbackCoords = generateFallbackCoordinates()
            return {
              ...place,
              location: {
                ...place.location,
                coordinates: fallbackCoords
              }
            }
          }
          return place
        })
        
        setPlaces(processedPlaces)
      } catch (err) {
        console.error('Error fetching places:', err)
        setError('Error loading places. Please refresh the page.')
      }
    }

    fetchPlaces()
  }, [])

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          // Fallback to predefined categories
          setCategories([...PLACE_CATEGORIES])
          setSelectedCategories(new Set(PLACE_CATEGORIES))
          return
        }
        const data = await response.json()
        const categoriesData = data.categories || data
        setCategories(categoriesData)
        setSelectedCategories(new Set(categoriesData))
      } catch (err) {
        console.error('Error fetching categories:', err)
        // Fallback to predefined categories
        setCategories([...PLACE_CATEGORIES])
        setSelectedCategories(new Set(PLACE_CATEGORIES))
      }
    }

    fetchCategories()
  }, [])

  // Set loading to false once we have attempted to fetch data
  useEffect(() => {
    if (categories.length > 0) {
      setLoading(false)
    }
  }, [categories])

  // Fit map bounds to show all places when they're loaded
  useEffect(() => {
    if (!map || places.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    
    places.forEach((place) => {
      bounds.extend({
        lat: place.location.coordinates.lat,
        lng: place.location.coordinates.lng,
      })
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds)
      
      // Ensure we don't zoom in too much for a single marker
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15)
        }
      })

      return () => {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map, places])

  // Handle marker click
  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place)
    setIsSidebarOpen(true)
  }, [])

  // Handle category filter change
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newSelectedCategories = new Set(selectedCategories)
    if (checked) {
      newSelectedCategories.add(category)
    } else {
      newSelectedCategories.delete(category)
    }
    setSelectedCategories(newSelectedCategories)
  }

  // Get count of places per category
  const getCategoryCount = (category: string) => {
    return places.filter(place => place.category === category).length
  }

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedPlace(null)
  }

  // Filter places based on selected categories
  const filteredPlaces = places.filter(place => selectedCategories.has(place.category))

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Category Filters */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-900 mb-3">Filter by Category</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((category) => {
            const count = getCategoryCount(category)
            return (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {category} ({count})
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Map Container */}
      <div data-testid="map-container" className="w-full h-full min-h-[500px]">
        <Map
          defaultCenter={STOCKHOLM_CENTER}
          defaultZoom={11}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapId="DEMO_MAP_ID"
        >
          {/* Render markers for filtered places */}
          {filteredPlaces.map((place) => (
            <PlaceMarker
              key={place._id?.toString() || `${place.name}-${place.location.coordinates.lat}`}
              place={place}
              onMarkerClick={handleMarkerClick}
            />
          ))}
        </Map>
      </div>

      {/* Place Details Sidebar */}
      {isSidebarOpen && selectedPlace && (
        <div
          data-testid="place-sidebar"
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-20 overflow-y-auto"
        >
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={closeSidebar}
              aria-label="Close sidebar"
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Place Details */}
            <div className="pr-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedPlace.name}
              </h2>
              
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {selectedPlace.category}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {selectedPlace.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{selectedPlace.location.address}</span>
                </div>

                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">Added by {selectedPlace.submittedBy}</span>
                </div>

                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">
                    Added {new Date(selectedPlace.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Images */}
              {selectedPlace.images && selectedPlace.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlace.images.map((image, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedPlace.name} - Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-10 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}

// Main export component with APIProvider wrapper
export default function PlacesMap({ className = '' }: PlacesMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">Google Maps API key not configured</p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <PlacesMapContent className={className} />
    </APIProvider>
  )
}