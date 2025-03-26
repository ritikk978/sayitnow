// component/features.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  BarChart2, 
  Users, 
  Shield, 
  Cloud, 
  Zap, 
  Sliders, 
  Globe 
} from 'lucide-react';
import Navbar from '@/component/navbar';

const FeaturesContent = () => {
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

  const featureCardVariants = {
    hidden: { opacity: 0, y: 30 },
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
      scale: 1.02,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Features data
  const features = [
    {
      title: "Enhanced User Interface",
      description: "An intuitive design for seamless navigation that adapts to your needs and provides a delightful user experience.",
      icon: <Layers className="h-8 w-8 text-indigo-600" />,
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Advanced Analytics",
      description: "Get detailed insights into your data with powerful visualization tools and customizable reports.",
      icon: <BarChart2 className="h-8 w-8 text-purple-600" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time, with instant updates and seamless integration.",
      icon: <Users className="h-8 w-8 text-green-600" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Enterprise Security",
      description: "Industry-leading security protocols to keep your data safe and compliant with regulations.",
      icon: <Shield className="h-8 w-8 text-red-600" />,
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Cloud Integration",
      description: "Seamlessly connect with popular cloud services for effortless data synchronization and backup.",
      icon: <Cloud className="h-8 w-8 text-sky-600" />,
      color: "from-sky-500 to-cyan-500"
    },
    {
      title: "Lightning Performance",
      description: "Optimized for speed with cutting-edge technology that ensures responsive operation even under heavy load.",
      icon: <Zap className="h-8 w-8 text-amber-600" />,
      color: "from-amber-500 to-yellow-500"
    },
    {
      title: "Customizable Workflow",
      description: "Tailor the application to your specific needs with flexible configuration options and adaptable processes.",
      icon: <Sliders className="h-8 w-8 text-fuchsia-600" />,
      color: "from-fuchsia-500 to-violet-500"
    },
    {
      title: "Global Accessibility",
      description: "Access your work from anywhere in the world with multi-language support and responsive design.",
      icon: <Globe className="h-8 w-8 text-teal-600" />,
      color: "from-teal-500 to-emerald-500"
    }
  ];

  return (
    <>
    <Navbar scrolled={false} showMenu={false} setShowMenu={function (value: React.SetStateAction<boolean>): void {
        throw new Error('Function not implemented.');
      } }/>
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 relative inline-block"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Our Amazing Features
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
            Discover the powerful capabilities that make our application stand out from the competition and help you achieve more with less effort.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              variants={featureCardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br bg-opacity-10 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              <div className={`h-1.5 bg-gradient-to-r ${feature.color}`} />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white max-w-5xl mx-auto"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ready to Experience These Features?
          </motion.h2>
          <motion.p 
            className="text-lg mb-8 text-indigo-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Join thousands of satisfied users who have transformed their workflow with our powerful tools.
          </motion.p>
          <motion.button
            className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
          </motion.button>
        </motion.div>

        {/* Testimonials teaser */}
        <motion.div 
          className="mt-20 text-center"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Industry Leaders</h2>
          <p className="text-gray-600 mb-8">See what our customers have to say about our features</p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
              <motion.div 
                key={index}
                className="text-xl font-bold text-gray-400"
                whileHover={{ scale: 1.1, color: '#4F46E5' }}
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default FeaturesContent;