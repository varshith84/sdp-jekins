import { motion } from 'framer-motion';
import { Users, FolderOpen, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AdminNavbar } from './AdminNavbar';
import { AuthContext } from '../../AuthContext';
import config from '../../config';

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const usersResponse = await axios.get(`${config.url}/api/users/viewall`, {
          withCredentials: true,
        });
        const users = usersResponse.data;

        const groupsResponse = await axios.get(`${config.url}/api/groups/viewall`, {
          withCredentials: true,
        });
        const groups = groupsResponse.data;

        setStats({
          totalUsers: users.length,
          totalGroups: groups.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(`Failed to fetch dashboard data: ${error.response?.data || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const quickActions = [
    { icon: Users, label: 'View All Users', path: '/view-all-users' },
    { icon: FolderOpen, label: 'View All Groups', path: '/view-all-groups' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AdminNavbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 sm:pt-20 pb-6 sm:pb-8 max-w-[90%] sm:max-w-7xl mx-auto space-y-6 sm:space-y-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            { title: 'Total Users', value: loading ? 'Loading...' : stats.totalUsers },
            { title: 'Total Groups', value: loading ? 'Loading...' : stats.totalGroups },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-4 sm:p-6"
            >
              <p className="text-gray-400 text-xs sm:text-sm">{stat.title}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{stat.value}</h3>
              <div className="mt-3 sm:mt-4">
                <BarChart2 className="h-12 sm:h-16 w-full text-blue-500 opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </div>
                    <span className="text-white text-sm sm:text-base">{action.label}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};