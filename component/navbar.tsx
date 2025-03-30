import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface NavbarProps {
  scrolled: boolean;
  showMenu: boolean;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
}

const NavBar: React.FC<NavbarProps> = ({ scrolled, showMenu, setShowMenu }) => {
  const router = useRouter();
  const [windowWidth, setWindowWidth] = useState<number>(0);

  // Track window width for responsive design
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        if (window.innerWidth > 768) {
          setShowMenu(false);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [setShowMenu]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/feature' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Studio', path: '/converter' },
  ];

  const handleNavigation = (path: Url) => {
    router.push(path);
    if (windowWidth <= 768) {
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || router.pathname !== '/' 
          ? 'bg-white shadow-md text-gray-800' 
          : 'bg-opacity-70 bg-transparent text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2`}>
              <Sparkles className={`${scrolled || router.pathname !== '/' ? 'text-black' : 'text-white'} mr-2`} size={22} />
            </div>
            <span className={`font-bold text-lg ${scrolled || router.pathname !== '/' ? 'text-black' : 'text-white'}`}>
            Say It Now
            </span>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  router.pathname === item.path
                    ? scrolled || router.pathname !== '/'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white bg-opacity-20 text-black'
                    : scrolled || router.pathname !== '/'
                      ? 'text-gray-800 hover:bg-gray-100'
                      : 'text-white hover:bg-white hover:text-black hover:bg-opacity-10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <button
              className={`ml-4 px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 ${
                scrolled || router.pathname !== '/'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation('/signup')}
            >
              Get Started
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-opacity-20 hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {showMenu ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {showMenu && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${scrolled || router.pathname !== '/' ? 'bg-white' : 'bg-gray-800'}`}>
            {navItems.map((item) => (
              <a
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  router.pathname === item.path
                    ? scrolled || router.pathname !== '/'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-white'
                    : scrolled || router.pathname !== '/'
                      ? 'text-gray-800 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </a>
            ))}
            <button
              className={`w-full mt-4 px-4 py-2 rounded-full font-medium text-sm ${
                scrolled || router.pathname !== '/'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation('/signup')}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
