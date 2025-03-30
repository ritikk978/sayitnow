// component/aboutContent.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Target, 
  Award, 
  Users, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Twitter, 
  Github,
  Globe,
  Volume2,
  FileText,
  Film,
  Zap,
  Code,
  Sparkles,
  Shield
} from 'lucide-react';
import NavBar from '@/component/navbar';

// Brand name consistent with other components
const BRAND_NAME = "Say It Now";

const AboutContent = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Team members data - Say It Now specific
  const teamMembers = [
    {
      name: "Alexandra Chen",
      role: "CEO & AI Visionary",
      image: "https://source.unsplash.com/random/300x300/?woman,portrait,1",
      bio: "Former Google AI researcher with 15+ years developing voice and language models. Leading our mission to democratize AI media tools.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Marcus Johnson",
      role: "Chief Technology Officer",
      image: "https://source.unsplash.com/random/300x300/?man,portrait,1",
      bio: "Speech recognition pioneer and former AWS architect. Built our scalable cloud infrastructure and leads our development team.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Sophia Rodriguez",
      role: "Head of Voice Experience",
      image: "https://source.unsplash.com/random/300x300/?woman,portrait,2",
      bio: "Voice actor turned AI specialist. Expert in natural voice synthesis and emotional speech modeling for our TTS systems.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "David Kim",
      role: "Director of AI Video",
      image: "https://source.unsplash.com/random/300x300/?man,portrait,2",
      bio: "Computer vision researcher with background in Hollywood VFX. Leads our text-to-video generation technology.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  // Company stats - Say It Now specific
  const companyStats = [
    { value: "2019", label: "Founded", icon: <Clock className="h-6 w-6 text-indigo-600" /> },
    { value: "Counting", label: "Active Users", icon: <Users className="h-6 w-6 text-indigo-600" /> },
    { value: "Calculating", label: "Minutes Processed", icon: <Volume2 className="h-6 w-6 text-indigo-600" /> },
    { value: "40+", label: "Supported Languages", icon: <Globe className="h-6 w-6 text-indigo-600" /> }
  ];

  // Company values - Say It Now specific
  const companyValues = [
    {
      title: "AI Innovation",
      icon: <Sparkles className="h-10 w-10 text-indigo-600" />,
      description: "We push the boundaries of neural networks and deep learning to create the most natural-sounding voices and realistic videos."
    },
    {
      title: "User Empowerment",
      icon: <Target className="h-10 w-10 text-indigo-600" />,
      description: "We design our tools to be powerful yet accessible, enabling creators of all technical levels to harness AI technology."
    },
    {
      title: "Ethical AI",
      icon: <Shield className="h-10 w-10 text-indigo-600" />,
      description: "We develop our technology responsibly, with transparency about AI generation and protections against misuse."
    }
  ];

  // Company milestones - Say It Now specific
  const companyMilestones = [
    {
      year: "2025",
      title: "Foundation",
      description: "Started as a research project focused on neural text-to-speech models."
    },
    {
      year: "2025",
      title: "First TTS API",
      description: "Launched our first commercial API with mutliple voices and languages."
    },
    {
      year: "2025",
      title: "We are still growing...",
      description: ""
    },
    
  ];

  return (
    <>
      <NavBar scrolled={false} showMenu={showMenu} setShowMenu={setShowMenu} />

      <motion.div 
        className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-100 pt-24 pb-16 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto">
          {/* Hero section */}
          <motion.div 
            className="text-center mb-20"
            variants={itemVariants}
          >
            <motion.span 
              className="inline-block px-4 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full mb-5"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Our Story
            </motion.span>
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 relative inline-block"
              variants={itemVariants}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                About {BRAND_NAME}
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              We're on a mission to revolutionize content creation through accessible AI technology. Our voice synthesis, transcription, and video generation tools empower creators worldwide.
            </motion.p>
          </motion.div>

          {/* Technology showcase */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-500 bg-opacity-10 shadow-inner">
                  <Volume2 className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Text-to-Speech</h3>
              <p className="text-gray-600 text-center">Our neural TTS technology creates human-like voices with emotion and natural inflection across 40+ languages.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-10 shadow-inner">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Speech-to-Text</h3>
              <p className="text-gray-600 text-center">Industry-leading transcription with 99.7% accuracy, speaker diarization, and specialized vocabulary support.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 bg-opacity-10 shadow-inner">
                  <Film className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Text-to-Video</h3>
              <p className="text-gray-600 text-center">Cutting-edge AI that transforms scripts into engaging video content with customizable visual styles.</p>
            </motion.div>
          </motion.div>

          {/* Company stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            variants={itemVariants}
          >
            {companyStats.map((stat, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100"
                whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Our story section - Say It Now specific */}
          <motion.div className="mb-20" variants={itemVariants}>
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="prose prose-lg text-gray-600">
                  <p>
                    {BRAND_NAME} began in 2019 when our founders, a team of AI researchers and audio engineers, 
                    recognized that advances in neural networks could revolutionize media creation. What started 
                    as a research project to build more natural-sounding text-to-speech quickly evolved into something bigger.
                  </p>
                  <p>
                    We saw how content creators, businesses, and developers struggled with existing tools 
                    that produced robotic voices or required expensive recording studios. Our first TTS API 
                    launched in 2020 with just 8 voices, but users immediately recognized the quality difference.
                  </p>
                  <p>
                    As we expanded to speech recognition and, more recently, AI video generation, our core mission 
                    has remained constant: to democratize media creation with AI tools that are powerful, accessible, 
                    and ethically developed. Today, we're proud to serve over 50,000 users globally, from independent 
                    creators to Fortune 500 companies.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="md:w-1/2 rounded-lg overflow-hidden shadow-xl"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <img 
                  src="/ai.jpg" 
                  alt="AI technology visualization" 
                  className="w-full h-auto object-cover" 
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Timeline section - Say It Now milestones */}
          <motion.div 
            className="mb-20" 
            variants={itemVariants}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Journey</h2>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200 rounded"></div>
              
              {/* Timeline items */}
              {companyMilestones.map((milestone, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-center justify-between mb-8 relative ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                    <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                      {milestone.year.substring(2)}
                    </div>
                  </div>
                  
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Our mission & values - Say It Now specific */}
          <motion.div className="mb-20 bg-white rounded-2xl p-10 shadow-md border border-gray-100" variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Mission & Values</h2>
            
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                To democratize media creation by providing AI tools that enable anyone to produce 
                professional-quality voice, text, and video content without specialized skills or equipment.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {companyValues.map((value, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 shadow-md"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{value.title}</h3>
                  <p className="text-gray-600 text-center">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

         
 

          {/* Contact section - Say It Now specific */}
          <motion.div 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-10 text-white"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                <p className="text-indigo-100 mb-8">
                  Have questions about our AI media tools or want to explore enterprise solutions? Our team is ready to help!
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-indigo-200" />
                    <p>123 AI Innovation Park, San Francisco, CA 94107</p>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 mr-3 text-indigo-200" />
                    <p>hello@aimediasuite.com</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 mr-3 text-indigo-200" />
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Looking for API documentation?</h3>
                  <motion.button
                    className="bg-white/10 border border-white/30 text-white font-medium py-2 px-6 rounded-lg hover:bg-white/20 transition duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Code className="h-5 w-5 inline-block mr-2" />
                    Developer Portal
                  </motion.button>
                </div>
              </div>
              
              <div>
                <form>
                  <div className="mb-4">
                    <label className="block text-indigo-100 text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      className="bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-indigo-400 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-indigo-100 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-indigo-400 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-indigo-100 text-sm font-medium mb-2">I'm interested in</label>
                    <select
                      className="bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-indigo-400 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <option className="text-gray-800">Text-to-Speech API</option>
                      <option className="text-gray-800">Speech-to-Text Solutions</option>
                      <option className="text-gray-800">AI Video Generation</option>
                      <option className="text-gray-800">Enterprise Plan</option>
                      <option className="text-gray-800">Partnership Opportunities</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-indigo-100 text-sm font-medium mb-2">Message</label>
                    <textarea
                      className="bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-indigo-400 rounded-lg p-3 w-full h-32 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Tell us about your project or questions"
                    ></textarea>
                  </div>
                  <motion.button
                    className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg shadow-md w-full"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default AboutContent;