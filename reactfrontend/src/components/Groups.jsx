// import { motion } from 'framer-motion';
// import { useState, useEffect, useContext, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Group, Plus, Link as LinkIcon, Users, Copy, Search, LogOut, Trash2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import { AuthContext } from '../AuthContext';
// import SockJS from 'sockjs-client';
// import Stomp from 'stompjs';
// import config from '../config';

// export const Groups = () => {
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
//   const [groupName, setGroupName] = useState('');
//   const [groupPassword, setGroupPassword] = useState('');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showJoinModal, setShowJoinModal] = useState(false);
//   const [groupId, setGroupId] = useState('');
//   const [joinPassword, setJoinPassword] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const stompClientRef = useRef(null);
//   const isConnectedRef = useRef(false); 

//   useEffect(() => {
//     if (!user) {
//       toast.error('Please log in to view groups');
//       navigate('/login');
//       return;
//     }
//     fetchUserGroups();
//     connectWebSocket();

//     return () => {
    
//       if (stompClientRef.current && isConnectedRef.current) {
//         try {
//           stompClientRef.current.disconnect(() => {
//             isConnectedRef.current = false;
//           });
//         } catch (error) {
//           console.error('Error during WebSocket disconnect:', error);
//         }
//       }
//     };
//   }, [user, navigate]);

//   const connectWebSocket = () => {
//     const socket = new SockJS(`${config.url}/ws`);
//     const stompClient = Stomp.over(socket);
//     stompClientRef.current = stompClient;

//     stompClient.connect(
//       {},
//       () => {
//         isConnectedRef.current = true;
//         stompClient.subscribe(`/topic/groups/${user.username}`, (message) => {
//           const updatedGroups = JSON.parse(message.body);
//           setGroups(updatedGroups);
//         });
//       },
//       (error) => {
//         console.error('WebSocket connection error:', error);
//         isConnectedRef.current = false;
     
//         setTimeout(connectWebSocket, 5000);
//       }
//     );
//   };

//   const fetchUserGroups = async () => {
//     try {
//       const response = await axios.get(`${config.url}/api/groups/user/${user.username}`);
//       setGroups(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch groups: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   const validatePassword = (password) => {
//     const minLength = 8;
//     const hasNumber = /\d/;
//     const hasSpecialChar = /[!@#$%^&*]/;
//     return password.length >= minLength && hasNumber.test(password) && hasSpecialChar.test(password);
//   };

//   const createGroup = async () => {
//     if (!groupName.trim() || !groupPassword.trim()) {
//       toast.error('Please provide group name and password');
//       return;
//     }
//     if (!validatePassword(groupPassword)) {
//       toast.error('Password must be at least 8 characters, include a number and a special character');
//       return;
//     }
//     if (loading) return;

//     setLoading(true);
//     try {
//       const groupData = {
//         name: groupName,
//         password: groupPassword,
//         creatorUsername: user.username,
//       };
//       const response = await axios.post(`${config.url}/api/groups/create`, groupData, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       setGroups([...groups, response.data]);
//       toast.success('Group created successfully!');
//       setShowCreateModal(false);
//       setGroupName('');
//       setGroupPassword('');
//     } catch (error) {
//       toast.error('Failed to create group: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinGroup = async () => {
//     if (!groupId.trim() || !joinPassword.trim()) {
//       toast.error('Please provide group ID and password');
//       return;
//     }
//     if (loading) return;

//     setLoading(true);
//     try {
//       const joinData = {
//         username: user.username,
//         password: joinPassword,
//       };
//       const response = await axios.post(`${config.url}/api/groups/join/${groupId}`, joinData);
//       setGroups([...groups, response.data]);
//       toast.success('Joined group successfully!');
//       setShowJoinModal(false);
//       setGroupId('');
//       setJoinPassword('');
//       navigate(`/chat/${groupId}`);
//     } catch (error) {
//       toast.error('Failed to join group: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const leaveGroup = async (groupId) => {
//     if (loading) return;

//     setLoading(true);
//     try {
//       const leaveData = {
//         username: user.username,
//       };
//       const response = await axios.post(`${config.url}/api/groups/leave/${groupId}`, leaveData);
//       setGroups(groups.filter((group) => group.id !== groupId));
//       toast.success(response.data || 'Left group successfully!');
//     } catch (error) {
//       toast.error('Failed to leave group: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteGroup = async (groupId) => {
//     if (loading) return;

//     setLoading(true);
//     try {
//       await axios.delete(`${config.url}/api/groups/delete/${groupId}`, {
//         data: { username: user.username },
//       });
//       setGroups(groups.filter((group) => group.id !== groupId));
//       toast.success('Group deleted successfully!');
//     } catch (error) {
//       toast.error('Failed to delete group: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyInviteLink = (groupId) => {
//     navigator.clipboard.writeText(`${window.location.origin}/group/${groupId}`);
//     toast.success('Invite link copied to clipboard!');
//   };

//   const filteredGroups = groups.filter((group) =>
//     group.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-4xl mx-auto mt-20 p-6"
//       role="main"
//       aria-label="Groups"
//     >
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-white mb-2">Groups</h1>
//           <p className="text-gray-400">Create or join groups to share files</p>
//         </div>
//         <div className="flex space-x-3">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setShowCreateModal(true)}
//             disabled={loading}
//             className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white ${
//               loading ? 'opacity-75 cursor-not-allowed' : ''
//             }`}
//             aria-label="Create new group"
//           >
//             <Plus className="h-5 w-5" />
//             <span>Create Group</span>
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setShowJoinModal(true)}
//             disabled={loading}
//             className={`flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg text-white ${
//               loading ? 'opacity-75 cursor-not-allowed' : ''
//             }`}
//             aria-label="Join group"
//           >
//             <LinkIcon className="h-5 w-5" />
//             <span>Join Group</span>
//           </motion.button>
//         </div>
//       </div>

