import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AdminNavbar = () => {
  return (
    <nav className="bg-[#0A0A0A] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16">
          <div className="flex items-center space-x-4">
            <Link to="/view-all-users">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                View All Users
              </motion.button>
            </Link>
            <Link to="/view-all-groups">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                View All Groups
              </motion.button>
            </Link>
            <Link to="/profile">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};