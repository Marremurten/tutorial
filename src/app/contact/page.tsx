import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
      
      <div className="max-w-2xl">
        <p className="text-lg text-gray-700 mb-8">
          We&apos;d love to hear from you! Get in touch with questions, suggestions, or just to say hello.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="text-gray-600">hello@stockholmplaces.com</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Social Media</h3>
                <p className="text-gray-600">Follow us for updates and featured places</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Submit a Place</h3>
                <p className="text-gray-600">
                  Know a great spot in Stockholm? 
                  <Link href="/" className="text-blue-600 hover:text-blue-800 ml-1">
                    Add it to our map
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedback</h2>
            <p className="text-gray-600 mb-4">
              Help us improve Stockholm Places by sharing your thoughts and suggestions.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Coming Soon:</strong> Contact form and direct messaging features 
                to make it even easier to connect with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}