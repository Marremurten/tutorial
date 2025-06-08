import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { IPlace } from '@/models/Place';

interface PlaceCardProps {
  place: IPlace;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <AspectRatio.Root ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format"
          alt={place.name}
          className="w-full h-full object-cover"
        />
      </AspectRatio.Root>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {place.name}
          </h3>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 ml-2 flex-shrink-0">
            {place.category}
          </span>
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
    </div>
  );
}