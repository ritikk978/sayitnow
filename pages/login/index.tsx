// AuthModal.jsx
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Animation Variants (can be shared or kept here)
const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalContentVariants = {
  hidden: { scale: 0.9, y: 20, opacity: 0 },
  visible: { scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { scale: 0.9, y: 20, opacity: 0, transition: { duration: 0.2 } }
};

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.1 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
};

const AuthModal = ({ isOpen, onClose, auth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Reset form state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Optionally reset to login view each time, or keep last state
      // setIsSignUp(false);
      setError('');
      setEmail('');
      setPassword('');
      setIsAuthLoading(false); // Ensure loading is reset if closed mid-action
    }
  }, [isOpen]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAuthLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        // console.log('Sign up successful');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // console.log('Login successful');
      }
      // Firebase onAuthStateChanged will handle user state update in NavBar
      onClose(); // Close modal on success
      // State reset handled by useEffect on next open
    } catch (err) {
      let friendlyError = "An error occurred. Please try again.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyError = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = "This email address is already registered.";
      } else if (err.code === 'auth/weak-password') {
        friendlyError = "Password should be at least 6 characters long.";
      } else if (err.code === 'auth/invalid-email') {
         friendlyError = "Please enter a valid email address.";
      }
      console.error("Auth Error:", err);
      setError(friendlyError);
      setIsAuthLoading(false); // Stop loading only on error
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(''); // Clear error when switching modes
    // Keep email/password fields potentially filled
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // Close modal on overlay click
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isSignUp ? 'Create Account' : 'Login'}
              </h2>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-1 -mr-2"
                aria-label="Close modal"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.1)'}}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {error && (
              <motion.div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleAuthSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="you@example.com"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••"
                />
                  {isSignUp && password.length > 0 && password.length < 6 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Password must be at least 6 characters.</p>
                  )}
              </div>
              <motion.button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                variants={buttonVariants}
                whileHover={!isAuthLoading ? "hover" : ""} // Disable hover effect when loading
                whileTap={!isAuthLoading ? "tap" : ""}   // Disable tap effect when loading
                disabled={isAuthLoading} // Disable button while auth action is loading
              >
                {isAuthLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                ) : (isSignUp ? 'Sign Up' : 'Login')}
              </motion.button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
              >
                {isSignUp ? 'Login here' : 'Sign Up here'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;