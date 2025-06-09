import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import PlacesMap from '../PlacesMap'

// Mock fetch for API calls
global.fetch = jest.fn()

// Create a manual mock for GoogleMapsLoader
const mockGoogleMapsLoader = {
  getInstance: jest.fn(),
  isApiLoaded: jest.fn(),
  load: jest.fn(),
}

// Mock the GoogleMapsLoader module
jest.mock('../../utils/googleMapsLoader', () => ({
  __esModule: true,
  default: {
    getInstance: () => mockGoogleMapsLoader,
  },
}))

// Mock Google Maps API
const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  getBounds: jest.fn(),
  fitBounds: jest.fn(),
}

const mockMarker = {
  setMap: jest.fn(),
  setPosition: jest.fn(),
  addListener: jest.fn(),
  getPosition: jest.fn(),
}

const mockInfoWindow = {
  setContent: jest.fn(),
  open: jest.fn(),
  close: jest.fn(),
}

const mockLatLng = jest.fn((lat: number, lng: number) => ({
  lat: () => lat,
  lng: () => lng,
}))

const mockLatLngBounds = jest.fn(() => ({
  extend: jest.fn(),
  isEmpty: jest.fn(() => false),
}))

// Setup global Google Maps API mock
beforeAll(() => {
  (global as any).google = {
    maps: {
      Map: jest.fn(() => mockMap),
      Marker: jest.fn(() => mockMarker),
      InfoWindow: jest.fn(() => mockInfoWindow),
      LatLng: mockLatLng,
      LatLngBounds: mockLatLngBounds,
      event: {
        addListener: jest.fn(),
        clearInstanceListeners: jest.fn(),
      },
    },
  }
})

// Mock places data
const mockPlaces = [
  {
    _id: '1',
    name: 'Gamla Stan',
    description: 'Historic old town',
    address: 'Gamla Stan, Stockholm',
    category: 'Tourist Attraction',
    coordinates: { lat: 59.3251, lng: 18.0711 },
  },
  {
    _id: '2',
    name: 'Vasa Museum',
    description: 'Maritime museum',
    address: 'Galärvarvsvägen 14, Stockholm',
    category: 'Museum',
    coordinates: { lat: 59.3280, lng: 18.0916 },
  },
  {
    _id: '3',
    name: 'Fotografiska',
    description: 'Photography museum',
    address: 'Stadsgårdshamnen 22, Stockholm',
    category: 'Museum',
    coordinates: { lat: 59.3186, lng: 18.0845 },
  },
]

const mockCategories = ['Tourist Attraction', 'Museum', 'Restaurant']

