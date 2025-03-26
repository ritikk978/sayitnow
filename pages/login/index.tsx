// AuthModal.tsx
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth // Import the Auth type from firebase/auth
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react'; // Import Loader2 for spinner

// Define Props interface
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void; // Function that takes no args and returns nothing
  auth: Auth;          // Use the imported Auth type
}

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

// Use React.FC with the Props interface
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, auth }) => {
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

  // Type the event parameter 'e'
  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (err) { // err is 'unknown' here
      let friendlyError = "An error occurred. Please try again.";

      // Type check before accessing 'code'
      if (typeof err === 'object' && err !== null && 'code' in err) {
         // Now TypeScript knows 'err' has a 'code' property (likely string)
         const errorCode = (err as { code: string }).code; // Assert type after check

         switch (errorCode) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': // Added this common V9 error code
              friendlyError = "Invalid email or password.";
              break;
            case 'auth/email-already-in-use':
              friendlyError = "This email address is already registered.";
              break;
            case 'auth/weak-password':
              friendlyError = "Password should be at least 6 characters long.";
              break;
            case 'auth/invalid-email':
              friendlyError = "Please enter a valid email address.";
              break;
            default:
               // Keep the generic error for unhandled codes
               console.warn(`Unhandled auth error code: ${errorCode}`);
         }
      } else {
          // Handle cases where error is not a standard Firebase error object
          console.error("Non-standard Auth Error:", err);
      }

      console.error("Full Auth Error:", err); // Log the original error object for debugging
      setError(friendlyError);
    } finally {
        // Ensure loading state is always turned off
        setIsAuthLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(''); // Clear error when switching modes
    // Keep email/password fields potentially filled
  };

  // Prevent rendering if not open (optional, AnimatePresence handles exit)
  // if (!isOpen) return null;

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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden" // Added relative, overflow-hidden
            variants={modalContentVariants}
            // initial="hidden" // Handled by AnimatePresence
            // animate="visible"
            // exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-1 z-10" // Ensure button is clickable
              aria-label="Close modal"
              whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(100,100,100,0.1)'}}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>

            {/* Modal Header */}
            <div className="text-center mb-6"> {/* Center align header */}
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isSignUp ? 'Create Account' : 'Login'}
              </h2>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-2.5 rounded relative mb-4 text-sm flex items-start"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  role="alert"
                >
                    <span className='flex-grow'>{error}</span>
                    {/* Optional: Add a close button for the error */}
                    <button onClick={() => setError('')} className='ml-2 text-red-500 hover:text-red-700'>×</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} noValidate> {/* Added noValidate to prevent browser default validation interfering */}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div className="mb-5"> {/* Adjusted margin */}
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
                  minLength={6} // Add basic browser validation
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="••••••••"
                />
                {/* Weak password hint (visual only, validation is server-side) */}
                {isSignUp && password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Password must be at least 6 characters.</p>
                )}
              </div>
              <motion.button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 h-11" // Fixed height
                variants={buttonVariants}
                whileHover={!isAuthLoading ? "hover" : ""} // Disable hover effect when loading
                whileTap={!isAuthLoading ? "tap" : ""}   // Disable tap effect when loading
                disabled={isAuthLoading || !email || password.length < (isSignUp ? 6 : 1) } // Basic client-side disable
              >
                {isAuthLoading ? (
                    <>
                       {/* Using Lucide spinner */}
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      </motion.div>
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