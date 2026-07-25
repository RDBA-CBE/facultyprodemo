// components/Header.js
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Homez</h2>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">listing</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Property</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Blog</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pages</a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Login / Register</a>
            <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700">
              Add Property
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;