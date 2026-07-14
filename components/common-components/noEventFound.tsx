import {  AlertCircle, Search } from 'lucide-react';
import Link from 'next/link';

const NoEventFound = () => {
  return (
    <div className="container mx-auto py-6  bg-gray-50 flex items-center justify-center px-4 ">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-purple-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Booking Found</h2>
        
        <p className="text-gray-600 mb-6">
          {`We couldn't find the booking you're looking for. It might have been removed`}
        </p>
        
        <div className="space-y-4">
          <Link href="/">
            <div className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              Browse Available Events
            </div>
          </Link>
          
          {/* <Link href="/">
            <div className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
              <Home className="h-5 w-5" />
              Return to Homepage
            </div>
          </Link> */}
        </div>
        
        {/* <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need assistance?{" "}
            <a href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
              Contact our support team
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default NoEventFound;