import { motion } from 'framer-motion';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AdminNavbar } from './AdminNavbar';
import { AuthContext } from '../../AuthContext';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

export const ViewAllUsers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast.error('Admin access required');
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.url}/api/users/viewall`, {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        toast.error(`Failed to fetch users: ${error.response?.data || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, navigate]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    if (userId === user.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    try {
      await axios.delete(`${config.url}/api/users/admin/delete/${user.id}/${userId}`, {
        withCredentials: true,
      });
      setUsers(users.filter((u) => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error.response?.data || 'Failed to delete user';
      if (error.response?.status === 403) {
        toast.error('Admin access required');
      } else if (error.response?.status === 404) {
        toast.error('User or admin not found');
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
          <h2 className="text-2xl font-bold text-white mb-6">All Users</h2>
          {loading ? (
            <p className="text-gray-400">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    {user?.isAdmin && <th className="py-3 px-4">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-800 hover:bg-white/5"
                    >
                      <td className="py-3 px-4">{u.id}</td>
                      <td className="py-3 px-4">{u.username}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">{u.isAdmin ? 'Admin' : 'User'}</td>
                      {user?.isAdmin && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-400 flex items-center space-x-1"
                            disabled={u.id === user.id}
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