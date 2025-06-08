'use client';

import { useEffect, useState } from 'react';
import PlaceCard from '@/components/PlaceCard';
import AddPlaceForm from '@/components/AddPlaceForm';
import { IPlace } from '@/models/Place';

export default function Home() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places');
      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }
      const data = await response.json();
      setPlaces(data.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handlePlaceAdded = () => {
    setSuccessMessage('Your place has been added successfully!');
    fetchPlaces(); // Refresh the places list
    setTimeout(() => setSuccessMessage(null), 5000); // Clear message after 5 seconds
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading places...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stockholm Places
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing places shared by locals and visitors
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Add Place Form */}
        <AddPlaceForm onSuccess={handlePlaceAdded} />

        {places.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No places found</p>
            <p className="text-gray-500 mt-2">Be the first to add a place!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map((place) => (
              <PlaceCard key={place._id?.toString()} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
