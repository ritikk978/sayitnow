import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'hono/jsx';
import { Wand2, Menu, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ImagenResponse {
  predictions: {
    bytesBase64Encoded: string;
    mimeType: string;
  }[];
}

const InternalNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Theme Change Effect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('light', !isDarkMode);
    }
  }, [isDarkMode]);
  
  // Close menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle menu toggle
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <div>
      {/* Header Bar */}
      <header className={`sticky top-0 z-50 ${
        isDarkMode 
          ? 'bg-black bg-opacity-80 backdrop-blur-md border-b border-gray-800' 
          : 'bg-white bg-opacity-80 backdrop-blur-md border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wand2 className="text-white w-6 h-6" />
            </motion.div>
            <div>
              <h1 className={` ${!isDarkMode ? 'text-black' : 'text-white'} text-xl font-bold`}>Say It Now</h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Powered by Google AI</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href={'/'} className={`${
              isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'
            } text-sm font-medium transition-colors`}>
              Home
            </Link>
            <Link href={'/converter'} className={`${
              isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'
            } text-sm font-medium transition-colors`}>
              Text-To-Speech
            </Link>
            <Link href={'/textToImage'} className={`${
              isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'
            } text-sm font-medium transition-colors`}>
              Text-To-Image
            </Link>
            <button
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 cursor-pointer text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors mr-2`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 cursor-pointer text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-800' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden ${
                isDarkMode 
                  ? 'bg-gray-900 border-t border-gray-800' 
                  : 'bg-white border-t border-gray-200'
              }`}
            >
              <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
                <Link 
                  href={'/'} 
                  className={`px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-200 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  } text-sm font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href={'/converter'} 
                  className={`px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-200 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  } text-sm font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Text-To-Speech
                </Link>
                <Link 
                  href={'/textToImage'} 
                  className={`px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-200 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  } text-sm font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Text-To-Image
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default InternalNavbar;