import { motion } from 'framer-motion';
import { FolderOpen, Settings, LogOut, Menu, X, UserCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';

const navItems = [
  { icon: FolderOpen, label: 'My Drive', path: '/drive' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const usernameItem = {
    icon: UserCircle,
    label: user?.username || 'User',
    path: '/profile',
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/10 z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[90%] sm:max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <span className="text-lg sm:text-xl font-bold text-white">My App</span>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-300
                      ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              ))}
              {/* Profile item */}
              <div
                className={`flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium text-gray-400 opacity-50 cursor-default
                  ${
                    location.pathname === usernameItem.path
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                      : ''
                  }`}
                aria-disabled="true"
                role="presentation"
              >
                <usernameItem.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{usernameItem.label}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden"
        role="menu"
        aria-hidden={!isOpen}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-[#0A0A0A]/95 backdrop-blur-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-300
                  ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          ))}
          {/* Profile item in mobile menu */}
          <div
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm sm:text-base font-medium text-gray-400 opacity-50 cursor-default
              ${
                location.pathname === usernameItem.path
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                  : ''
              }`}
            aria-disabled="true"
            role="presentation"
          >
            <usernameItem.icon className="h-5 w-5" />
            <span>{usernameItem.label}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleSignOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-sm sm:text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            role="menuitem"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
