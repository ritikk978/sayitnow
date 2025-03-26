// component/aboutContent.jsx
import React from 'react';
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
  Github
} from 'lucide-react';
import NavBar from '@/component/navbar';
import Navbar from '@/component/navbar';

const AboutContent = () => {
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

  // Team members data
  const teamMembers = [
    {
      name: "Alexandra Chen",
      role: "Chief Executive Officer",
      image: "https://source.unsplash.com/random/300x300/?woman,portrait,1",
      bio: "Leading our strategic vision with over 15 years of industry experience.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Marcus Johnson",
      role: "Chief Technology Officer",
      image: "https://source.unsplash.com/random/300x300/?man,portrait,1",
      bio: "Technology innovator with expertise in cutting-edge development and architecture.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Sophia Rodriguez",
      role: "Head of Design",
      image: "https://source.unsplash.com/random/300x300/?woman,portrait,2",
      bio: "Award-winning designer passionate about creating intuitive user experiences.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "David Kim",
      role: "Product Manager",
      image: "https://source.unsplash.com/random/300x300/?man,portrait,2",
      bio: "Driving product development with a focus on customer-centered solutions.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  // Company stats
  const companyStats = [
    { value: "2016", label: "Founded", icon: <Clock className="h-6 w-6 text-indigo-600" /> },
    { value: "50k+", label: "Happy Customers", icon: <Heart className="h-6 w-6 text-indigo-600" /> },
    { value: "40+", label: "Team Members", icon: <Users className="h-6 w-6 text-indigo-600" /> },
    { value: "15+", label: "Countries", icon: <MapPin className="h-6 w-6 text-indigo-600" /> }
  ];

  // Company values
  const companyValues = [
    {
      title: "Innovation",
      icon: <Award className="h-10 w-10 text-indigo-600" />,
      description: "We constantly push boundaries to deliver cutting-edge solutions."
    },
    {
      title: "Excellence",
      icon: <Target className="h-10 w-10 text-indigo-600" />,
      description: "We strive for excellence in everything we do, from code to customer service."
    },
    {
      title: "Collaboration",
      icon: <Users className="h-10 w-10 text-indigo-600" />,
      description: "We believe great ideas come from diverse perspectives working together."
    }
  ];

  return (
    <>
      <Navbar scrolled={false} showMenu={false} setShowMenu={function (value: React.SetStateAction<boolean>): void {
        throw new Error('Function not implemented.');
      } } />
      <motion.div 
      className="w-full bg-white py-16 px-4"
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
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            variants={itemVariants}
          >
            About Us
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            We're on a mission to revolutionize the way people work and create. Learn about our journey, our values, and the team behind our success.
          </motion.p>
        </motion.div>

        {/* Company stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          variants={itemVariants}
        >
          {companyStats.map((stat, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 rounded-lg p-6 text-center"
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

        {/* Our story section */}
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
                  We started as a small team of three passionate technologists in a tiny apartment in 2016. 
                  With a vision to create tools that would empower businesses of all sizes, we set out to 
                  build something revolutionary.
                </p>
                <p>
                  What began as a simple idea quickly gained traction as we identified a critical gap in the 
                  market that no one else was addressing. Our early adopters became our best champions, 
                  providing invaluable feedback that helped shape our product.
                </p>
                <p>
                  Today, we're proud to serve over 50,000 customers globally, from small startups to 
                  Fortune 500 companies. While we've grown significantly, our core mission remains the same: 
                  to simplify complexity and empower our users to achieve more.
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
                src="https://source.unsplash.com/random/800x600/?office,team" 
                alt="Our team at work" 
                className="w-full h-auto object-cover" 
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Our mission & values */}
        <motion.div className="mb-20 bg-gray-50 rounded-2xl p-10" variants={itemVariants}>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Mission & Values</h2>
          
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our mission is to empower individuals and organizations with intuitive tools that enhance 
              productivity, foster creativity, and drive success in an ever-changing digital landscape.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg p-6 shadow-md"
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

        {/* Team section */}
        <motion.div className="mb-20" variants={itemVariants}>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md"
                whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  
                  <div className="flex space-x-3">
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} className="text-gray-400 hover:text-indigo-600">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a href={member.social.twitter} className="text-gray-400 hover:text-indigo-600">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} className="text-gray-400 hover:text-indigo-600">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact section */}
        <motion.div 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-10 text-white"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-indigo-100 mb-8">
                Have questions or want to learn more about our company? We'd love to hear from you!
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-indigo-200" />
                  <p>123 Innovation Drive, Tech City, CA 94107</p>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 mr-3 text-indigo-200" />
                  <p>hello@yourcompany.com</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 mr-3 text-indigo-200" />
                  <p>(555) 123-4567</p>
                </div>
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
                  <label className="block text-indigo-100 text-sm font-medium mb-2">Message</label>
                  <textarea
                    className="bg-white bg-opacity-20 text-white placeholder-indigo-200 border border-indigo-400 rounded-lg p-3 w-full h-32 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Your message"
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