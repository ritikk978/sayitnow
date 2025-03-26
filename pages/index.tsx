"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import Navbar from '@/component/navbar';

const HomePage = () => {
  // State management
  const [isMuted, setIsMuted] = useState(false);
  const [videoUrl, setVideoUrl] = useState('./bg.mp4');
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(1);
  
  const videoRef = useRef(null);
  const menuRef = useRef(null);
  const featuresRef = useRef(null);

  // Handle scroll events to trigger animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Determine current section based on scroll position
      // This would be customized based on your section heights
      if (scrollPosition < 500) {
        setCurrentSection(0);
      } else if (scrollPosition < 1000) {
        setCurrentSection(1);
      } else {
        setCurrentSection(2);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Audio controls
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    setVolumeLevel(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      if (value === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  // Scroll to section
  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { 
        duration: 0.8 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 10
      },
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)"
    },
    tap: { 
      scale: 0.98 
    },
  };

  const navVariants = {
    hidden: { 
      y: -100,
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        delay: 0.8 
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      x: '100%',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -10,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Loading screen animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-white">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 0.7,
              ease: "easeOut"
            }
          }}
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-8 relative"
            animate={{ 
              rotate: 360,
              transition: { 
                duration: 2,
                ease: "linear",
                repeat: Infinity
              }
            }}
          >
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-400 border-opacity-50"></div>
            <motion.div 
              className="absolute inset-0 rounded-full border-t-4 border-r-4 border-white"
              animate={{ 
                rotate: 360,
                transition: { 
                  duration: 1.5, 
                  ease: "linear", 
                  repeat: Infinity 
                }
              }}
            ></motion.div>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold mb-4"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              transition: { 
                duration: 2,
                repeat: Infinity 
              }
            }}
          >
            Immersive Experience
          </motion.h1>
          <motion.p 
            className="text-lg text-indigo-200"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.5, duration: 0.8 }
            }}
          >
            Preparing something extraordinary for you...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Main content
  return (
    <>
      {/* Navigation Bar */}
      
      {/* Mobile Menu */}
       
      {/* Hero Section with Background Video */}
      <Navbar/>
      <motion.div
        className="h-screen flex items-center x`"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
      {/* Background Video */}
<div className="absolute inset-0 bg-black">
  <video
    ref={videoRef}
    src={videoUrl}
    autoPlay   
    muted
    loop
    className="absolute w-full h-full object-cover opacity-60"
  />
  {/* Color overlay gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-indigo-900/40 to-purple-900/30"></div>
</div>

        
        {/* Hero Content */}
        <div className="mx-auto  relative z-10 ml-10">
          <div className="max-w-3xl">
            <motion.span 
              className="inline-block py-1 px-3 rounded-full bg-indigo-900 bg-opacity-50 text-indigo-300 text-sm font-medium mb-6"
              variants={itemVariants}
            >
              Welcome to the Future
            </motion.span>
            
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white leading-tight"
              variants={itemVariants}
            >
              Revolutionize Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Digital Experience</span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl"
              variants={itemVariants}
            >
              Elevate your presence with cutting-edge solutions that blend innovation, design, and performance into seamless experiences that captivate your audience.
            </motion.p>
            
            <motion.div className="flex flex-wrap gap-4" variants={itemVariants}>
              <motion.button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-8 rounded-full shadow-lg flex items-center"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </motion.button>
              
              <motion.button
  className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 text-white font-medium py-3 px-8 rounded-full shadow-lg flex items-center"
  variants={buttonVariants}
  whileHover="hover"
  whileTap="tap"
  onClick={scrollToFeatures}
>
  Explore Features
  <ChevronDown className="ml-2 w-4 h-4" />
</motion.button>

</motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 10, 0],
            transition: { 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }
          }}
        >
          <ChevronDown className="text-white w-8 h-8 opacity-70" />
        </motion.div>

        {/* Controls (Bottom Right) */}
        <motion.div
          className="absolute bottom-6 right-6 z-20 flex items-center space-x-3"
          variants={itemVariants}
        >
          {/* Volume Controls */}
          <motion.div className="flex items-center space-x-2 bg-black bg-opacity-30 backdrop-blur-sm rounded-full px-3 py-2">
            <motion.button
              className="text-white focus:outline-none"
              onClick={handleToggleMute}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>
            
            {!isMuted && (
              <motion.input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeLevel}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-white bg-opacity-20 rounded-full appearance-none"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>

          {/* Settings Button */}
          <motion.button
            className="bg-black bg-opacity-30 backdrop-blur-sm text-white p-2 rounded-full"
            whileHover={{ scale: 1.1, rotate: 30 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={20} />
          </motion.button>
        </motion.div>
      </motion.div>

       <section 
        id="features" 
        ref={featuresRef}
        className="py-20 bg-gradient-to-b from-gray-900 to-indigo-900"
      >
        <div className="px-6 w-full">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              className="text-xl text-indigo-200 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Everything you need to create stunning digital experiences that captivate and convert.
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Immersive Design",
                description: "Create stunning visuals with our advanced design tools and templates.",
                icon: <Sparkles className="w-12 h-12 text-indigo-400" />
              },
              {
                title: "Global Reach",
                description: "Connect with audiences worldwide through optimized performance.",
                icon: <Globe className="w-12 h-12 text-indigo-400" />
              },
              {
                title: "Smart Analytics",
                description: "Gain valuable insights with our comprehensive analytics dashboard.",
                icon: <Settings className="w-12 h-12 text-indigo-400" />
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white bg-opacity-5 backdrop-blur-sm border border-indigo-500 border-opacity-20 rounded-xl p-8 hover:border-opacity-50 transition-all duration-300"
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div 
                  className="mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <motion.button
                  className="text-indigo-400 flex items-center font-medium"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Learn more
                  <ArrowRight size={16} className="ml-2" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Digital Experience?</h2>
            <p className="text-xl text-indigo-200 mb-10">Join thousands of satisfied customers who have elevated their online presence with our innovative solutions.</p>
            
            <motion.button
              className="bg-white text-indigo-900 font-bold py-4 px-10 rounded-full shadow-lg text-lg"
              whileHover={{ scale: 1.05, boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Sparkles className="text-indigo-400 mr-2" size={24} />
                <span className="font-bold text-xl">NEXUS</span>
              </div>
              <p className="text-gray-400 mb-6">Transforming digital experiences with cutting-edge innovation.</p>
              <div className="flex space-x-4">
                <motion.a href="#" whileHover={{ y: -3, color: "#4f46e5" }}>
                  <Twitter size={20} />
                </motion.a>
                <motion.a href="#" whileHover={{ y: -3, color: "#4f46e5" }}>
                  <Github size={20} />
                </motion.a>
                <motion.a href="#" whileHover={{ y: -3, color: "#4f46e5" }}>
                  <Linkedin size={20} />
                </motion.a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">hello@nexus.com</li>
                <li className="text-gray-400">+1 (555) 123-4567</li>
                <li className="text-gray-400">123 Innovation Drive</li>
                <li className="text-gray-400">San Francisco, CA 94107</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Nexus. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;

