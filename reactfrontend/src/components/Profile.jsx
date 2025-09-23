import { motion } from 'framer-motion';
import { useState, useEffect, useContext } from 'react';
import { Camera, Mail, Lock, Bell, Shield, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../config.js';
import { AuthContext } from '../AuthContext.jsx';
import axios from 'axios';

export const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: null,
    userId: null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) {
        toast.error('Please log in to view your profile');
        return;
      }

      try {
        // Fetch user profile data from backend
        const userResponse = await axios.get(`${config.url}/api/users/profile/${user.id}`, {
          withCredentials: true,
        });
        const { username, email } = userResponse.data;

        // Fetch profile picture
        let avatar = null;
        const pictureResponse = await fetch(`${config.url}/api/users/profile-picture/${user.id}`, {
          credentials: 'include',
        });
        if (pictureResponse.ok) {
          const blob = await pictureResponse.blob();
          avatar = URL.createObjectURL(blob);
        } else if (pictureResponse.status !== 404) {
          console.warn('Error fetching profile picture:', pictureResponse.status);
        }

        setUserData({
          username: username || user.username || 'N/A',
          email: email || 'N/A',
          avatar,
          userId: user.id,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error(`Failed to load profile data: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchUserData();

    return () => {
      if (userData.avatar) {
        URL.revokeObjectURL(userData.avatar);
      }
    };
  }, [user]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch(`${config.url}/api/users/update-profile-picture/${userData.userId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload profile picture');
      }

      if (userData.avatar) {
        URL.revokeObjectURL(userData.avatar);
      }

      const pictureResponse = await fetch(`${config.url}/api/users/profile-picture/${userData.userId}`, {
        credentials: 'include',
      });
      if (!pictureResponse.ok) {
        throw new Error('Failed to fetch updated profile picture');
      }

      const blob = await pictureResponse.blob();
      const newAvatar = URL.createObjectURL(blob);

      setUserData((prev) => ({
        ...prev,
        avatar: newAvatar,
      }));
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(`Failed to update profile picture: ${error.message}`);
    }
  };

  const handleSave = async () => {
    if (!userData.username.trim() || !userData.email.trim()) {
      toast.error('Username and email cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${config.url}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userData.userId,
          username: userData.username,
          email: userData.email,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 409) {
          if (errorText.includes('Username')) {
            throw new Error('Username already taken');
          } else if (errorText.includes('Email')) {
            throw new Error('Email already taken');
          }
        }
        throw new Error(errorText || 'Failed to update profile');
      }

      // Update AuthContext and localStorage
      const authSession = JSON.parse(localStorage.getItem('authSession') || '{}');
      const updatedUser = {
        ...authSession.user,
        username: userData.username,
        email: userData.email,
      };
      localStorage.setItem('authSession', JSON.stringify({ user: updatedUser }));

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile changes: ${error.message}`);
    }
  };

  const handlePasswordUpdate = async () => {
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    // Basic password strength validation
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*]/;
    if (
      passwordData.newPassword.length < minLength ||
      !hasNumber.test(passwordData.newPassword) ||
      !hasSpecialChar.test(passwordData.newPassword)
    ) {
      toast.error('New password must be at least 8 characters, include a number, and a special character');
      return;
    }

    try {
      const response = await fetch(`${config.url}/api/users/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update password');
      }

      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(`Failed to update password: ${error.message}`);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Mail },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const stats = [
    { icon: Upload, label: 'Uploaded', value: '-' },
    { icon: Download, label: 'Downloaded', value: '-' },
    { icon: Shield, label: 'Protected Files', value: '-' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-20 p-6"
      role="main"
      aria-label="User Profile"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <img
              src={userData.avatar || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/20"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-pic-upload"
              aria-label="Upload profile picture"
            />
            <label
              htmlFor="profile-pic-upload"
              className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors cursor-pointer"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white mb-2">{userData.username || 'N/A'}</h1>
            <p className="text-gray-400">{userData.email || 'N/A'}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white"
            aria-label={isEditing ? 'Save profile changes' : 'Edit profile'}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
              <stat.icon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="p-6" role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={userData.username || ''}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white"
                  aria-label="Username"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={userData.email || ''}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white"
                  aria-label="Email"
                />
              </div>
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white mt-4"
                  aria-label="Save profile changes"
                >
                  Save Changes
                </motion.button>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white"
                  aria-label="Current password"
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white"
                  aria-label="New password"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                  }
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white"
                  aria-label="Confirm new password"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePasswordUpdate}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white"
                aria-label="Update password"
              >
                Update Password
              </motion.button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-400">Receive email updates about your activity</p>
                </div>
                <label
                  className="relative inline-flex items-center cursor-pointer"
                  aria-label="Toggle email notifications"
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                    aria-checked="true"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Profile Visibility</h3>
                  <p className="text-sm text-gray-400">Control who can see your profile</p>
                </div>
                <select
                  className="bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white"
                  aria-label="Profile visibility"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;