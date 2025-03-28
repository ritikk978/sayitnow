"use client";

import React, { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle,
  Volume2, // Used for TTS Feature
  VolumeX,
  Download,
  Settings, // Could represent configuration/customization
  ChevronDown,
  ArrowRight,
  Globe, // Could represent multi-language support
  Sparkles, // General AI/Magic feel
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  FileText, // Good icon for STT Feature
  Film, // Good icon for Text-to-Video Feature
  Mic // Alternative for STT/TTS
} from 'lucide-react';
import Navbar from '@/component/navbar'; // Assuming Navbar component exists

// --- NEW BRAND NAME (Suggestion - replace if you have one) ---
const BRAND_NAME = "AI Media Suite"; // Use a name that reflects your services

const HomePage = () => {
  // State management (remains the same)
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState('./bg.mp4'); // Keep or change to a more relevant abstract tech/sound wave video if possible
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0.5);

  // Refs (remains the same)
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  // useEffect hooks for scroll, loading, menu click outside (remain the same)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      const featuresTop = featuresRef.current?.offsetTop || 1000;
      if (scrollPosition < window.innerHeight * 0.8) {
        setCurrentSection(0);
      } else if (scrollPosition < featuresTop + 500) {
        setCurrentSection(1);
      } else {
        setCurrentSection(2);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // Slightly faster load simulation
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Audio controls (remain the same)
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted && videoRef.current.volume === 0) {
          const defaultVolume = 0.5;
          videoRef.current.volume = defaultVolume;
          setVolumeLevel(defaultVolume);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolumeLevel(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      const currentlyMuted = value === 0;
      setIsMuted(currentlyMuted);
      videoRef.current.muted = currentlyMuted;
    }
  };

  // Scroll to features (remains the same)
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Animation Variants (remain the same)
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.2, staggerChildren: 0.3 } }, exit: { opacity: 0, transition: { duration: 0.8 } } };
  const itemVariants = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } } };
  const buttonVariants = { hover: { scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)" }, tap: { scale: 0.98 } };
  const navVariants = { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.8 } } };
  const mobileMenuVariants = { hidden: { x: '100%' }, visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }, exit: { x: '100%', transition: { type: "spring", stiffness: 300, damping: 30 } } };
  const featureCardVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }, hover: { y: -10, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", transition: { type: "spring", stiffness: 300, damping: 20 } } };

  // --- Loading Screen (Content Updated Slightly) ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center text-white overflow-hidden">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400 border-t-transparent opacity-80"></div>
          </motion.div>
          <motion.h1
            className="text-3xl font-semibold mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.8 } }}
          >
            Loading {BRAND_NAME} {/* Use Brand Name */}
          </motion.h1>
          <motion.p
            className="text-md text-indigo-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.8 } }}
          >
            Preparing your AI toolkit... {/* Updated text */}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <>
      {/* Pass relevant props to Navbar */}
      <Navbar scrolled={scrolled} showMenu={showMenu} setShowMenu={setShowMenu}  /> {/* Pass brand name */}

      {/* Mobile Menu (Keep commented or implement as needed) */}
      {/* ... mobile menu structure ... */}

      {/* Hero Section with Background Video (Content Updated) */}
      <motion.div
        className="relative h-screen flex items-center justify-start overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Video Container (remains the same) */}
        <div className="absolute inset-0 bg-black z-[-1]">
          <video ref={videoRef} src={videoUrl} autoPlay muted={isMuted} loop playsInline className="absolute w-full h-full object-cover opacity-50" onVolumeChange={() => { if(videoRef.current) { setVolumeLevel(videoRef.current.volume); setIsMuted(videoRef.current.muted); } }} />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/50 to-purple-900/60"></div>
        </div>

        {/* Hero Content (Updated) */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.span
              className="inline-block py-1 px-3 rounded-full bg-indigo-600 bg-opacity-70 text-indigo-100 text-xs font-medium mb-4 tracking-wide"
              variants={itemVariants}
            >
              AI-POWERED MEDIA TOOLS {/* Updated Tag */}
            </motion.span>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-white leading-tight"
              variants={itemVariants}
            >
              Transform Content with {/* Updated Headline */}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mt-1">
                Speech, Text & Video AI
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl"
              variants={itemVariants}
            >
              {/* Updated Description */}
              Leverage cutting-edge AI for seamless Text-to-Speech generation, accurate Speech-to-Text transcription, and innovative Text-to-Video creation. Built for creators and developers.
            </motion.p>

            <motion.div className="flex flex-wrap gap-4" variants={itemVariants}>
              <motion.button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-7 rounded-full shadow-lg flex items-center transition-all duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                // Link to signup or dashboard later
              >
                Start Creating {/* Updated CTA Text */}
                <ArrowRight size={18} className="ml-2" />
              </motion.button>

              <motion.button
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 text-white font-medium py-3 px-7 rounded-full shadow-lg flex items-center transition-all duration-300" // Adjusted text color
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={scrollToFeatures}
              >
                Explore AI Features {/* Updated CTA Text */}
                <ChevronDown className="ml-2 w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator (remains the same) */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
           onClick={scrollToFeatures}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          title="Scroll down or click to see features"
        >
          <ChevronDown className="text-white w-7 h-7 opacity-60 hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Video Controls (remains the same) */}
        <motion.div
          className="absolute bottom-5 right-5 z-20 flex items-center space-x-3"
          variants={itemVariants}
        >
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
            <AnimatePresence>
              {!isMuted && (
                <motion.input
                  type="range" min="0" max="1" step="0.01" value={volumeLevel} onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white bg-opacity-20 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: 80, opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  aria-label="Volume control"
                />
              )}
            </AnimatePresence>
          </motion.div>
          <motion.button
            className="bg-black bg-opacity-40 backdrop-blur-sm text-white p-1.5 rounded-full shadow-md hover:text-indigo-300 transition-colors"
            whileHover={{ scale: 1.1, rotate: 20 }} whileTap={{ scale: 0.9 }}
            aria-label="Video settings" title="Settings (coming soon)"
          >
            <Settings size={18} />
          </motion.button>
        </motion.div>
      </motion.div>

       {/* Features Section (Content Updated) */}
       <section
        id="features"
        ref={featuresRef}
        className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-indigo-950 text-white"
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Core <span className="text-indigo-400">AI Capabilities</span> {/* Updated Title */}
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-indigo-200 max-w-3xl mx-auto"
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Updated Subtitle */}
              Explore our suite of AI tools designed for seamless content transformation and creation.
            </motion.p>
          </motion.div>

          {/* Feature Cards Grid (Updated Content & Icons) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Lifelike Text-to-Speech (TTS)",
                description: "Generate natural-sounding voiceovers in multiple languages and voices using advanced neural networks. Perfect for videos, podcasts, e-learning, and accessibility.",
                icon: Volume2 // Specific icon for TTS
              },
              {
                title: "Accurate Speech-to-Text (STT)",
                description: "Transcribe audio and video files quickly and reliably with high accuracy. Supports various formats and languages, ideal for meetings, interviews, and content analysis.",
                icon: FileText // Specific icon for STT
              },
              {
                title: "AI Text-to-Video Generation",
                description: "Bring your scripts and ideas to life. Automatically generate engaging short videos from text prompts, complete with relevant visuals and optional AI voiceovers. (Under Development)",
                icon: Film // Specific icon for Video
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 backdrop-blur-lg border border-indigo-700/30 rounded-xl p-6 md:p-8 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl flex flex-col" // Added flex flex-col
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.15 }}
              >
                <motion.div
                  className="mb-5 inline-block p-3 bg-indigo-500/20 rounded-lg self-start" // Align icon left
                  variants={{ hover: { scale: 1.1, rotate: 5 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <feature.icon className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow mb-5">{feature.description}</p> {/* Added flex-grow */}
                <motion.button
                  className="text-indigo-400 hover:text-indigo-300 flex items-center font-medium text-sm transition-colors mt-auto" // Added mt-auto
                  whileHover={{ x: 4 }}
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

      {/* Call to Action Section (Content Updated) */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-800 to-purple-800">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
                Ready to Revolutionize Your Content Workflow? {/* Updated Headline */}
            </h2>
            <p className="text-lg md:text-xl text-indigo-200 mb-8">
                {/* Updated Description */}
              Sign up for early access or explore our documentation to see how {BRAND_NAME} can help you create amazing content faster.
            </p>

            <motion.button
              className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg text-md hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              // Link to signup or contact page
            >
              Get Early Access {/* Updated CTA Text */}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer (Content Updated) */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Info */}
            <div>
              <div className="flex items-center mb-3">
                {/* Use a relevant icon */}
                <Sparkles className="text-indigo-500 mr-2" size={22} />
                <span className="font-bold text-lg text-white">{BRAND_NAME}</span> {/* Use Brand Name */}
              </div>
              <p className="text-sm mb-4">
                {/* Updated Description */}
                AI-powered tools for Text-to-Speech, Speech-to-Text, and Video Generation.
              </p>
              <div className="flex space-x-4">
                 {/* Keep social links or update URLs */}
                <motion.a href="#" aria-label="Twitter" title="Twitter" className="hover:text-indigo-400 transition-colors" whileHover={{ y: -2 }}> <Twitter size={18} /> </motion.a>
                <motion.a href="#" aria-label="GitHub" title="GitHub" className="hover:text-indigo-400 transition-colors" whileHover={{ y: -2 }}> <Github size={18} /> </motion.a>
                <motion.a href="#" aria-label="LinkedIn" title="LinkedIn" className="hover:text-indigo-400 transition-colors" whileHover={{ y: -2 }}> <Linkedin size={18} /> </motion.a>
              </div>
            </div>

            {/* Quick Links (Keep relevant links) */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Text-to-Speech</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Speech-to-Text</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Text-to-Video</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li> {/* Keep generic important links */}
              </ul>
            </div>

            {/* Resources (Keep relevant links) */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li> {/* More specific */}
                <li><a href="#" className="hover:text-white transition-colors">Use Cases</a></li> {/* Good to show potential */}
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Contact Info (Update Email if needed) */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Get In Touch</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><MessageCircle size={14} className="mr-2 flex-shrink-0" /> contact@{BRAND_NAME.toLowerCase().replace(/\s+/g, '')}.ai</li> {/* Example email */}
                <li className="text-xs mt-2">Building the Future of AI Media</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center text-xs">
            <p className="mb-2 md:mb-0">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p> {/* Use Brand Name */}
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