describe('PlacesMap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset mock implementations
    mockGoogleMapsLoader.getInstance.mockReturnValue(mockGoogleMapsLoader)
    mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
    mockGoogleMapsLoader.load.mockResolvedValue(undefined)
    
    // Mock successful API calls
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlaces,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
    
    // Reset Google Maps mocks
    mockMap.setCenter.mockClear()
    mockMap.setZoom.mockClear()
    mockMarker.setMap.mockClear()
    mockMarker.addListener.mockClear()
  })

  describe('Component Rendering', () => {
    it('renders loading state when Google Maps API is not loaded', () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
      
      render(<PlacesMap />)
      
      expect(screen.getByText('Loading map...')).toBeInTheDocument()
    })

    it('renders map container when Google Maps API is loaded', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
      })
    })

    it('renders category filter checkboxes', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Tourist Attraction')).toBeInTheDocument()
        expect(screen.getByLabelText('Museum')).toBeInTheDocument()
        expect(screen.getByLabelText('Restaurant')).toBeInTheDocument()
      })
    })

    it('displays error message when places API call fails', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
      
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading places/)).toBeInTheDocument()
      })
    })
  })

  describe('Map Initialization', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('initializes Google Map with Stockholm center and correct zoom', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(global.google.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            center: { lat: 59.3293, lng: 18.0686 }, // Stockholm center
            zoom: 11, // Greater Stockholm area zoom
            mapTypeId: 'roadmap',
          })
        )
      })
    })

    it('loads Google Maps API when not already loaded', () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
      
      render(<PlacesMap />)
      
      expect(mockGoogleMapsLoader.load).toHaveBeenCalled()
    })

    it('does not load API when already loaded', () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      
      render(<PlacesMap />)
      
      expect(mockGoogleMapsLoader.load).not.toHaveBeenCalled()
    })
  })

  describe('Places and Markers', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('fetches places from API on mount', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/places')
      })
    })

    it('creates markers for all places', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(global.google.maps.Marker).toHaveBeenCalledTimes(mockPlaces.length)
      })
      
      // Check each place has a marker
      mockPlaces.forEach((place, index) => {
        expect(global.google.maps.Marker).toHaveBeenNthCalledWith(index + 1, {
          position: { lat: place.coordinates.lat, lng: place.coordinates.lng },
          map: mockMap,
          title: place.name,
          clickable: true,
        })
      })
    })

    it('adds click listeners to markers', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalledWith('click', expect.any(Function))
      })
    })

    it('fits map bounds to show all markers', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMap.fitBounds).toHaveBeenCalled()
      })
    })
  })

  describe('Category Filtering', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('filters markers when category is unchecked', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Museum')).toBeInTheDocument()
      })
      
      const museumCheckbox = screen.getByLabelText('Museum')
      
      // Uncheck museum category
      fireEvent.click(museumCheckbox)
      
      await waitFor(() => {
        expect(museumCheckbox).not.toBeChecked()
      })
      
      // Museum markers should be hidden (setMap(null) called)
      expect(mockMarker.setMap).toHaveBeenCalledWith(null)
    })

    it('shows markers when category is checked', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Museum')).toBeInTheDocument()
      })
      
      const museumCheckbox = screen.getByLabelText('Museum')
      
      // Uncheck then recheck museum category
      fireEvent.click(museumCheckbox)
      fireEvent.click(museumCheckbox)
      
      await waitFor(() => {
        expect(museumCheckbox).toBeChecked()
      })
      
      // Museum markers should be shown again
      expect(mockMarker.setMap).toHaveBeenCalledWith(mockMap)
    })

    it('allows multiple categories to be selected', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Museum')).toBeInTheDocument()
        expect(screen.getByLabelText('Tourist Attraction')).toBeInTheDocument()
      })
      
      const museumCheckbox = screen.getByLabelText('Museum')
      const touristCheckbox = screen.getByLabelText('Tourist Attraction')
      
      expect(museumCheckbox).toBeChecked()
      expect(touristCheckbox).toBeChecked()
      
      // Both should remain checked
      fireEvent.click(museumCheckbox)
      expect(museumCheckbox).not.toBeChecked()
      expect(touristCheckbox).toBeChecked()
    })

    it('updates filter counts correctly', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByText('Museum (2)')).toBeInTheDocument()
        expect(screen.getByText('Tourist Attraction (1)')).toBeInTheDocument()
      })
    })
  })

  describe('Sidebar Functionality', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('opens sidebar when marker is clicked', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalled()
      })
      
      // Get the click callback and trigger it
      const clickCallback = mockMarker.addListener.mock.calls.find(
        call => call[0] === 'click'
      )?.[1]
      
      expect(clickCallback).toBeDefined()
      
      act(() => {
        clickCallback()
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('place-sidebar')).toBeInTheDocument()
      })
    })

    it('displays place details in sidebar', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalled()
      })
      
      // Simulate clicking on first place marker
      const clickCallback = mockMarker.addListener.mock.calls[0][1]
      
      act(() => {
        clickCallback()
      })
      
      await waitFor(() => {
        expect(screen.getByText('Gamla Stan')).toBeInTheDocument()
        expect(screen.getByText('Historic old town')).toBeInTheDocument()
        expect(screen.getByText('Gamla Stan, Stockholm')).toBeInTheDocument()
        expect(screen.getByText('Tourist Attraction')).toBeInTheDocument()
      })
    })

    it('closes sidebar when close button is clicked', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalled()
      })
      
      // Open sidebar
      const clickCallback = mockMarker.addListener.mock.calls[0][1]
      act(() => {
        clickCallback()
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('place-sidebar')).toBeInTheDocument()
      })
      
      // Close sidebar
      const closeButton = screen.getByLabelText('Close sidebar')
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('place-sidebar')).not.toBeInTheDocument()
      })
    })

    it('handles missing place data gracefully', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalled()
      })
      
      // Simulate clicking with invalid place data
      const clickCallback = mockMarker.addListener.mock.calls[0][1]
      
      act(() => {
        clickCallback() // No place data passed
      })
      
      // Should not crash and should not show sidebar
      expect(screen.queryByTestId('place-sidebar')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('applies responsive classes to map container', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container')
        expect(mapContainer).toHaveClass('w-full', 'h-full')
      })
    })

    it('applies responsive classes to sidebar', async () => {
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalled()
      })
      
      // Open sidebar
      const clickCallback = mockMarker.addListener.mock.calls[0][1]
      act(() => {
        clickCallback()
      })
      
      await waitFor(() => {
        const sidebar = screen.getByTestId('place-sidebar')
        expect(sidebar).toHaveClass('fixed', 'right-0', 'top-0', 'h-full')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles Google Maps API loading errors', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
      mockGoogleMapsLoader.load.mockRejectedValue(new Error('Failed to load API'))
      
      render(<PlacesMap />)
      
      await waitFor(() => {
        expect(screen.getByText('Error loading map. Please refresh the page.')).toBeInTheDocument()
      })
    })

    it('handles categories API error gracefully', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaces,
        })
        .mockRejectedValueOnce(new Error('Categories API Error'))
      
      render(<PlacesMap />)
      
      // Should still render map without category filters
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
      })
    })
  })

  describe('Cleanup', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('cleans up map and markers on unmount', async () => {
      const { unmount } = render(<PlacesMap />)
      
      await waitFor(() => {
        expect(global.google.maps.Map).toHaveBeenCalled()
      })

      unmount()

      expect(global.google.maps.event.clearInstanceListeners).toHaveBeenCalled()
    })
  })
})