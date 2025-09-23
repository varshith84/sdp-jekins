// import { motion, AnimatePresence } from 'framer-motion';
// import { useState, useEffect, useRef, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, Search, MoreVertical, Smile, Paperclip, Send, UserPlus, Link, File, Copy, Trash2 } from 'lucide-react';
// import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import { Stomp } from '@stomp/stompjs';
// import { AuthContext } from '../AuthContext';
// import Modal from 'react-modal';
// import { Menu, MenuItem, MenuButton, MenuItems } from '@headlessui/react';
// import config from '../config';

// Modal.setAppElement('#root');

// const ChatRoom = () => {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
//   const [messages, setMessages] = useState([]);
//   const [filteredMessages, setFilteredMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [groupName, setGroupName] = useState('Group Chat');
//   const [groupDetails, setGroupDetails] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [sharedLinks, setSharedLinks] = useState([]);
//   const [linkPreviews, setLinkPreviews] = useState({});
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showSearchBar, setShowSearchBar] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [showGroupInfo, setShowGroupInfo] = useState(false);
//   const [showAddMemberInput, setShowAddMemberInput] = useState(false);
//   const [newMemberUsername, setNewMemberUsername] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [isWsConnected, setIsWsConnected] = useState(false);
//   const fileInputRef = useRef(null);
//   const stompClientRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const API_BASE_URL = `${config.url}/api`;
//   const WS_URL = `${config.url}/ws`;
//   const emojis = ['😀', '😂', '😍', '👍', '🔥', '❤️', '💯', '🎉', '👋', '🤓'];
//   const URL_REGEX = /(https?:\/\/[^\s]+)/g;

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const saveFileToDrive = async (fileId, fileName) => {
//     try {
//       const downloadResponse = await axios.get(`${API_BASE_URL}/file/download/${fileId}`, {
//         responseType: 'blob',
//       });
//       const blob = new Blob([downloadResponse.data]);
//       const file = new File([blob], fileName, { type: blob.type });

//       const formData = new FormData();
//       formData.append('file', file);
//       const uploadResponse = await axios.post(`${API_BASE_URL}/file/upload/${user.id}`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       console.log(`File ${fileName} saved to user's drive with ID: ${uploadResponse.data.id}`);
//       toast.success(`File ${fileName} saved to your drive`);
//     } catch (error) {
//       console.error('Error saving file to drive:', error);
//       toast.error(`Failed to save ${fileName} to your drive: ${error.message}`);
//     }
//   };

//   const connectWebSocket = () => {
//     console.log('Attempting to connect to WebSocket at', WS_URL);
//     const socket = new SockJS(WS_URL);
//     stompClientRef.current = Stomp.over(socket);

//     stompClientRef.current.connect(
//       {},
//       (frame) => {
//         console.log('WebSocket connected successfully:', frame);
//         setIsWsConnected(true);
//         toast.success('Connected to chat');

//         stompClientRef.current.subscribe(`/topic/group/${groupId}`, (message) => {
//           console.log('Received WebSocket message:', message.body);
//           try {
//             const newMessage = JSON.parse(message.body);
//             setMessages((prev) => {
//               const filteredMessages = prev.filter(
//                 (msg) =>
//                   !(
//                     msg.isTemp &&
//                     msg.senderUsername === newMessage.senderUsername &&
//                     msg.content === newMessage.content &&
//                     new Date(msg.timestamp).getTime() >= new Date(newMessage.timestamp).getTime() - 5000
//                   )
//               );
//               if (!filteredMessages.some((msg) => msg.id === newMessage.id)) {
//                 return [...filteredMessages, { ...newMessage, isTemp: false }];
//               }
//               return filteredMessages;
//             });
//             setFilteredMessages((prev) => {
//               const filteredMessages = prev.filter(
//                 (msg) =>
//                   !(
//                     msg.isTemp &&
//                     msg.senderUsername === newMessage.senderUsername &&
//                     msg.content === newMessage.content &&
//                     new Date(msg.timestamp).getTime() >= new Date(newMessage.timestamp).getTime() - 5000
//                   )
//               );
//               if (!filteredMessages.some((msg) => msg.id === newMessage.id)) {
//                 return [...filteredMessages, { ...newMessage, isTemp: false }];
//               }
//               return filteredMessages;
//             });
//             if (newMessage.type === 'FILE' && newMessage.senderUsername !== user.username) {
//               saveFileToDrive(parseInt(newMessage.content, 10), newMessage.fileName);
//             }
//             fetchLinkPreviews([newMessage]);
//             scrollToBottom();
//           } catch (error) {
//             console.error('Error parsing WebSocket message:', error);
//             toast.error('Error processing message');
//           }
//         });

//         stompClientRef.current.subscribe(`/topic/typing/${groupId}`, (message) => {
//           console.log('Received typing event:', message.body);
//           try {
//             const typingData = JSON.parse(message.body);
//             const { senderUsername } = typingData;
//             if (senderUsername !== user.username) {
//               setTypingUsers((prev) => {
//                 if (!prev.includes(senderUsername)) {
//                   return [...prev, senderUsername];
//                 }
//                 return prev;
//               });
//               setTimeout(() => {
//                 setTypingUsers((prev) => prev.filter((u) => u !== senderUsername));
//               }, 5000);
//             }
//           } catch (error) {
//             console.error('Error parsing typing event:', error);
//           }
//         });
//       },
//       (error) => {
//         console.error('WebSocket connection error:', error);
//         setIsWsConnected(false);
//         toast.error('Failed to connect to chat. Retrying...');
//         setTimeout(connectWebSocket, 5000);
//       }
//     );

//     socket.onclose = () => {
//       console.log('WebSocket disconnected');
//       setIsWsConnected(false);
//       toast.error('Chat disconnected. Retrying...');
//       setTimeout(connectWebSocket, 5000);
//     };
//   };

//   useEffect(() => {
//     if (!user || !groupId) {
//       toast.error('Please log in to access the chat');
//       navigate('/login');
//       return;
//     }

//     const fetchInitialData = async () => {
//       setIsLoading(true);
//       try {
//         await fetchGroupDetails();
//         await fetchMessages();
//       } catch (error) {
//         console.error('Error fetching initial data:', error);
//         toast.error('Failed to load initial data');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchInitialData();
//     connectWebSocket();

//     return () => {
//       if (stompClientRef.current) {
//         console.log('Disconnecting WebSocket on cleanup');
//         stompClientRef.current.disconnect(() => {
//           setIsWsConnected(false);
//           console.log('WebSocket disconnected on cleanup');
//         });
//       }
//     };
//   }, [groupId, user, navigate]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, typingUsers]);

//   const fetchMessages = async () => {
//     try {
//       console.log('Fetching messages for group:', groupId);
//       const response = await axios.get(`${API_BASE_URL}/groups/messages/${groupId}`);
//       const fetchedMessages = response.data;
//       setMessages(fetchedMessages);
//       setFilteredMessages(fetchedMessages);

//       const links = [];
//       for (const message of fetchedMessages) {
//         const foundLinks = message.content.match(URL_REGEX);
//         if (foundLinks) {
//           for (const link of foundLinks) {
//             links.push({
//               url: link,
//               senderUsername: message.senderUsername,
//               timestamp: message.timestamp,
//               messageId: message.id,
//             });
//           }
//         }
//       }
//       setSharedLinks(links);
//       fetchLinkPreviews(fetchedMessages);
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//       toast.error('Failed to fetch messages');
//     }
//   };

//   const fetchGroupDetails = async () => {
//     try {
//       console.log('Fetching group details for user:', user.username);
//       const response = await axios.get(`${API_BASE_URL}/groups/user/${user.username}`);
//       const group = response.data.find((g) => g.id === groupId);
//       if (group) {
//         setGroupName(group.name);
//         setMembers(group.usernames || []);
//         setGroupDetails(group);
//       } else {
//         toast.error('Group not found');
//         navigate('/groups');
//       }
//     } catch (error) {
//       console.error('Error fetching group details:', error);
//       toast.error('Failed to fetch group details');
//     }
//   };

//   const fetchLinkPreviews = async (msgs) => {
//     const newPreviews = { ...linkPreviews };
//     for (const msg of msgs) {
//       if (msg.type !== 'TEXT') continue;
//       const urls = msg.content.match(URL_REGEX);
//       if (urls) {
//         for (const url of urls) {
//           try {
//             const response = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
//             const { title, image, description } = response.data.data;
//             newPreviews[msg.id] = { url, title, image: image?.url, description };
//           } catch (error) {
//             console.error('Error fetching link preview:', error);
//           }
//         }
//       }
//     }
//     setLinkPreviews(newPreviews);
//   };

//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     if (query.trim() === '') {
//       setFilteredMessages(messages);
//     } else {
//       const filtered = messages.filter(
//         (message) =>
//           message.content.toLowerCase().includes(query.toLowerCase()) ||
//           message.senderUsername.toLowerCase().includes(query.toLowerCase())
//       );
//       setFilteredMessages(filtered);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const files = e.dataTransfer.files;
//     handleFiles(files);
//   };

//   const handleFiles = async (files) => {
//     if (!files.length) return;
//     if (!isWsConnected) {
//       toast.error('Cannot upload file: Not connected to chat. Retrying...');
//       connectWebSocket();
//       return;
//     }
//     for (const file of files) {
//       try {
//         console.log('Uploading file to drive:', file.name);
//         const formData = new FormData();
//         formData.append('file', file);
//         const uploadResponse = await axios.post(`${API_BASE_URL}/file/upload/${user.id}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });

//         console.log('Upload response data:', JSON.stringify(uploadResponse.data, null, 2));
//         const fileEntity = uploadResponse.data;
//         const fileId = fileEntity?.id || fileEntity?.fileId;
//         const fileName = fileEntity?.fileName || file.name;

//         if (!fileId) {
//           console.warn('No file ID provided by server for:', fileName);
//           toast(`File ${fileName} uploaded to drives but not shared in chat due to missing file ID.`);
//         } else {
//           console.log('File uploaded to drive, received fileId:', fileId);
//         }

//         for (const member of members) {
//           if (member !== user.username) {
//             try {
//               const usersResponse = await axios.get(`${API_BASE_URL}/users/viewall`);
//               const memberUser = usersResponse.data.find((u) => u.username === member);
//               if (memberUser) {
//                 const memberFormData = new FormData();
//                 memberFormData.append('file', file);
//                 const memberUploadResponse = await axios.post(
//                   `${API_BASE_URL}/file/upload/${memberUser.id}`,
//                   memberFormData,
//                   {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                   }
//                 );
//                 console.log(
//                   `File ${fileName} saved to ${member}'s drive, response:`,
//                   JSON.stringify(memberUploadResponse.data, null, 2)
//                 );
//               } else {
//                 console.warn(`Member ${member} not found in users list`);
//               }
//             } catch (error) {
//               console.error(`Error saving file to ${member}'s drive:`, error);
//               toast.error(`Failed to save ${fileName} to ${member}'s drive`);
//             }
//           }
//         }

//         if (fileId) {
//           const tempId = `temp-file-${Date.now()}`;
//           const tempMessage = {
//             id: tempId,
//             senderUsername: user.username,
//             content: fileId.toString(),
//             type: 'FILE',
//             fileName: fileName,
//             timestamp: new Date().toISOString(),
//             isTemp: true,
//           };
//           setMessages((prev) => [...prev, tempMessage]);
//           setFilteredMessages((prev) => [...prev, tempMessage]);

//           const response = await axios.post(`${API_BASE_URL}/groups/message/${groupId}`, {
//             senderUsername: user.username,
//             content: fileId.toString(),
//             type: 'FILE',
//             fileName: fileName,
//           });

//           if (stompClientRef.current && stompClientRef.current.connected) {
//             console.log('Sending file message via WebSocket with fileId:', fileId);
//             stompClientRef.current.send(
//               `/app/group/${groupId}/send`,
//               {},
//               JSON.stringify(response.data)
//             );
//             toast.success(`File ${fileName} uploaded and shared`);
//           } else {
//             throw new Error('WebSocket not connected');
//           }
//         } else {
//           toast.success(`File ${fileName} uploaded to drives`);
//         }
//       } catch (error) {
//         console.error('Error uploading file:', error);
//         toast.error(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`);
//       }
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim()) {
//       toast.error('Message cannot be empty');
//       return;
//     }

//     if (!isWsConnected || !stompClientRef.current || !stompClientRef.current.connected) {
//       toast.error('Cannot send message: Not connected to chat. Retrying...');
//       connectWebSocket();
//       return;
//     }

//     const tempId = `temp-${Date.now()}`;
//     const tempMessage = {
//       id: tempId,
//       senderUsername: user.username,
//       content: newMessage,
//       type: 'TEXT',
//       timestamp: new Date().toISOString(),
//       isTemp: true,
//     };

//     setMessages((prev) => [...prev, tempMessage]);
//     setFilteredMessages((prev) => [...prev, tempMessage]);
//     setNewMessage('');
//     setShowEmojiPicker(false);
//     scrollToBottom();

//     try {
//       console.log('Sending message via HTTP:', newMessage);
//       const response = await axios.post(`${API_BASE_URL}/groups/message/${groupId}`, {
//         senderUsername: user.username,
//         content: newMessage,
//         type: 'TEXT',
//       });

//       if (stompClientRef.current && stompClientRef.current.connected) {
//         console.log('Broadcasting message via WebSocket:', response.data);
//         stompClientRef.current.send(
//           `/app/group/${groupId}/send`,
//           {},
//           JSON.stringify(response.data)
//         );
//       } else {
//         throw new Error('WebSocket not connected');
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       toast.error('Failed to send message. Please try again.');
//       setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
//       setFilteredMessages((prev) => prev.filter((msg) => msg.id !== tempId));
//     }
//   };

//   const handleTyping = () => {
//     if (!isWsConnected || !stompClientRef.current || !stompClientRef.current.connected) return;

//     console.log('Sending typing event');
//     stompClientRef.current.send(
//       `/app/group/${groupId}/typing`,
//       {},
//       JSON.stringify({ senderUsername: user.username })
//     );

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
//     typingTimeoutRef.current = setTimeout(() => {}, 2000);
//   };

//   const downloadFile = async (fileId, fileName) => {
//     if (!fileId || isNaN(fileId)) {
//       console.error('Invalid fileId:', fileId, 'for file:', fileName);
//       toast.error(`Cannot download ${fileName}: Invalid file ID`);
//       return;
//     }

//     try {
//       console.log(`Attempting to download file: ${fileName} with fileId: ${fileId}`);
//       const response = await axios.get(`${API_BASE_URL}/file/download/${fileId}`, {
//         responseType: 'blob',
//       });

//       const blob = new Blob([response.data]);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', fileName || 'downloaded_file');
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//       toast.success(`Downloaded ${fileName}`);
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       if (error.response?.status === 400) {
//         toast.error(`Cannot download ${fileName}: Invalid file ID`);
//       } else if (error.response?.status === 404) {
//         toast.error(`File not found: ${fileName}`);
//       } else {
//         toast.error(`Failed to download ${fileName}: ${error.message}`);
//       }
//     }
//   };

//   const deleteFile = async (fileId, fileName, messageId) => {
//     if (!fileId) {
//       console.error('Invalid fileId for deletion:', fileId);
//       toast.error(`Cannot delete ${fileName}: Invalid file ID`);
//       return;
//     }

//     try {
//       console.log(`Attempting to delete file: ${fileName} with fileId: ${fileId}`);
//       await axios.delete(`${API_BASE_URL}/file/delete/${fileId}`);
      
//       setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
//       setFilteredMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      
//       toast.success(`Deleted ${fileName}`);
//     } catch (error) {
//       console.error('Error deleting file:', error);
//       if (error.response?.status === 404) {
//         toast.error(`File not found: ${fileName}`);
//       } else {
//         toast.error(`Failed to delete ${fileName}: ${error.message}`);
//       }
//     }
//   };

//   const shareGroupId = () => {
//     navigator.clipboard.writeText(`Join my group with ID: ${groupId}`);
//     toast.success('Group ID copied to clipboard');
//   };

//   const handleEmojiSelect = (emoji) => {
//     setNewMessage((prev) => prev + emoji);
//     setShowEmojiPicker(false);
//   };

//   const handleLeaveGroup = async () => {
//     try {
//       console.log('Leaving group:', groupId);
//       await axios.post(`${API_BASE_URL}/groups/leave/${groupId}`, { username: user.username });
//       toast.success('Left group successfully');
//       navigate('/groups');
//     } catch (error) {
//       console.error('Error leaving group:', error);
//       toast.error('Failed to leave group');
//     }
//   };

//   const handleAddMember = async () => {
//     if (!newMemberUsername.trim()) {
//       toast.error('Username cannot be empty');
//       return;
//     }
//     try {
//       console.log('Adding member:', newMemberUsername);
//       const usersResponse = await axios.get(`${API_BASE_URL}/users/viewall`);
//       const userExists = usersResponse.data.some((u) => u.username === newMemberUsername);
//       if (!userExists) {
//         toast.error('User does not exist');
//         return;
//       }
//       await axios.post(`${API_BASE_URL}/groups/join/${groupId}`, {
//         username: newMemberUsername,
//         password: groupDetails?.password || '',
//       });
//       toast.success(`${newMemberUsername} added to the group`);
//       setNewMemberUsername('');
//       setShowAddMemberInput(false);
//       fetchGroupDetails();
//     } catch (error) {
//       console.error('Error adding member:', error);
//       toast.error('Failed to add member');
//     }
//   };

//   const getInitials = (username) => {
//     if (!username) return '';
//     const nameParts = username.split(' ');
//     if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
//     return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
//   };

//   const renderMessageContent = (content) => {
//     const parts = [];
//     let lastIndex = 0;
//     let match;
//     while ((match = URL_REGEX.exec(content)) !== null) {
//       const url = match[0];
//       const startIndex = match.index;
//       const endIndex = URL_REGEX.lastIndex;
//       if (startIndex > lastIndex) {
//         parts.push({ text: content.slice(lastIndex, startIndex), isLink: false });
//       }
//       parts.push({ text: url, isLink: true });
//       lastIndex = endIndex;
//     }
//     if (lastIndex < content.length) {
//       parts.push({ text: content.slice(lastIndex), isLink: false });
//     }
//     if (parts.length === 0) {
//       parts.push({ text: content, isLink: false });
//     }
//     return (
//       <span>
//         {parts.map((part, index) =>
//           part.isLink ? (
//             <a key={index} href={part.text} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
//               {part.text}
//             </a>
//           ) : (
//             <span key={index}>{part.text}</span>
//           )
//         )}
//       </span>
//     );
//   };

//   const groupInfoData = [
//     { type: 'header', id: 'header' },
//     { type: 'group_id', id: 'group_id' },
//     { type: 'members_header', id: 'members_header' },
//     ...(showAddMemberInput ? [{ type: 'add_member_input', id: 'add_member_input' }] : []),
//     ...(members.map((member, index) => ({
//       type: 'member',
//       id: `member_${index}`,
//       data: member,
//     })) || []),
//     { type: 'links_header', id: 'links_header' },
//     ...(sharedLinks.length > 0
//       ? sharedLinks.map((link, index) => ({
//           type: 'link',
//           id: `link_${index}`,
//           data: link,
//         }))
//       : [{ type: 'no_links', id: 'no_links' }]),
//     { type: 'leave_group', id: 'leave_group' },
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="flex flex-col min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden"
//     >
//       <div className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] border-b border-gray-800 z-10">
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => navigate(-1)}
//           className="p-2 text-gray-400 hover:text-white"
//           aria-label="Back to groups"
//         >
//           <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
//         </motion.button>
//         <h2 className="text-base sm:text-lg font-bold text-white flex-1 text-center truncate">{groupName}</h2>
//         <div className="flex items-center space-x-2 sm:space-x-3">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setShowSearchBar(!showSearchBar)}
//             className="p-2 text-gray-400 hover:text-white"
//             aria-label="Toggle search"
//           >
//             <Search className="h-4 w-4 sm:h-5 sm:w-5" />
//           </motion.button>
//           <Menu as="div" className="relative">
//             <MenuButton className="p-2 text-gray-400 hover:text-white" aria-label="More options">
//               <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
//             </MenuButton>
//             <MenuItems className="absolute right-0 mt-2 w-48 bg-[#1E1E1E] rounded-lg shadow-lg z-50">
//               <MenuItem>
//                 {({ active }) => (
//                   <button
//                     onClick={() => {
//                       setShowGroupInfo(true);
//                       setShowAddMemberInput(true);
//                     }}
//                     className={`flex items-center w-full px-4 py-2 text-left text-white text-sm sm:text-base ${
//                       active ? 'bg-blue-600' : ''
//                     }`}
//                   >
//                     <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Add Member
//                   </button>
//                 )}
//               </MenuItem>
//               <MenuItem>
//                 {({ active }) => (
//                   <button
//                     onClick={shareGroupId}
//                     className={`flex items-center w-full px-4 py-2 text-left text-white text-sm sm:text-base ${
//                       active ? 'bg-blue-600' : ''
//                     }`}
//                   >
//                     <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Share Group ID
//                   </button>
//                 )}
//               </MenuItem>
//               <MenuItem>
//                 {({ active }) => (
//                   <button
//                     onClick={() => setShowGroupInfo(true)}
//                     className={`flex items-center w-full px-4 py-2 text-left text-white text-sm sm:text-base ${
//                       active ? 'bg-blue-600' : ''
//                     }`}
//                   >
//                     <Link className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Group Info
//                   </button>
//                 )}
//               </MenuItem>
//             </MenuItems>
//           </Menu>
//         </div>
//       </div>

//       <AnimatePresence>
//         {showSearchBar && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.3 }}
//             className="p-2 sm:p-3 bg-[#0A0A0A]"
//           >
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search messages..."
//                 className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
//                 autoFocus
//                 aria-label="Search messages"
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {isLoading ? (
//         <div className="flex justify-center items-center flex-1">
//           <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
//         </div>
//       ) : (
//         <div className="flex flex-col flex-1">
//           <div className="flex-1 overflow-hidden">
//             <div
//               className="h-full p-2 sm:p-3 overflow-y-auto overflow-x-hidden scrollbar-hidden"
//               onDragOver={(e) => e.preventDefault()}
//               onDrop={handleDrop}
//             >
//               {filteredMessages.map((message) => {
//                 const messageLinks = sharedLinks.filter((link) => link.messageId === message.id);
//                 const isSent = message.senderUsername === user.username;
//                 return (
//                   <motion.div
//                     key={message.id}
//                     initial={{ opacity: 0, x: isSent ? 50 : -50 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.3, ease: 'easeOut' }}
//                     className={`flex mb-2 sm:mb-3 ${isSent ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div className="flex items-start max-w-[80%] sm:max-w-[70%]">
//                       {!isSent && (
//                         <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-1">
//                           <span className="text-white font-bold text-xs sm:text-sm">{getInitials(message.senderUsername)}</span>
//                         </div>
//                       )}
//                       <div className="flex flex-col">
//                         <div
//                           className={`relative p-2 sm:p-3 rounded-xl shadow-sm ${
//                             isSent
//                               ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-br-none'
//                               : 'bg-gray-800 text-white rounded-bl-none'
//                           } ${messageLinks.length > 0 ? 'border border-blue-600 bg-gray-900' : ''}`}
//                         >
//                           <div
//                             className={`absolute bottom-0 w-4 h-4 sm:w-5 sm:h-5 ${
//                               isSent ? 'right-[-8px] bg-blue-600' : 'left-[-8px] bg-gray-800'
//                             }`}
//                             style={{
//                               clipPath: isSent
//                                 ? 'path("M 0 0 Q 8 8 16 0 L 16 16 Q 8 8 0 16 Z")'
//                                 : 'path("M 16 0 Q 8 8 0 0 L 0 16 Q 8 8 16 16 Z")',
//                             }}
//                           />
//                           {message.type === 'FILE' ? (
//                             <div className="flex items-center space-x-2">
//                               <File className={`h-3 w-3 sm:h-4 sm:w-4 ${isSent ? 'text-white' : 'text-gray-400'}`} />
//                               <span className="text-xs sm:text-sm truncate">{message.fileName || message.content}</span>
//                               <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={() => downloadFile(parseInt(message.content, 10), message.fileName || message.content)}
//                                 className="text-blue-400 hover:text-blue-300"
//                                 aria-label={`Download ${message.fileName || message.content}`}
//                               >
//                                 <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4" />
//                               </motion.button>
//                               {isSent && (
//                                 <motion.button
//                                   whileHover={{ scale: 1.05 }}
//                                   whileTap={{ scale: 0.95 }}
//                                   onClick={() => deleteFile(parseInt(message.content, 10), message.fileName || message.content, message.id)}
//                                   className="text-red-400 hover:text-red-300"
//                                   aria-label={`Delete ${message.fileName || message.content}`}
//                                 >
//                                   <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
//                                 </motion.button>
//                               )}
//                             </div>
//                           ) : (
//                             <p className="text-xs sm:text-sm font-sans">{renderMessageContent(message.content)}</p>
//                           )}
//                           {messageLinks.map((link, index) => {
//                             const preview = linkPreviews[message.id];
//                             if (!preview) return null;
//                             return (
//                               <a
//                                 key={index}
//                                 href={link.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="block mt-2 bg-gray-900 rounded-lg p-2 border border-gray-700"
//                               >
//                                 {preview.image && (
//                                   <img
//                                     src={preview.image}
//                                     alt="Link preview"
//                                     className="w-full h-16 sm:h-20 object-cover rounded"
//                                   />
//                                 )}
//                                 <div className="p-2">
//                                   <p className="text-xs sm:text-sm font-semibold text-white truncate">{preview.title || link.url}</p>
//                                   {preview.description && (
//                                     <p className="text-xs text-gray-400 mt-1 truncate">{preview.description}</p>
//                                   )}
//                                   <p className="text-xs text-blue-400 mt-1 truncate">{link.url}</p>
//                                 </div>
//                               </a>
//                             );
//                           })}
//                         </div>
//                         <span className={`text-xs ${isSent ? 'text-gray-300 self-end' : 'text-gray-400 self-start'} mt-1`}>
//                           {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}

//               {typingUsers.length > 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 10 }}
//                   className="flex justify-start mb-2 sm:mb-3"
//                 >
//                   <div className="flex items-center bg-gray-800 rounded-lg p-2 sm:p-3 max-w-[80%] sm:max-w-[70%]">
//                     <div className="flex space-x-1">
//                       <motion.div
//                         animate={{ y: [0, -5, 0] }}
//                         transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
//                         className="w-2 h-2 bg-gray-400 rounded-full"
//                       />
//                       <motion.div
//                         animate={{ y: [0, -5, 0] }}
//                         transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
//                         className="w-2 h-2 bg-gray-400 rounded-full"
//                       />
//                       <motion.div
//                         animate={{ y: [0, -5, 0] }}
//                         transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
//                         className="w-2 h-2 bg-gray-400 rounded-full"
//                       />
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>
//           </div>

//           {showEmojiPicker && (
//             <div className="p-2 sm:p-3 bg-white/10 rounded-lg flex flex-wrap gap-2">
//               {emojis.map((emoji, index) => (
//                 <motion.button
//                   key={index}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => handleEmojiSelect(emoji)}
//                   className="p-2 text-lg sm:text-xl"
//                   aria-label={`Add ${emoji} emoji`}
//                 >
//                   {emoji}
//                 </motion.button>
//               ))}
//             </div>
//           )}

//           <div className="p-2 sm:p-3 bg-[#0A0A0A] border-t border-gray-800">
//             <div className="flex items-center bg-white/5 border border-gray-700 rounded-lg p-2">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//                 className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg"
//                 aria-label="Toggle emoji picker"
//               >
//                 <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => fileInputRef.current?.click()}
//                 className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mx-1 sm:mx-2"
//                 aria-label="Upload file"
//               >
//                 <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
//               </motion.button>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden"
//                 onChange={(e) => handleFiles(e.target.files)}
//                 multiple
//               />
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => {
//                   setNewMessage(e.target.value);
//                   handleTyping();
//                 }}
//                 placeholder="Type a message..."
//                 className="flex-1 bg-transparent text-white placeholder-gray-400 px-3 py-2 focus:outline-none text-sm sm:text-base font-sans"
//                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                 aria-label="Type a message"
//               />
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={sendMessage}
//                 className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg"
//                 aria-label="Send message"
//               >
//                 <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Modal
//         isOpen={showGroupInfo || showAddMemberInput}
//         onRequestClose={() => {
//           setShowGroupInfo(false);
//           setShowAddMemberInput(false);
//           setNewMemberUsername('');
//         }}
//         style={{
//           content: {
//             position: 'fixed',
//             top: '0',
//             left: '0',
//             right: '0',
//             bottom: '0',
//             backgroundColor: '#0A0A0A',
//             border: 'none',
//             padding: '0',
//             margin: '0',
//             width: '100%',
//             height: '100%',
//             overflow: 'hidden',
//           },
//           overlay: {
//             backgroundColor: 'rgba(0, 0, 0, 0.5)',
//             backdropFilter: 'blur(4px)',
//           },
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="flex flex-col h-full"
//         >
//           <div className="flex items-center px-4 py-3 sm:py-4 bg-[#0A0A0A] border-b border-gray-800">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => {
//                 setShowGroupInfo(false);
//                 setShowAddMemberInput(false);
//                 setNewMemberUsername('');
//               }}
//               className="text-white"
//               aria-label="Close modal"
//             >
//               <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
//             </motion.button>
//             <h2 className="text-base sm:text-lg font-bold text-white ml-4 flex-1 truncate">
//               {showAddMemberInput ? 'Add Member' : groupName}
//             </h2>
//           </div>
//           <div className="flex-1 p-4 sm:p-6 overflow-hidden">
//             {showAddMemberInput ? (
//               <div className="flex items-center py-2 sm:py-3">
//                 <input
//                   type="text"
//                   value={newMemberUsername}
//                   onChange={(e) => setNewMemberUsername(e.target.value)}
//                   placeholder="Enter username..."
//                   className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 mr-2 text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
//                   aria-label="Enter username"
//                 />
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={handleAddMember}
//                   className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white text-sm sm:text-base"
//                   aria-label="Add member"
//                 >
//                   Add
//                 </motion.button>
//               </div>
//             ) : (
//               groupInfoData.map((item) => {
//                 switch (item.type) {
//                   case 'header':
//                     return null;
//                   case 'group_id':
//                     return (
//                       <div key={item.id} className="py-2 sm:py-3">
//                         <p className="text-white text-sm sm:text-base">Group ID: {groupId}</p>
//                       </div>
//                     );
//                   case 'members_header':
//                     return (
//                       <div key={item.id} className="flex justify-between items-center py-2 sm:py-3">
//                         <p className="text-white font-semibold text-sm sm:text-base">Members</p>
//                       </div>
//                     );
//                   case 'member':
//                     return (
//                       <div key={item.id} className="py-2 sm:py-3">
//                         <p className="text-white text-sm sm:text-base truncate">{item.data}</p>
//                       </div>
//                     );
//                   case 'links_header':
//                     return (
//                       <p key={item.id} className="text-white font-semibold py-2 sm:py-3 text-sm sm:text-base">Links Shared</p>
//                     );
//                   case 'link':
//                     return (
//                       <a
//                         key={item.id}
//                         href={item.data.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center py-2 sm:py-3 text-blue-400 text-sm sm:text-base"
//                       >
//                         <Link className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
//                         <span className="truncate">{item.data.url}</span>
//                       </a>
//                     );
//                   case 'no_links':
//                     return (
//                       <p key={item.id} className="text-gray-400 py-2 sm:py-3 text-sm sm:text-base">No links shared.</p>
//                     );
//                   case 'leave_group':
//                     return (
//                       <motion.button
//                         key={item.id}
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleLeaveGroup}
//                         className="w-full bg-red-500/20 text-red-500 py-2 sm:py-3 rounded-lg mt-4 sm:mt-6 text-sm sm:text-base hover:bg-red-500/30"
//                         aria-label="Leave group"
//                       >
//                         Leave Group
//                       </motion.button>
//                     );
//                   default:
//                     return null;
//                 }
//               })
//             )}
//           </div>
//         </motion.div>
//       </Modal>

//       <style jsx global>{`
//         .scrollbar-hidden::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hidden {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </motion.div>
//   );
// };

// export default ChatRoom;
