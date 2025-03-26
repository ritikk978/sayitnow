"use client";

import React, { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle,
  Volume2,
  VolumeX,
  Download,
  Settings,
  ChevronDown,
  ArrowRight,
  Globe,
  Sparkles,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import Navbar from '@/component/navbar'; // Assuming Navbar component exists at this path

 
 
const HomePage = () => {
  // State management
  const [isMuted, setIsMuted] = useState(true); // Start muted to comply with autoplay policies
  const [videoUrl, setVideoUrl] = useState('./bg.mp4'); // Ensure this path is correct relative to your public folder
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false); // State for mobile menu (though menu itself is commented out)
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState(0); // State for tracking current section (optional)
  const [volumeLevel, setVolumeLevel] = useState(0.5); // Initial volume level (0 to 1)

  // Refs with explicit types
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for mobile menu container
  const featuresRef = useRef<HTMLElement>(null); // Ref for features section

  // Handle scroll events to trigger animations or navbar changes
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);

      // Example: Determine current section based on scroll position
      // Adjust these values based on your actual section heights/offsets
      const featuresTop = featuresRef.current?.offsetTop || 1000; // Estimate if ref not ready
      if (scrollPosition < window.innerHeight * 0.8) { // ~80% of viewport height
        setCurrentSection(0);
      } else if (scrollPosition < featuresTop + 500) { // Example threshold for features
        setCurrentSection(1);
      } else {
        setCurrentSection(2); // Example for sections below features
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array, runs once on mount

  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Attempt to play video after loading if not already playing (optional)
      // videoRef.current?.play().catch(error => console.log("Autoplay prevented:", error));
    }, 2000); // Adjust loading time as needed
    return () => clearTimeout(timer);
  }, []);

  // Handle clicks outside the mobile menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the ref exists and the click target is not contained within the menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    // Add listener only when the menu is shown
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener on component unmount or when showMenu changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]); // Re-run effect when showMenu changes

  // Audio controls
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      // If unmuting and volume was zero, set a default volume
      if (!nextMuted && videoRef.current.volume === 0) {
          const defaultVolume = 0.5;
          videoRef.current.volume = defaultVolume;
          setVolumeLevel(defaultVolume);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value); // Input value is string, convert to float
    setVolumeLevel(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      // Automatically mute/unmute based on volume slider
      const currentlyMuted = value === 0;
      setIsMuted(currentlyMuted);
      videoRef.current.muted = currentlyMuted;
    }
  };

  // Scroll to the features section smoothly
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2, staggerChildren: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.8 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.98 }
  };

  // Navbar variant (used in Navbar component if passed as prop, or applied directly if Navbar is simple)
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.8 } }
  };

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: '100%', transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    hover: { y: -10, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", transition: { type: "spring", stiffness: 300, damping: 20 } }
  };

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center text-white overflow-hidden">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }} // Added exit animation
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          >
            {/* Simplified spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400 border-t-transparent opacity-80"></div>
          </motion.div>
          <motion.h1
            className="text-3xl font-semibold mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.8 } }}
          >
            Loading Experience
          </motion.h1>
          <motion.p
            className="text-md text-indigo-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.8 } }}
          >
            Please wait a moment...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <>
      {/* Pass relevant props to Navbar if needed, e.g., scrolled state */}
      <Navbar scrolled={scrolled} showMenu={showMenu} setShowMenu={setShowMenu} />

      {/* Mobile Menu (Example Structure - uncomment and style as needed) */}
      {/* <AnimatePresence>
        {showMenu && (
          <motion.div
            ref={menuRef} // Attach ref here
            className="fixed inset-y-0 right-0 w-64 bg-gray-900 bg-opacity-95 backdrop-blur-md shadow-xl z-40 p-6"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
             <button onClick={() => setShowMenu(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
               <X size={24} />
             </button>
             <ul className="mt-16 space-y-4">
               <li><a href="#features" onClick={() => setShowMenu(false)} className="text-white hover:text-indigo-400 block">Features</a></li>
               <li><a href="#" onClick={() => setShowMenu(false)} className="text-white hover:text-indigo-400 block">About</a></li>
               <li><a href="#" onClick={() => setShowMenu(false)} className="text-white hover:text-indigo-400 block">Contact</a></li>
             </ul>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Hero Section with Background Video */}
      <motion.div
        className="relative h-screen flex items-center justify-start overflow-hidden" // Added relative and overflow-hidden
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Video Container */}
        <div className="absolute inset-0 bg-black z-[-1]"> {/* Ensure video is behind content */}
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted={isMuted} // Control muted state via React state
            loop
            playsInline // Important for mobile playback
            className="absolute w-full h-full object-cover opacity-50" // Adjusted opacity
            onVolumeChange={() => { // Sync state if volume changes externally (rare)
                if(videoRef.current) {
                    setVolumeLevel(videoRef.current.volume);
                    setIsMuted(videoRef.current.muted);
                }
            }}
          />
          {/* Color overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/50 to-purple-900/60"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10"> {/* Use container for better centering/padding */}
          <div className="max-w-3xl">
            <motion.span
              className="inline-block py-1 px-3 rounded-full bg-indigo-600 bg-opacity-70 text-indigo-100 text-xs font-medium mb-4 tracking-wide"
              variants={itemVariants}
            >
              FUTURE IS NOW
            </motion.span>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-white leading-tight"
              variants={itemVariants}
            >
              Experience the Next Level of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mt-1">
                Digital Interaction
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl"
              variants={itemVariants}
            >
              We craft immersive, high-performance web solutions that captivate your audience and drive results.
            </motion.p>

            <motion.div className="flex flex-wrap gap-4" variants={itemVariants}>
              <motion.button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-7 rounded-full shadow-lg flex items-center transition-all duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </motion.button>

              <motion.button
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 text-black font-medium py-3 px-7 rounded-full shadow-lg flex items-center transition-all duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={scrollToFeatures} // Attach scroll function
              >
                Explore Features
                <ChevronDown className="ml-2 w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
           onClick={scrollToFeatures} // Make indicator clickable
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          title="Scroll down or click to see features"
        >
          <ChevronDown className="text-white w-7 h-7 opacity-60 hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Video Controls (Bottom Right) */}
        <motion.div
          className="absolute bottom-5 right-5 z-20 flex items-center space-x-3"
          variants={itemVariants} // Animate controls in with content
        >
          {/* Volume Controls */}
          <motion.div className="flex items-center space-x-2 bg-black bg-opacity-40 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <motion.button
              className="text-white focus:outline-none hover:text-indigo-300 transition-colors"
              onClick={handleToggleMute}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </motion.button>

            {/* Volume Slider - appears when not muted */}
            <AnimatePresence>
              {!isMuted && (
                <motion.input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volumeLevel}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white bg-opacity-20 rounded-full appearance-none cursor-pointer accent-indigo-500" // Style the track and thumb
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: 80, opacity: 1, marginLeft: 8 }} // Adjust width and margin
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  aria-label="Volume control"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Settings Button (Example) */}
          <motion.button
            className="bg-black bg-opacity-40 backdrop-blur-sm text-white p-1.5 rounded-full shadow-md hover:text-indigo-300 transition-colors"
            whileHover={{ scale: 1.1, rotate: 20 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Video settings"
            title="Settings (coming soon)"
          >
            <Settings size={18} />
          </motion.button>
        </motion.div>
      </motion.div>

       {/* Features Section */}
       <section
        id="features"
        ref={featuresRef} // Attach ref here
        className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-indigo-950 text-white" // Adjusted background
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} // Trigger when 30% visible
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              // Inherit parent's animation or add slight delay
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Why Choose <span className="text-indigo-400">Us</span>?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-indigo-200 max-w-3xl mx-auto"
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              We provide the tools and expertise to build exceptional digital experiences that stand out.
            </motion.p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Immersive Design", description: "Visually stunning interfaces with seamless user experience.", icon: Sparkles },
              { title: "Peak Performance", description: "Optimized for speed and reliability across all devices.", icon: Globe }, // Changed icon example
              { title: "Data-Driven Insights", description: "Understand your audience with powerful analytics.", icon: Settings }, // Changed icon example
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 backdrop-blur-lg border border-indigo-700/30 rounded-xl p-6 md:p-8 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl"
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.2 }} // Trigger when 20% visible
                transition={{ delay: index * 0.15 }} // Stagger animation
              >
                <motion.div
                  className="mb-5 inline-block p-3 bg-indigo-500/20 rounded-lg"
                  // Add subtle animation to icon on card hover
                  variants={{ hover: { scale: 1.1, rotate: 5 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <feature.icon className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-5 text-sm leading-relaxed">{feature.description}</p>
                <motion.button
                  className="text-indigo-400 hover:text-indigo-300 flex items-center font-medium text-sm transition-colors"
                  whileHover={{ x: 4 }} // Move arrow slightly on hover
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  Learn more
                  <ArrowRight size={14} className="ml-1.5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-800 to-purple-800">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Ready to Elevate Your Digital Presence?</h2>
            <p className="text-lg md:text-xl text-indigo-200 mb-8">
              Let's build something amazing together. Start your journey with us today.
            </p>

            <motion.button
              className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg text-md hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              Request a Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Info */}
            <div>
              <div className="flex items-center mb-3">
                {/* Replace with your logo or brand icon */}
                <Sparkles className="text-indigo-500 mr-2" size={22} />
                <span className="font-bold text-lg text-white">NEXUS</span>
              </div>
              <p className="text-sm mb-4">Crafting the future of digital interaction.</p>
              <div className="flex space-x-4">
                <motion.a href="#" aria-label="Twitter" title="Twitter" className="hover:text-indigo-400 transition-colors" whileHover={{ y: -2 }}> <Twitter size={18} /> </motion.a>
                <motion.a href="#" aria-label="GitHub" title="GitHub" className="hover:text-indigo-400 transition-colors" whileHover={{ y: -2 }}> <Github size={18} /> </motion.a>
                <motion.a href="#" aria-label="LinkedIn" title="LinkedIn" className="hover:text-indigo-400 transition-colors" whileHover={{ y: -2 }}> <Linkedin size={18} /> </motion.a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Status</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Get In Touch</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><MessageCircle size={14} className="mr-2 flex-shrink-0" /> hello@nexus.dev</li>
                {/* Add more contact info if needed */}
                <li className="text-xs mt-2">123 Innovation Ave, Tech City</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center text-xs">
            <p className="mb-2 md:mb-0">© {new Date().getFullYear()} Nexus Technologies. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;