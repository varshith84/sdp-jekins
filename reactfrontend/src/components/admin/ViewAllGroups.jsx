import { motion } from 'framer-motion';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AdminNavbar } from './AdminNavbar';
import { AuthContext } from '../../AuthContext';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

export const ViewAllGroups = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }

    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${config.url}/api/groups/viewall`, {
          withCredentials: true,
        });
        setGroups(response.data);
      } catch (error) {
        toast.error(`Failed to fetch groups: ${error.response?.data || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [user, navigate]);

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`${config.url}/api/groups/admin/delete/${user.id}/${groupId}`, {
        withCredentials: true,
      });
      setGroups(groups.filter((group) => group.id !== groupId));
      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      const message = error.response?.data || 'Failed to delete group';
      if (error.response?.status === 403) {
        toast.error('Admin access required');
      } else if (error.response?.status === 404) {
        toast.error('Group or admin not found');
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">All Groups</h2>
          {loading ? (
            <p className="text-gray-400">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-400">No groups found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Members</th>
                    {user?.isAdmin && <th className="py-3 px-4">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <motion.tr
                      key={group.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-800 hover:bg-white/5"
                    >
                      <td className="py-3 px-4">{group.id}</td>
                      <td className="py-3 px-4">{group.name}</td>
                      <td className="py-3 px-4">{group.usernames?.length || 0}</td>
                      {user?.isAdmin && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-500 hover:text-red-400 flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};