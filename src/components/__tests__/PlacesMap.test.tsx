import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlacesMap from '../PlacesMap';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock @vis.gl/react-google-maps
const mockMap = {
  fitBounds: jest.fn(),
  getZoom: jest.fn(),
  setZoom: jest.fn(),
};

const mockUseMap = jest.fn();

jest.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="api-provider">{children}</div>
  ),
  Map: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-map">{children}</div>
  ),
  AdvancedMarker: ({
    position,
    title,
    onClick,
  }: {
    position: { lat: number; lng: number };
    title: string;
    onClick: () => void;
  }) => (
    <button
      data-testid={`marker-${title}`}
      onClick={onClick}
      data-position={JSON.stringify(position)}
    >
      {title}
    </button>
  ),
  useMap: () => mockUseMap(),
}));

// Mock places data
const mockPlaces = [
  {
    _id: '1',
    name: 'Gamla Stan',
    description: 'Historic old town',
    category: 'Tourist Attraction',
    location: {
      address: 'Gamla Stan, Stockholm',
      coordinates: { lat: 59.3251, lng: 18.0711 },
    },
    images: [],
    submittedBy: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    _id: '2',
    name: 'Vasa Museum',
    description: 'Maritime museum',
    category: 'Museum',
    location: {
      address: 'Galärvarvsvägen 14, Stockholm',
      coordinates: { lat: 59.328, lng: 18.0916 },
    },
    images: [],
    submittedBy: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    _id: '3',
    name: 'Fotografiska',
    description: 'Photography museum',
    category: 'Museum',
    location: {
      address: 'Stadsgårdshamnen 22, Stockholm',
      coordinates: { lat: 59.3186, lng: 18.0845 },
    },
    images: [],
    submittedBy: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockCategories = ['Tourist Attraction', 'Museum', 'Restaurant'];

describe('PlacesMap', () => {
  const setupDefaultMocks = () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ places: mockPlaces }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories }),
      });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variable
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

    // Mock useMap hook
    mockUseMap.mockReturnValue(mockMap);

    // Mock Google Maps global
    global.google = {
      maps: {
        LatLngBounds: jest.fn(() => ({
          extend: jest.fn(),
          isEmpty: jest.fn(() => false),
        })),
        event: {
          addListenerOnce: jest.fn(),
          removeListener: jest.fn(),
        },
      },
    } as unknown as typeof global.google;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  });

  describe('Component Rendering', () => {
    it('renders loading state initially', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });

    it('renders map container when data is loaded', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });
    });

    it('renders category filter checkboxes', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('Tourist Attraction (1)')
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Museum (2)')).toBeInTheDocument();
        expect(screen.getByLabelText('Restaurant (0)')).toBeInTheDocument();
      });
    });

    it('displays error message when API key is missing', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      render(<PlacesMap />);

      expect(
        screen.getByText('Google Maps API key not configured')
      ).toBeInTheDocument();
    });

    it('displays error message when places API call fails', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: mockCategories }),
        });

      render(<PlacesMap />);

      await waitFor(() => {
        expect(screen.getByText(/Error loading places/)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('fetches places from API on mount', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/places');
      });
    });

    it('fetches categories from API on mount', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/categories');
      });
    });

    it('handles API response format correctly', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Map and Markers', () => {
    it('renders APIProvider and Map components', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('api-provider')).toBeInTheDocument();
          expect(screen.getByTestId('google-map')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('creates markers for all places', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
          expect(screen.getByTestId('marker-Vasa Museum')).toBeInTheDocument();
          expect(screen.getByTestId('marker-Fotografiska')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('fits map bounds to show all markers', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(mockMap.fitBounds).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Category Filtering', () => {
    it('filters markers when category is unchecked', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByLabelText('Museum (2)')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const museumCheckbox = screen.getByLabelText('Museum (2)');

      // Uncheck museum category
      fireEvent.click(museumCheckbox);

      await waitFor(
        () => {
          expect(museumCheckbox).not.toBeChecked();
          // Museum markers should be hidden
          expect(
            screen.queryByTestId('marker-Vasa Museum')
          ).not.toBeInTheDocument();
          expect(
            screen.queryByTestId('marker-Fotografiska')
          ).not.toBeInTheDocument();
          // Tourist attraction should still be visible
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows markers when category is checked', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByLabelText('Museum (2)')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const museumCheckbox = screen.getByLabelText('Museum (2)');

      // Uncheck then recheck museum category
      fireEvent.click(museumCheckbox);
      fireEvent.click(museumCheckbox);

      await waitFor(
        () => {
          expect(museumCheckbox).toBeChecked();
          expect(screen.getByTestId('marker-Vasa Museum')).toBeInTheDocument();
          expect(screen.getByTestId('marker-Fotografiska')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('allows multiple categories to be selected', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByLabelText('Museum (2)')).toBeInTheDocument();
          expect(
            screen.getByLabelText('Tourist Attraction (1)')
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const museumCheckbox = screen.getByLabelText('Museum (2)');
      const touristCheckbox = screen.getByLabelText('Tourist Attraction (1)');

      expect(museumCheckbox).toBeChecked();
      expect(touristCheckbox).toBeChecked();

      // Uncheck museum but keep tourist attraction
      fireEvent.click(museumCheckbox);
      expect(museumCheckbox).not.toBeChecked();
      expect(touristCheckbox).toBeChecked();
    });

    it('updates filter counts correctly', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByText('Museum (2)')).toBeInTheDocument();
          expect(
            screen.getByText('Tourist Attraction (1)')
          ).toBeInTheDocument();
          expect(screen.getByText('Restaurant (0)')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Sidebar Functionality', () => {
    it('opens sidebar when marker is clicked', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const marker = screen.getByTestId('marker-Gamla Stan');
      fireEvent.click(marker);

      await waitFor(
        () => {
          expect(screen.getByTestId('place-sidebar')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays place details in sidebar', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click on Gamla Stan marker
      const marker = screen.getByTestId('marker-Gamla Stan');
      fireEvent.click(marker);

      await waitFor(
        () => {
          // Check for sidebar-specific elements instead of duplicated text
          expect(screen.getByTestId('place-sidebar')).toBeInTheDocument();
          expect(screen.getByText('Historic old town')).toBeInTheDocument();
          expect(screen.getByText('Gamla Stan, Stockholm')).toBeInTheDocument();
          expect(screen.getByText('Tourist Attraction')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('closes sidebar when close button is clicked', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Open sidebar
      const marker = screen.getByTestId('marker-Gamla Stan');
      fireEvent.click(marker);

      await waitFor(
        () => {
          expect(screen.getByTestId('place-sidebar')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Close sidebar
      const closeButton = screen.getByLabelText('Close sidebar');
      fireEvent.click(closeButton);

      await waitFor(
        () => {
          expect(screen.queryByTestId('place-sidebar')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Fallback Coordinates', () => {
    it('generates fallback coordinates for places missing lat/lng', async () => {
      const placeWithoutCoordinates = {
        _id: '4',
        name: 'Place Without Coords',
        description: 'A place missing coordinates',
        category: 'Other',
        location: {
          address: 'Unknown, Stockholm',
          coordinates: { lat: null, lng: null },
        },
        images: [],
        submittedBy: 'Test User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ places: [placeWithoutCoordinates] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ categories: ['Other'] }),
        });

      render(<PlacesMap />);

      await waitFor(
        () => {
          const marker = screen.getByTestId('marker-Place Without Coords');
          expect(marker).toBeInTheDocument();

          // Check that fallback coordinates were generated (should be near Stockholm center)
          const position = JSON.parse(
            marker.getAttribute('data-position') || '{}'
          );
          expect(position.lat).toBeCloseTo(59.3293, 1);
          expect(position.lng).toBeCloseTo(18.0686, 1);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error Handling', () => {
    it('handles categories API error gracefully', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ places: mockPlaces }),
        })
        .mockRejectedValueOnce(new Error('Categories API Error'));

      render(<PlacesMap />);

      // Should still render map with fallback categories
      await waitFor(
        () => {
          expect(screen.getByTestId('map-container')).toBeInTheDocument();
          // Should fallback to predefined categories
          expect(screen.getByText('Restaurant (0)')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes to map container', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          const mapContainer = screen.getByTestId('map-container');
          expect(mapContainer).toHaveClass('w-full', 'h-full', 'min-h-[500px]');
        },
        { timeout: 3000 }
      );
    });

    it('applies responsive classes to sidebar', async () => {
      setupDefaultMocks();
      render(<PlacesMap />);

      await waitFor(
        () => {
          expect(screen.getByTestId('marker-Gamla Stan')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Open sidebar
      const marker = screen.getByTestId('marker-Gamla Stan');
      fireEvent.click(marker);

      await waitFor(
        () => {
          const sidebar = screen.getByTestId('place-sidebar');
          expect(sidebar).toHaveClass(
            'fixed',
            'right-0',
            'top-0',
            'h-full',
            'w-96'
          );
        },
        { timeout: 3000 }
      );
    });
  });
});
