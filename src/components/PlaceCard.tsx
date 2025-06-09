import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { IPlace } from '@/models/Place';
import { useState } from 'react';
import Image from 'next/image';

interface PlaceCardProps {
  place: IPlace;
  onDelete?: (placeId: string) => void;
}

export default function PlaceCard({ place, onDelete }: PlaceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || !place._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/places/${place._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete place');
      }

      onDelete(place._id.toString());
    } catch (error) {
      console.error('Error deleting place:', error);
      alert('Failed to delete place. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <AspectRatio.Root ratio={16 / 9}>
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format"
          alt={place.name}
          fill
          className="object-cover"
        />
      </AspectRatio.Root>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {place.name}
          </h3>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {place.category}
            </span>
            {onDelete && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
                title="Delete place"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {place.description}
        </p>

        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{place.location.address}</span>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Added by {place.submittedBy}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Place
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &ldquo;{place.name}&rdquo;? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
