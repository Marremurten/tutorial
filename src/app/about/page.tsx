export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About Stockholm Places</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-4">
          Welcome to Stockholm Places - your guide to discovering the best spots in Sweden&apos;s beautiful capital city.
        </p>
        
        <p className="text-gray-600 mb-4">
          Our platform helps locals and visitors share and discover amazing places throughout Stockholm. 
          From cozy cafés in Gamla Stan to scenic viewpoints across the archipelago, we&apos;re building 
          a community-driven guide to the city we love.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-4">
          To connect people with the authentic Stockholm experience by sharing local insights 
          and hidden gems that make this city special.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Features</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Discover places across different categories (restaurants, parks, museums, and more)</li>
          <li>Geographic search focused on Stockholm area</li>
          <li>Community-driven reviews and recommendations</li>
          <li>Easy place submission with Google Maps integration</li>
        </ul>
      </div>
    </div>
  )
}