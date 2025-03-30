import axios from 'axios';
import { motion } from 'framer-motion';
import { useRef } from 'hono/jsx';
import { Wand2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'


 

interface ImagenResponse {
  predictions: {
    bytesBase64Encoded: string;
    mimeType: string;
  }[];
}


const internalNavbar = () => {
    
   
     
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  
    // Theme Change Effect
    useEffect(() => {
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('dark', isDarkMode);
        document.body.classList.toggle('light', !isDarkMode);
      }
    }, [isDarkMode]);
    
  
       

    
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
          <div className="flex items-center space-x-4">
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
        </div>
      </header>

    </div>
  )
}

export default internalNavbar
