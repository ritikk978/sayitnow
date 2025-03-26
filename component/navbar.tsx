import React, { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import { Url } from 'next/dist/shared/lib/router/router';


interface NavbarProps {
  scrolled: boolean;
  showMenu: boolean;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
  // Add any other props your Navbar might need
}


const NavBar : React.FC<NavbarProps>   = () => {
  const router = useRouter();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/feature' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'TextToSpeech', path: '/converter' },
  ];

  const handleNavigation = (path: Url) => {
    router.push(path);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.path)}
            className="text-white hover:bg-gray-700 px-3 py-2 rounded-md"
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
