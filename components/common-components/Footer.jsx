// components/Footer.js
import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="section-wid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Need help? Talk to our expert.</h3>
            <p className="text-gray-400 mb-4">Talk to our experts or Browse through more properties.</p>
            <div className="space-y-2">
              <p className="font-semibold text-white"><a href="tel:+012305094502">+(0) 123 050 945 02</a></p>
              <p className="text-[#F2B31D] font-semibold"><a href="mailto:facultyplus@gmail.com">facultyplus@gmail.com</a></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-[500] mb-4 text-white">Apps</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white">Apple Store</a>
              <a href="#" className="block text-gray-400 hover:text-white">Google Play</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-[500] mb-4 text-white">Follow us on social media</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-[#F2B31D] hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-[#F2B31D] hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-[#F2B31D] hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-[500] mb-4 text-white">Keep Yourself Up to Date</h4>
            <div className="flex">
              <input type="email" placeholder="Your email" className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l focus:outline-none" />
              <button className="bg-[#F2B31D] px-4 py-2 rounded-r font-medium text-white">Subscribe</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">© Real Estate - All rights reserved</p>
          <a
            href="/remove-account"
            className="mt-3 inline-block text-gray-400 hover:text-white"
          >
            Delete Account
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;