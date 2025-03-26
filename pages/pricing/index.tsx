// component/pricingContent.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, CreditCard, Users, Zap, Shield, Headphones, ArrowRight } from 'lucide-react';
import Navbar from '@/component/navbar';
import NavBar from '@/component/navbar';

const PricingContent = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  const cardVariants = {
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
      y: -15,
      scale: 1.03,
      boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Pricing plans data
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 9,
      yearlyPrice: 89,
      description: 'Perfect for individuals and small teams getting started.',
      icon: <CreditCard className="h-8 w-8 text-indigo-600" />,
      features: [
        { name: 'Up to 5 users', included: true },
        { name: 'Basic features', included: true },
        { name: 'Standard analytics', included: true },
        { name: '24/7 email support', included: true },
        { name: 'Custom integrations', included: false },
        { name: 'Advanced security', included: false },
        { name: 'Dedicated account manager', included: false },
        { name: 'Custom branding', included: false }
      ],
      cta: 'Get Started',
      popular: false,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 29,
      yearlyPrice: 289,
      description: 'Ideal for growing businesses and professional teams.',
      icon: <Star className="h-8 w-8 text-amber-500" />,
      features: [
        { name: 'Unlimited users', included: true },
        { name: 'All basic features', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Advanced security', included: true },
        { name: 'Dedicated account manager', included: false },
        { name: 'Custom branding', included: false }
      ],
      cta: 'Get Started',
      popular: true,
      bgColor: 'bg-indigo-600',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: null,
      yearlyPrice: null,
      displayPrice: 'Contact Us',
      description: 'Custom solutions for large organizations with specific needs.',
      icon: <Users className="h-8 w-8 text-purple-600" />,
      features: [
        { name: 'Unlimited users', included: true },
        { name: 'All Pro features', included: true },
        { name: 'Custom analytics', included: true },
        { name: '24/7 phone & email support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Enterprise-grade security', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom branding', included: true }
      ],
      cta: 'Contact Us',
      popular: false,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    }
  ];

  // Feature comparison for the bottom section
  const featureComparison = {
    categories: [
      {
        name: 'Core Features',
        features: [
          { name: 'Users', basic: 'Up to 5', pro: 'Unlimited', enterprise: 'Unlimited' },
          { name: 'Storage', basic: '10 GB', pro: '100 GB', enterprise: 'Unlimited' },
          { name: 'Projects', basic: 'Up to 3', pro: 'Unlimited', enterprise: 'Unlimited' }
        ]
      },
      {
        name: 'Support',
        features: [
          { name: 'Support channel', basic: 'Email', pro: 'Email & Chat', enterprise: 'Email, Chat & Phone' },
          { name: 'Response time', basic: '48 hours', pro: '24 hours', enterprise: '4 hours' },
          { name: 'Account manager', basic: 'No', pro: 'No', enterprise: 'Yes' }
        ]
      },
      {
        name: 'Security',
        features: [
          { name: 'Data encryption', basic: 'Basic', pro: 'Advanced', enterprise: 'Military-grade' },
          { name: 'Security audits', basic: 'No', pro: 'Annually', enterprise: 'Quarterly' },
          { name: 'Custom controls', basic: 'No', pro: 'Limited', enterprise: 'Full' }
        ]
      }
    ]
  };

  // Get price display based on plan and billing cycle
  const getPriceDisplay = (plan: { id: string; name: string; monthlyPrice: number; yearlyPrice: number; description: string; icon: React.JSX.Element; features: { name: string; included: boolean; }[]; cta: string; popular: boolean; bgColor: string; borderColor: string; displayPrice?: undefined; } | { id: string; name: string; monthlyPrice: null; yearlyPrice: null; displayPrice: string; description: string; icon: React.JSX.Element; features: { name: string; included: boolean; }[]; cta: string; popular: boolean; bgColor: string; borderColor: string; }) => {
    if (plan.displayPrice) return plan.displayPrice;
    
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return (
      <>
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-lg text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
      </>
    );
  };

  return (
    <>
          <NavBar scrolled={false} showMenu={showMenu} setShowMenu={setShowMenu} />

    <motion.div 
      className="w-full bg-gray-50 mt-16 py-16 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            variants={itemVariants}
          >
            Choose the Plan That's Right for You
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            variants={itemVariants}
          >
            We offer flexible pricing options that scale with your business. All plans come with a 14-day free trial.
          </motion.p>
          
          {/* Billing toggle */}
          <motion.div 
            className="inline-flex items-center bg-gray-200 p-1 rounded-full"
            variants={itemVariants}
          >
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly <span className="text-indigo-600 font-semibold">Save 17%</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`rounded-2xl shadow-lg overflow-hidden border ${
                plan.popular ? 'border-indigo-500' : 'border-gray-200'
              } ${plan.bgColor} h-full`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredPlan(plan.id)}
              onHoverEnd={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="bg-indigo-600 text-white text-center py-1.5 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="mr-3">{plan.icon}</div>
                  <h3 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                </div>
                
                <p className={`mb-6 ${plan.popular ? 'text-indigo-200' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <div className={`mb-6 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {getPriceDisplay(plan)}
                </div>
                
                <motion.button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-6 ${
                    plan.popular
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {plan.cta}
                </motion.button>
                
                <div className={`space-y-3 ${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      {feature.included ? (
                        <Check className={`h-5 w-5 mr-3 ${plan.popular ? 'text-indigo-200' : 'text-indigo-600'}`} />
                      ) : (
                        <X className="h-5 w-5 mr-3 text-gray-400" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature comparison */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Plans Features</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-500">Features</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Basic</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Pro</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.categories.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-2 px-4 font-medium text-gray-900">
                        {category.name}
                      </td>
                    </tr>
                    {category.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-gray-700">{feature.name}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{feature.basic}</td>
                        <td className="py-3 px-4 text-center text-indigo-600 font-medium">{feature.pro}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{feature.enterprise}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ section */}
        <motion.div className="max-w-4xl mx-auto" variants={itemVariants}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Can I upgrade or downgrade my plan later?",
                answer: "Yes, you can easily upgrade or downgrade your plan at any time. Changes to your billing will be prorated."
              },
              {
                question: "Is there a setup fee?",
                answer: "No, there are no setup fees for any of our plans. You can start using the platform immediately after subscribing."
              },
              {
                question: "Do you offer discounts for non-profits?",
                answer: "Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information."
              },
              {
                question: "Is there a setup fee?",
                answer: "No, there are no setup fees for any of our plans. You can start using the platform immediately after subscribing."
              },
              {
                question: "Do you offer discounts for non-profits?",
                answer: "Yes, we offer special pricing for non-profit organizations. Please contact our sales team for more information."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. We also support payment via PayPal and ACH bank transfers for annual plans."
              },
              {
                question: "What happens when my trial ends?",
                answer: "At the end of your 14-day trial, you'll be automatically subscribed to the plan you selected. We'll send you reminders before the trial ends, and you can cancel anytime."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA section */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their business with our platform.
            Try it free for 14 days with no commitments.
          </p>
          <motion.button
            className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition duration-300 inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
          <p className="mt-4 text-sm text-indigo-200">No credit card required</p>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default PricingContent;

 
 