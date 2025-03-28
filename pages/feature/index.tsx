// component/features.jsx
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  Volume2,        // For TTS
  FileText,       // For STT
  Film,           // For Text-to-Video
  Code,           // For API / Developer Focus
  Sliders,        // For Customization
  Globe,          // For Language Support
  Zap,            // For Speed/Performance
  Sparkles,       // For AI / User Experience
  Layers,         // For Integrated Workflows
  BarChart2,      // For Analytics
  Users,          // For Collaboration
  Shield,         // For Security
  Cloud,          // For Cloud Storage
  ArrowRight,     // For CTAs
  Star,           // For Testimonials
  Award,          // For Enterprise Features
  Cpu,            // For AI/ML
  MessageSquare,  // For Support
  Heart,          // For User Favorites
  CheckCircle,    // For Feature Highlights
} from 'lucide-react';
import NavBar from '@/component/navbar';
import Image from 'next/image';
import Link from 'next/link';

// Brand name consistent with HomePage
const BRAND_NAME = "AI Media Suite";

const FeaturesContent = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [visibleFeatures, setVisibleFeatures] = useState(8);
  const controls = useAnimation();
  const testimonialControls = useAnimation();

  useEffect(() => {
    controls.start("visible");
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 800) {
        testimonialControls.start("visible");
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls, testimonialControls]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    hover: { y: -8, scale: 1.03, boxShadow: "0px 12px 35px rgba(0, 0, 0, 0.08)", transition: { type: "spring", stiffness: 300, damping: 15 } }
  };

  // Expanded Features data
  const allFeatures = [
    {
      title: "Natural Text-to-Speech (TTS)",
      description: "Generate human-like, engaging voiceovers from text in dozens of languages and voices using state-of-the-art neural networks.",
      icon: <Volume2 className="h-8 w-8 text-indigo-600" />,
      color: "from-indigo-500 to-blue-500",
      category: "core",
      benefits: ["100+ natural-sounding voices", "Emotional tone control", "Custom voice creation", "Real-time synthesis"]
    },
    {
      title: "Accurate Speech-to-Text (STT)",
      description: "Transcribe audio and video content with high precision. Supports various formats, speaker diarization, and custom vocabularies.",
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      color: "from-purple-500 to-pink-500",
      category: "core",
      benefits: ["99.7% accuracy rate", "Speaker identification", "Custom vocabulary support", "15+ file formats"]
    },
    {
      title: "AI Text-to-Video Creation",
      description: "Transform text prompts or scripts into compelling short videos automatically. Ideal for social media, marketing snippets, and conceptualization.",
      icon: <Film className="h-8 w-8 text-green-600" />,
      color: "from-green-500 to-emerald-500",
      category: "core",
      badge: "Beta",
      benefits: ["Visual style customization", "Stock footage integration", "Automatic scene transitions", "Background music library"]
    },
    {
      title: "Powerful Developer API",
      description: "Easily integrate our TTS, STT, and video generation capabilities into your own applications and workflows via a robust REST API.",
      icon: <Code className="h-8 w-8 text-sky-600" />,
      color: "from-sky-500 to-cyan-500",
      category: "developers",
      benefits: ["Comprehensive documentation", "Webhook support", "Rate limits up to 1000 req/min", "SDKs for 5+ languages"]
    },
    {
      title: "Extensive Customization",
      description: "Fine-tune voice parameters (pitch, speed, emotion), transcription settings, and video styles to perfectly match your requirements.",
      icon: <Sliders className="h-8 w-8 text-fuchsia-600" />,
      color: "from-fuchsia-500 to-violet-500",
      category: "ux",
      benefits: ["Voice style mixing", "Pronunciation adjustments", "Advanced SSML support", "Custom audio effects"]
    },
    {
      title: "Global Language Support",
      description: "Reach a worldwide audience with support for numerous languages across both speech synthesis and transcription services.",
      icon: <Globe className="h-8 w-8 text-teal-600" />,
      color: "from-teal-500 to-emerald-500",
      category: "core",
      benefits: ["60+ languages supported", "Dialect recognition", "Automatic language detection", "Multilingual projects"]
    },
    {
      title: "Fast & Scalable",
      description: "Built on reliable cloud infrastructure (powered by AWS) to ensure rapid processing times and seamless scaling for demanding workloads.",
      icon: <Zap className="h-8 w-8 text-amber-600" />,
      color: "from-amber-500 to-yellow-500",
      category: "infrastructure",
      benefits: ["99.9% uptime SLA", "Auto-scaling compute", "Global CDN distribution", "Batch processing"]
    },
    {
      title: "Intuitive Workflow",
      description: "Manage your projects, synthesize speech, transcribe files, and generate videos through a clean and user-friendly interface.",
      icon: <Sparkles className="h-8 w-8 text-red-600" />,
      color: "from-red-500 to-orange-500",
      category: "ux",
      benefits: ["Project templates", "Drag-and-drop interface", "Progress tracking", "Automated workflows"]
    },
    {
      title: "Advanced Analytics",
      description: "Track usage, performance metrics, and content engagement across all your AI media projects in real-time.",
      icon: <BarChart2 className="h-8 w-8 text-blue-600" />,
      color: "from-blue-500 to-sky-500",
      category: "enterprise",
      benefits: ["Custom dashboards", "Export reports", "Usage forecasting", "Cost optimization insights"]
    },
    {
      title: "Team Collaboration",
      description: "Enable seamless teamwork with shared projects, role-based permissions, and collaborative editing capabilities.",
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      color: "from-emerald-500 to-teal-500",
      category: "enterprise",
      benefits: ["Unlimited team members", "Role-based access", "Commenting system", "Version history"]
    },
    {
      title: "Enterprise Security",
      description: "Keep your content secure with enterprise-grade encryption, compliance certifications, and advanced access controls.",
      icon: <Shield className="h-8 w-8 text-gray-600" />,
      color: "from-gray-500 to-slate-500",
      category: "enterprise",
      benefits: ["SOC 2 compliance", "End-to-end encryption", "Custom data retention", "GDPR compliant"]
    },
    {
      title: "Cloud Storage",
      description: "Store, organize, and access all your media files securely in the cloud with automatic backups and version control.",
      icon: <Cloud className="h-8 w-8 text-cyan-600" />,
      color: "from-cyan-500 to-blue-500",
      category: "infrastructure",
      benefits: ["Unlimited storage (Enterprise)", "Auto file organization", "Version history", "Secure sharing"]
    },
    {
      title: "Neural Voice Cloning",
      description: "Create custom AI voices that match specific vocal characteristics with just a few minutes of sample audio.",
      icon: <Cpu className="h-8 w-8 text-violet-600" />,
      color: "from-violet-500 to-purple-500",
      category: "advanced",
      badge: "Pro",
      benefits: ["Minimal training audio", "Voice style transfer", "Accent preservation", "Emotion modeling"]
    },
    {
      title: "Content Localization",
      description: "Automatically translate and adapt your content for global audiences while maintaining natural voice quality and cultural nuances.",
      icon: <MessageSquare className="h-8 w-8 text-pink-600" />,
      color: "from-pink-500 to-rose-500",
      category: "advanced",
      benefits: ["45+ target languages", "Cultural adaptation", "Voice matching across languages", "Subtitle generation"]
    },
    {
      title: "Media Accessibility Tools",
      description: "Make your content accessible with automatic captioning, audio descriptions, and compliance-focused tools.",
      icon: <Heart className="h-8 w-8 text-rose-600" />,
      color: "from-rose-500 to-red-500",
      category: "ux",
      benefits: ["ADA compliance features", "Multiple caption formats", "Audio description", "Accessibility scoring"]
    },
    {
      title: "Content Distribution",
      description: "Publish your AI-generated content directly to platforms like YouTube, Podcast services, and social media channels.",
      icon: <Layers className="h-8 w-8 text-orange-600" />,
      color: "from-orange-500 to-amber-500",
      category: "advanced",
      benefits: ["20+ platform integrations", "Scheduled publishing", "Cross-platform analytics", "Engagement tracking"]
    },
  ];

  // Filter features based on active tab
  const filteredFeatures = activeTab === "all" 
    ? allFeatures 
    : allFeatures.filter(feature => feature.category === activeTab);

  // Testimonial data
  const testimonials = [
    {
      quote: "AI Media Suite has completely transformed our podcast production workflow. What used to take hours now happens in minutes.",
      author: "Sarah Johnson",
      position: "Head of Content, Media Masters",
      logo: "/media-masters-logo.png"
    },
    {
      quote: "The API integration was seamless, and the speech quality is remarkably natural. Our users can't tell the difference from human narration.",
      author: "David Chen",
      position: "CTO, Innovate Inc.",
      logo: "/innovate-logo.png"
    },
    {
      quote: "We've reduced our content localization costs by 70% while improving quality across 12 languages. Game changer for our global strategy.",
      author: "Maria Rodriguez",
      position: "Global Marketing Director, Content Crafters",
      logo: "/content-crafters-logo.png"
    }
  ];

  // Category tabs data
  const categories = [
    { id: "all", label: "All Features" },
    { id: "core", label: "Core Features" },
    { id: "ux", label: "User Experience" },
    { id: "developers", label: "For Developers" },
    { id: "enterprise", label: "Enterprise" },
    { id: "infrastructure", label: "Infrastructure" },
    { id: "advanced", label: "Advanced AI" }
  ];

  // Stat highlights
  const stats = [
    { value: "60+", label: "Languages Supported" },
    { value: "99.7%", label: "Speech Recognition Accuracy" },
    { value: "500K+", label: "Hours Monthly Generation Capacity" },
    { value: "Fresh", label: "Start" }
  ];

  return (
    <>
      <NavBar 
        scrolled={false} 
        showMenu={showMenu} 
        setShowMenu={setShowMenu} 
       />

      <motion.div
        className="bg-gradient-to-b from-gray-50 via-white to-gray-100 pt-24 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <motion.div
            className="text-center mb-16 md:mb-20"
            variants={itemVariants}
          >
            <motion.span 
              className="inline-block px-4 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full mb-5"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Powerful AI Media Tools
            </motion.span>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 relative inline-block"
              variants={itemVariants}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {BRAND_NAME} Features
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
              variants={itemVariants}
            >
              Unlock the power of AI for your audio and video content creation with our comprehensive suite of tools.
            </motion.p>
            
            {/* Stats Highlight */}
            <motion.div 
              className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12"
              variants={itemVariants}
              transition={{ delay: 0.6 }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <h3 className="text-3xl font-bold text-indigo-600">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
            
            {/* Category Tabs */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-12"
              variants={itemVariants}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === category.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {filteredFeatures.slice(0, visibleFeatures).map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full relative"
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                whileHover="hover"
              >
                {feature.badge && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {feature.badge}
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <div className={`w-16 h-16 mb-5 rounded-lg flex items-center justify-center bg-gradient-to-br ${feature.color} bg-opacity-10 shadow-inner`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                  
                  {/* Feature Highlights */}
                  <ul className="space-y-2 mt-4">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                <div className={`h-1.5 bg-gradient-to-r ${feature.color}`} />
              </motion.div>
            ))}
          </div>
          
          {/* Load More Button */}
          {filteredFeatures.length > visibleFeatures && (
            <div className="text-center mb-20">
              <motion.button
                className="bg-white text-indigo-600 border border-indigo-200 font-medium py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md transition duration-300"
                onClick={() => setVisibleFeatures(prev => prev + 8)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Load More Features
              </motion.button>
            </div>
          )}
          
          

          {/* Call to Action */}
          <motion.div
            className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white max-w-5xl mx-auto "
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <motion.h2
                  className="text-3xl font-bold mb-5"
                >
                  Ready to Transform Your Content Creation?
                </motion.h2>
                <motion.p
                  className="text-lg mb-8 text-indigo-100 max-w-3xl"
                >
                  Start leveraging AI for Text-to-Speech, Transcription, and Video Generation today.
                </motion.p>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 hover:shadow-lg transition duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign Up for Free
                  </motion.button>
                  <motion.button
                    className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Schedule Demo
                  </motion.button>
                </div>
              </div>
              <div className="relative h-full">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <ul className="space-y-3">
                    {["Free 14-day trial", "No credit card required", "5 AI voices included", "1 hour free transcription", "Basic video generation"].map((item, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                        <span className="text-white font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full">
                  Limited Time Offer
                </div>
              </div>
            </div>
          </motion.div>

         

          {/* FAQ Section */}
          <motion.div
            className="bg-white mt-10 rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-6 py-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about {BRAND_NAME}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  question: "What makes AI Media Suite different from other AI voice tools?",
                  answer: "AI Media Suite offers a comprehensive solution that combines text-to-speech, speech-to-text, and text-to-video capabilities in one integrated platform. Our neural voice technology produces significantly more natural-sounding voices with emotional range, and our developer API offers enterprise-grade reliability and customization options not found in other solutions."
                },
                {
                  question: "How accurate is the speech recognition?",
                  answer: "Our speech recognition technology achieves 99.7% accuracy for clear audio in supported languages, with advanced features like speaker diarization, background noise filtering, and custom vocabulary training to further improve results in specialized domains."
                },
                {
                  question: "Can I create custom voices that sound like me?",
                  answer: "Yes! Our Neural Voice Cloning feature (available on Pro and Enterprise plans) can create a custom AI voice that matches your vocal characteristics with just a few minutes of sample audio. This is perfect for consistent branding, personalized content, and scaling your voice across multiple projects."
                },
                {
                  question: "What file formats are supported?",
                  answer: "For audio input/output: MP3, WAV, AAC, FLAC, OGG, and more. For video: MP4, MOV, AVI, and WebM. For transcription: We can process audio from any common format or extract audio from video files automatically."
                },
                {
                  question: "Is there a free trial available?",
                  answer: "Yes, we offer a 14-day free trial with no credit card required. This includes access to our core features with generous usage limits so you can fully evaluate the platform before committing."
                }
              ].map((faq, index) => (
                <div key={index} className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 bg-gray-50 text-center">
              <p className="text-gray-600 mb-3">Still have questions?</p>
              <motion.button
                className="bg-indigo-600 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Support
              </motion.button>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Get Started with {BRAND_NAME} Today
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of content creators, developers, and businesses who are transforming their media production with AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg transition duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Up Free
              </motion.button>
              <motion.button
                className="bg-white text-indigo-600 border border-indigo-200 font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                View Pricing
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default FeaturesContent;