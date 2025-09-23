import { motion } from 'framer-motion';
import { FileUp, Users, FolderOpen, ChevronRight, BarChart2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import config from '../config.js';
import { AuthContext } from '../AuthContext.jsx';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    filesShared: '0',
    activeGroups: '0',
    storageUsed: '0%',
  });
  const [recentFiles, setRecentFiles] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        toast.error('Please log in to view your dashboard');
        setLoading(false);
        return;
      }

      try {
   
        const filesResponse = await fetch(`${config.url}/api/file/viewall/${user.username}`, {
          credentials: 'include',
        });
        if (!filesResponse.ok) {
          const errorText = await filesResponse.text();
          throw new Error(`Failed to fetch files: ${errorText || filesResponse.statusText}`);
        }
        const files = await filesResponse.json();

     
        const groupsResponse = await fetch(`${config.url}/api/groups/user/${user.username}`, {
          credentials: 'include',
        });
        if (!groupsResponse.ok) {
          const errorText = await groupsResponse.text();
          throw new Error(`Failed to fetch groups: ${errorText || groupsResponse.statusText}`);
        }
        const groups = await groupsResponse.json();

      
        const totalStorage = 60; // Assumed limit for storage used calculation
        const totalSizeBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const totalSizeGB = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2); // Convert bytes to GB
        const storageUsedPercent = ((totalSizeGB / totalStorage) * 100).toFixed(0);

        setStats({
          filesShared: files.length.toString(),
          activeGroups: groups.length.toString(),
          storageUsed: `${storageUsedPercent}%`,
        });

   
        const sortedFiles = files
          .sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
          .slice(0, 3)
          .map((file) => ({
            id: file.id,
            name: file.fileName,
            type: 'file', 
            date: formatDate(file.uploadDate),
          }));

        setRecentFiles(sortedFiles);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.message.includes('Failed to fetch')) {
          toast.error('Unable to connect to the server. Please check your network or server status.');
        } else {
          toast.error(`Failed to load dashboard: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const quickActions = [
    { icon: FileUp, label: 'Upload File', path: '/drive' },
    { icon: Users, label: 'View Groups', path: '/groups' },
    { icon: FolderOpen, label: 'My Files', path: '/drive' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-16 sm:pt-20 pb-6 sm:pb-8 max-w-[90%] sm:max-w-7xl mx-auto space-y-6 sm:space-y-8"
    >
   
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Object.entries(stats).map(([key, value], index) => (
          <motion.div
            key={index}
            whileHover={{ y: -2 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-4 sm:p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {key === 'filesShared'
                    ? 'My Files'
                    : key === 'activeGroups'
                    ? 'Active Groups'
                    : 'Storage Used'}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{value}</h3>
              </div>
              <div
                className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  key === 'storageUsed' && parseInt(value) > 80
                    ? 'text-red-500 bg-red-500/20'
                    : 'text-green-500 bg-green-500/20'
                }`}
              >
                {key === 'storageUsed' && parseInt(value) > 80 ? 'High Usage' : 'Stable'}
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <BarChart2 className="h-12 sm:h-16 w-full text-blue-500 opacity-50" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

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
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4 sm:p-6 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">My Drive Files</h2>
            <Link to="/drive" className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <motion.div
                  key={file.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm sm:text-base">{file.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{file.date}</p>
                    </div>
                  </div>
                  <a
                    href={`${config.url}/api/file/download/${file.id}`}
                    download
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No files found in My Drive.</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
