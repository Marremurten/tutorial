import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import GooglePlacesAutocomplete from '../GooglePlacesAutocomplete'

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
const mockAutocomplete = {
  addListener: jest.fn(),
  setBounds: jest.fn(),
  getPlace: jest.fn(),
}

const mockLatLng = jest.fn((lat: number, lng: number) => ({
  lat: () => lat,
  lng: () => lng,
}))

const mockLatLngBounds = jest.fn((sw: any, ne: any) => ({
  getSouthWest: () => sw,
  getNorthEast: () => ne,
}))

// Setup global Google Maps API mock
beforeAll(() => {
  (global as any).google = {
    maps: {
      places: {
        Autocomplete: jest.fn(() => mockAutocomplete),
      },
      event: {
        addListener: jest.fn(),
        clearInstanceListeners: jest.fn(),
      },
      LatLng: mockLatLng,
      LatLngBounds: mockLatLngBounds,
    },
  }
})

describe('GooglePlacesAutocomplete', () => {
  const mockOnPlaceSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset mock implementations
    mockGoogleMapsLoader.getInstance.mockReturnValue(mockGoogleMapsLoader)
    mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
    mockGoogleMapsLoader.load.mockResolvedValue(undefined)
    
    // Reset Google Maps mocks
    mockAutocomplete.addListener.mockClear()
    mockAutocomplete.setBounds.mockClear()
    mockAutocomplete.getPlace.mockClear()
  })

  describe('Component Rendering', () => {
    it('renders loading state when Google Maps API is not loaded', () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Loading Google Places...')
      expect(input).toBeDisabled()
    })

    it('renders active input when Google Maps API is loaded', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).not.toBeDisabled()
        expect(input).toHaveAttribute('placeholder', 'Search for Stockholm addresses...')
      })
    })

    it('renders custom placeholder when provided', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      const customPlaceholder = 'Find a place in Stockholm'
      
      render(
        <GooglePlacesAutocomplete 
          onPlaceSelect={mockOnPlaceSelect}
          placeholder={customPlaceholder}
        />
      )
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('placeholder', customPlaceholder)
      })
    })

    it('applies custom className when provided', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      const customClassName = 'my-custom-class'
      
      const { container } = render(
        <GooglePlacesAutocomplete 
          onPlaceSelect={mockOnPlaceSelect}
          className={customClassName}
        />
      )
      
      await waitFor(() => {
        const wrapper = container.firstChild
        expect(wrapper).toHaveClass(customClassName)
      })
    })

    it('displays error message when error prop is provided', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      const errorMessage = 'Location is required'
      
      render(
        <GooglePlacesAutocomplete 
          onPlaceSelect={mockOnPlaceSelect}
          error={errorMessage}
        />
      )
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('applies error styling when error is present', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      const errorMessage = 'Location is required'
      
      render(
        <GooglePlacesAutocomplete 
          onPlaceSelect={mockOnPlaceSelect}
          error={errorMessage}
        />
      )
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('border-red-500')
      })
    })

    it('sets default value when provided', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      const defaultValue = 'Gamla Stan, Stockholm'
      
      render(
        <GooglePlacesAutocomplete 
          onPlaceSelect={mockOnPlaceSelect}
          value={defaultValue}
        />
      )
      
      await waitFor(() => {
        const input = screen.getByDisplayValue(defaultValue)
        expect(input).toBeInTheDocument()
      })
    })
  })

  describe('Google Maps API Loading', () => {
    it('calls GoogleMapsLoader.load() when API is not loaded', () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      expect(mockGoogleMapsLoader.load).toHaveBeenCalled()
    })

    it('does not call GoogleMapsLoader.load() when API is already loaded', () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      expect(mockGoogleMapsLoader.load).not.toHaveBeenCalled()
    })

    it('handles API loading errors gracefully', async () => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(false)
      mockGoogleMapsLoader.load.mockRejectedValue(new Error('Failed to load API'))
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      // Should not crash and should show loading state
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('Autocomplete Initialization', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('initializes Google Places Autocomplete when API is loaded', async () => {
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(global.google.maps.places.Autocomplete).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          {
            componentRestrictions: { country: 'se' },
            fields: ['place_id', 'formatted_address', 'geometry', 'name'],
            types: ['establishment', 'geocode'],
          }
        )
      })
    })

    it('sets Stockholm bounds on autocomplete instance', async () => {
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(mockLatLngBounds).toHaveBeenCalledWith(
          expect.objectContaining({
            lat: expect.any(Function),
            lng: expect.any(Function),
          }),
          expect.objectContaining({
            lat: expect.any(Function),
            lng: expect.any(Function),
          })
        )
        expect(mockAutocomplete.setBounds).toHaveBeenCalled()
      })
    })

    it('adds place_changed listener to autocomplete', async () => {
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(mockAutocomplete.addListener).toHaveBeenCalledWith(
          'place_changed',
          expect.any(Function)
        )
      })
    })
  })

  describe('Stockholm Bounds Validation', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('accepts valid Stockholm locations', async () => {
      const validPlace = {
        formatted_address: 'Gamla Stan, Stockholm, Sweden',
        place_id: 'test-place-id',
        geometry: {
          location: {
            lat: () => 59.32, // Within Stockholm bounds
            lng: () => 18.07, // Within Stockholm bounds
          },
        },
      }

      mockAutocomplete.getPlace.mockReturnValue(validPlace)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(mockAutocomplete.addListener).toHaveBeenCalled()
      })

      // Get the place_changed callback and trigger it
      const placeChangedCallback = mockAutocomplete.addListener.mock.calls.find(
        call => call[0] === 'place_changed'
      )?.[1]

      expect(placeChangedCallback).toBeDefined()
      
      act(() => {
        placeChangedCallback()
      })

      expect(mockOnPlaceSelect).toHaveBeenCalledWith({
        address: 'Gamla Stan, Stockholm, Sweden',
        coordinates: { lat: 59.32, lng: 18.07 },
        placeId: 'test-place-id',
      })
    })

    it('rejects locations outside Stockholm bounds', async () => {
      const invalidPlace = {
        formatted_address: 'Copenhagen, Denmark',
        place_id: 'invalid-place-id',
        geometry: {
          location: {
            lat: () => 55.67, // Outside Stockholm bounds
            lng: () => 12.56, // Outside Stockholm bounds
          },
        },
      }

      mockAutocomplete.getPlace.mockReturnValue(invalidPlace)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(mockAutocomplete.addListener).toHaveBeenCalled()
      })

      // Get the place_changed callback and trigger it
      const placeChangedCallback = mockAutocomplete.addListener.mock.calls.find(
        call => call[0] === 'place_changed'
      )?.[1]

      act(() => {
        placeChangedCallback()
      })

      // Should not call onPlaceSelect for invalid locations
      expect(mockOnPlaceSelect).not.toHaveBeenCalled()

      // Should show error feedback in the input
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('placeholder', 'Please select a location within Stockholm area')
      })
    })

    it('handles places without geometry gracefully', async () => {
      const placeWithoutGeometry = {
        formatted_address: 'Test Address',
        place_id: 'test-place-id',
        geometry: null,
      }

      mockAutocomplete.getPlace.mockReturnValue(placeWithoutGeometry)
      
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(mockAutocomplete.addListener).toHaveBeenCalled()
      })

      const placeChangedCallback = mockAutocomplete.addListener.mock.calls.find(
        call => call[0] === 'place_changed'
      )?.[1]

      act(() => {
        placeChangedCallback()
      })

      // Should not call onPlaceSelect
      expect(mockOnPlaceSelect).not.toHaveBeenCalled()
    })
  })

  describe('Error Recovery', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('resets error styling after timeout', async () => {
      const invalidPlace = {
        formatted_address: 'Copenhagen, Denmark',
        place_id: 'invalid-place-id',
        geometry: {
          location: {
            lat: () => 55.67,
            lng: () => 12.56,
          },
        },
      }

      mockAutocomplete.getPlace.mockReturnValue(invalidPlace)
      
      render(
        <GooglePlacesAutocomplete 
          onPlaceSelect={mockOnPlaceSelect}
          placeholder="Original placeholder"
        />
      )
      
      await waitFor(() => {
        expect(mockAutocomplete.addListener).toHaveBeenCalled()
      })

      const placeChangedCallback = mockAutocomplete.addListener.mock.calls.find(
        call => call[0] === 'place_changed'
      )?.[1]

      act(() => {
        placeChangedCallback()
      })

      const input = screen.getByRole('textbox')
      
      // Check error state
      await waitFor(() => {
        expect(input).toHaveAttribute('placeholder', 'Please select a location within Stockholm area')
      })

      // Fast-forward timer
      act(() => {
        jest.advanceTimersByTime(3000)
      })

      // Check that error state is reset
      await waitFor(() => {
        expect(input).toHaveAttribute('placeholder', 'Original placeholder')
      })
    })
  })

  describe('Cleanup', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('cleans up event listeners on unmount', async () => {
      const { unmount } = render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        expect(global.google.maps.places.Autocomplete).toHaveBeenCalled()
      })

      unmount()

      expect(global.google.maps.event.clearInstanceListeners).toHaveBeenCalled()
    })
  })

  describe('Input Interactions', () => {
    beforeEach(() => {
      mockGoogleMapsLoader.isApiLoaded.mockReturnValue(true)
    })

    it('handles input focus correctly', async () => {
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
      })

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      // Check that focus event was handled (doesn't crash)
      expect(input).toBeInTheDocument()
    })

    it('has correct input attributes', async () => {
      render(<GooglePlacesAutocomplete onPlaceSelect={mockOnPlaceSelect} />)
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('autoComplete', 'off')
        expect(input).toHaveAttribute('spellCheck', 'false')
        expect(input).toHaveAttribute('type', 'text')
      })
    })
  })
})