//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//         <input
//           type="text"
//           placeholder="Search groups..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//           disabled={loading}
//           aria-label="Search groups"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Group list">
//         {filteredGroups.length === 0 && (
//           <p className="text-gray-400 col-span-2 text-center">No groups found.</p>
//         )}
//         {filteredGroups.map((group) => (
//           <motion.div
//             key={group.id}
//             whileHover={{ y: -2 }}
//             className="bg-white/10 backdrop-blur-lg rounded-lg p-4"
//             role="listitem"
//             aria-label={`Group: ${group.name}`}
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-blue-500/20 rounded-lg">
//                   <Group className="h-6 w-6 text-blue-500" />
//                 </div>
//                 <div>
//                   <h3 className="text-white font-medium">{group.name}</h3>
//                   <div className="flex items-center space-x-2 text-sm text-gray-400">
//                     <Users className="h-4 w-4" />
//                     <span>{group.usernames?.length || 0} members</span>
//                   </div>
//                 </div>
//               </div>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => copyInviteLink(group.id)}
//                 className="p-2 text-gray-400 hover:text-white"
//                 disabled={loading}
//                 aria-label="Copy invite link"
//               >
//                 <Copy className="h-5 w-5" />
//               </motion.button>
//             </div>
//             <div className="mt-4 flex items-center justify-between">
//               <span className="text-sm text-gray-400">Group ID: {group.id}</span>
//               <div className="flex space-x-2">
//                 {group.creatorUsername === user.username && (
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => deleteGroup(group.id)}
//                     className="px-4 py-1 bg-red-500/20 rounded-full text-red-500 text-sm font-medium hover:bg-red-500/30"
//                     disabled={loading}
//                     aria-label="Delete group"
//                   >
//                     <Trash2 className="h-4 w-4 inline mr-1" />
//                     Delete
//                   </motion.button>
//                 )}
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => leaveGroup(group.id)}
//                   className="px-4 py-1 bg-red-500/20 rounded-full text-red-500 text-sm font-medium hover:bg-red-500/30"
//                   disabled={loading}
//                   aria-label="Leave group"
//                 >
//                   <LogOut className="h-4 w-4 inline mr-1" />
//                   Leave
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => navigate(`/chat/${group.id}`)}
//                   className="px-4 py-1 bg-blue-500/20 rounded-full text-blue-500 text-sm font-medium hover:bg-blue-500/30"
//                   disabled={loading}
//                   aria-label="Open group chat"
//                 >
//                   Open Chat
//                 </motion.button>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {showCreateModal && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
//           role="dialog"
//           aria-labelledby="create-group-modal-title"
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-[#0A0A0A] rounded-lg p-6 w-full max-w-md"
//           >
//             <h2 id="create-group-modal-title" className="text-xl font-bold text-white mb-4">
//               Create New Group
//             </h2>
//             <input
//               type="text"
//               placeholder="Group name"
//               value={groupName}
//               onChange={(e) => setGroupName(e.target.value)}
//               className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white placeholder-gray-400 mb-4"
//               disabled={loading}
//               aria-label="Group name"
//             />
//             <input
//               type="password"
//               placeholder="Group password"
//               value={groupPassword}
//               onChange={(e) => setGroupPassword(e.target.value)}
//               className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white placeholder-gray-400 mb-4"
//               disabled={loading}
//               aria-label="Group password"
//             />
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className="px-4 py-2 text-gray-400 hover:text-white"
//                 disabled={loading}
//                 aria-label="Cancel"
//               >
//                 Cancel
//               </button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={createGroup}
//                 disabled={loading}
//                 className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white ${
//                   loading ? 'opacity-75 cursor-not-allowed' : ''
//                 }`}
//                 aria-label="Create group"
//               >
//                 {loading ? 'Creating...' : 'Create'}
//               </motion.button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}

//       {showJoinModal && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
//           role="dialog"
//           aria-labelledby="join-group-modal-title"
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-[#0A0A0A] rounded-lg p-6 w-full max-w-md"
//           >
//             <h2 id="join-group-modal-title" className="text-xl font-bold text-white mb-4">
//               Join Group
//             </h2>
//             <input
//               type="text"
//               placeholder="Group ID"
//               value={groupId}
//               onChange={(e) => setGroupId(e.target.value)}
//               className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white placeholder-gray-400 mb-4"
//               disabled={loading}
//               aria-label="Group ID"
//             />
//             <input
//               type="password"
//               placeholder="Group password"
//               value={joinPassword}
//               onChange={(e) => setJoinPassword(e.target.value)}
//               className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-4 text-white placeholder-gray-400 mb-4"
//               disabled={loading}
//               aria-label="Group password"
//             />
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowJoinModal(false)}
//                 className="px-4 py-2 text-gray-400 hover:text-white"
//                 disabled={loading}
//                 aria-label="Cancel"
//               >
//                 Cancel
//               </button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={joinGroup}
//                 disabled={loading}
//                 className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white ${
//                   loading ? 'opacity-75 cursor-not-allowed' : ''
//                 }`}
//                 aria-label="Join group"
//               >
//                 {loading ? 'Joining...' : 'Join'}
//               </motion.button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// export default Groups;
