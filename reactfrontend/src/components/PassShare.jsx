// import { motion } from 'framer-motion';
// import { useState, useEffect, useRef, useContext } from 'react';
// import { FileUp, Copy, Key, Upload, Download } from 'lucide-react';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import SockJS from 'sockjs-client';
// import Stomp from 'stompjs';
// import { AuthContext } from '../AuthContext';
// import config from '../config';

// const PassShare = () => {
//   const { user } = useContext(AuthContext);
//   const [passkey, setPasskey] = useState('');
//   const [joinPasskey, setJoinPasskey] = useState('');
//   const [isInSession, setIsInSession] = useState(false);
//   const [files, setFiles] = useState([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({});
//   const [downloadProgress, setDownloadProgress] = useState({});
//   const fileInputRef = useRef(null);
//   const stompClientRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (stompClientRef.current) {
//         stompClientRef.current.disconnect();
//       }
//     };
//   }, []);

//   const generatePasskey = async () => {
//     if (!user || !user.username) {
//       toast.error('Please log in to create a session');
//       return;
//     }

//     setIsLoading(true);
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';
//     for (let i = 0; i < 8; i++) {
//       result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setPasskey(result);

//     try {
//       await axios.post(`${config.url}/api/sessions/create`, {
//         passkey: result,
//         username: user.username,
//       });
//       setIsInSession(true);
//       toast.success(`Session created with passkey: ${result}`);
//       connectWebSocket(result);
//       fetchSessionFiles(result);
//     } catch (error) {
//       toast.error('Failed to create session: ' + (error.response?.data?.message || error.message));
//       setPasskey('');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const copyPasskey = () => {
//     if (passkey) {
//       navigator.clipboard.writeText(passkey);
//       toast.success('Passkey copied to clipboard!');
//     }
//   };

//   const handleJoin = async () => {
//     if (!user || !user.username) {
//       toast.error('Please log in to join a session');
//       return;
//     }

//     if (!joinPasskey.trim()) {
//       toast.error('Please enter a passkey');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await axios.post(`${config.url}/api/sessions/join`, {
//         passkey: joinPasskey,
//         username: user.username,
//       });
//       setPasskey(joinPasskey);
//       setIsInSession(true);
//       toast.success('Joined session!');
//       connectWebSocket(joinPasskey);
//       fetchSessionFiles(joinPasskey);
//     } catch (error) {
//       toast.error('Failed to join session: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setIsLoading(false);
//       setJoinPasskey('');
//     }
//   };

//   const connectWebSocket = (passkey) => {
//     if (stompClientRef.current) {
//       stompClientRef.current.disconnect();
//     }

//     const socket = new SockJS(`${config.url}/ws`);
//     const stompClient = Stomp.over(socket);
//     stompClient.connect({}, () => {
//       stompClient.subscribe(`/topic/session/${passkey}`, () => {
//         fetchSessionFiles(passkey);
//       });
//     }, () => {
//       setTimeout(() => connectWebSocket(passkey), 5000); // Reconnect on error
//     });
//     stompClientRef.current = stompClient;
//   };

//   const fetchSessionFiles = async (passkey) => {
//     try {
//       const response = await axios.get(`${config.url}/api/sessions/files/${passkey}`);
//       setFiles(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch files: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   const handleFileUpload = async (file) => {
//     if (!user || !user.id) {
//       toast.error('Please log in to upload files');
//       return;
//     }

//     const validTypes = [
//       'image/png',
//       'image/jpeg',
//       'application/pdf',
//       'video/mp4',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     ];
//     if (!validTypes.includes(file.type)) {
//       toast.error('Unsupported file type. Please upload PNG, JPEG, PDF, MP4, or DOCX.');
//       return;
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error('File size must be less than 10MB.');
//       return;
//     }

//     const tempId = `temp-${Date.now()}`;
//     setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

//     const formData = new FormData();
//     formData.append('file', file);
//     try {
//       await axios.post(`${config.url}/api/sessions/upload/${passkey}/${user.id}`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress((prev) => ({ ...prev, [tempId]: percentCompleted }));
//         },
//       });
//       toast.success('File uploaded successfully');
//       fetchSessionFiles(passkey);
//     } catch (error) {
//       toast.error('Failed to upload file: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setUploadProgress((prev) => {
//         const newProgress = { ...prev };
//         delete newProgress[tempId];
//         return newProgress;
//       });
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     droppedFiles.forEach(handleFileUpload);
//   };

//   const handleFileSelect = (e) => {
//     if (e.target.files) {
//       const selectedFiles = Array.from(e.target.files);
//       selectedFiles.forEach(handleFileUpload);
//     }
//   };

//   const handleDownload = async (fileId, fileName) => {
//     setDownloadProgress((prev) => ({ ...prev, [fileId]: 0 }));
//     try {
//       const response = await axios.get(`${config.url}/api/file/download/${fileId}`, {
//         responseType: 'blob',
//         onDownloadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setDownloadProgress((prev) => ({ ...prev, [fileId]: percentCompleted }));
//         },
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', fileName);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success(`Downloaded ${fileName}`);
//     } catch (error) {
//       toast.error('Failed to download file: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setDownloadProgress((prev) => {
//         const newProgress = { ...prev };
//         delete newProgress[fileId];
//         return newProgress;
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center">
//         <motion.div
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 360],
//           }}
//           transition={{
//             duration: 2,
//             repeat: Infinity,
//             ease: 'easeInOut',
//           }}
//           className="relative"
//         >
//           <FileUp size={64} className="text-blue-500" />
//           <motion.div
//             animate={{
//               opacity: [0.3, 0.6, 0.3],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               ease: 'easeInOut',
//             }}
//             className="absolute inset-0 bg-blue-500 rounded-full filter blur-lg opacity-30"
//           />
//         </motion.div>
//         <motion.p
//           animate={{
//             opacity: [0.5, 1, 0.5],
//           }}
//           transition={{
//             duration: 2,
//             repeat: Infinity,
//             ease: 'easeInOut',
//           }}
//           className="absolute mt-32 text-blue-500 font-medium"
//         >
//           Connecting to secure channel...
//         </motion.p>
//       </div>
//     );
//   }

//   if (!isInSession) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-4xl mx-auto mt-20 p-6"
//         role="main"
//         aria-label="PassShare"
//       >
//         <div className="text-center mb-12">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ type: 'spring', stiffness: 260, damping: 20 }}
//             className="inline-block p-4 bg-blue-500/20 backdrop-blur-lg rounded-full mb-4"
//           >
//             <FileUp className="h-12 w-12 text-blue-500" />
//           </motion.div>
//           <h1 className="text-3xl font-bold mb-2 text-white">Secure File Sharing</h1>
//           <p className="text-gray-400">Share files securely with a generated passkey</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <motion.div
//             whileHover={{ y: -2 }}
//             className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg text-center"
//           >
//             <Upload className="h-8 w-8 text-blue-500 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-white mb-2">Send Files</h3>
//             <p className="text-sm text-gray-400">Share files with others</p>
//           </motion.div>

//           <motion.div
//             whileHover={{ y: -2 }}
//             className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg text-center"
//           >
//             <Download className="h-8 w-8 text-blue-500 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-white mb-2">Receive Files</h3>
//             <p className="text-sm text-gray-400">Get files from others</p>
//           </motion.div>

//           <motion.div
//             whileHover={{ y: -2 }}
//             className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg text-center"
//           >
//             <FileUp className="h-8 w-8 text-blue-500 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-white mb-2">Share History</h3>
//             <p className="text-sm text-gray-400">View recent transfers</p>
//           </motion.div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           <motion.div
//             whileHover={{ y: -2 }}
//             className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg"
//           >
//             <h2 className="text-xl font-semibold mb-4 text-white">Create Share</h2>
//             <div className="space-y-4">
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={passkey}
//                   readOnly
//                   placeholder="Generated passkey"
//                   className="flex-1 p-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400"
//                   aria-label="Generated passkey"
//                 />
//                 {passkey && (
//                   <motion.button
//                     whileTap={{ scale: 0.95 }}
//                     onClick={copyPasskey}
//                     className="p-2 text-blue-500 hover:bg-white/5 rounded-lg"
//                     aria-label="Copy passkey"
//                   >
//                     <Copy className="h-5 w-5" />
//                   </motion.button>
//                 )}
//               </div>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={generatePasskey}
//                 disabled={isLoading}
//                 className={`w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-medium ${
//                   isLoading ? 'opacity-75 cursor-not-allowed' : ''
//                 }`}
//                 aria-label="Generate passkey"
//               >
//                 Generate Passkey
//               </motion.button>
//             </div>
//           </motion.div>

//           <motion.div
//             whileHover={{ y: -2 }}
//             className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg"
//           >
//             <h2 className="text-xl font-semibold mb-4 text-white">Join Share</h2>
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 value={joinPasskey}
//                 onChange={(e) => setJoinPasskey(e.target.value)}
//                 placeholder="Enter passkey"
//                 className="w-full p-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                 disabled={isLoading}
//                 aria-label="Enter passkey"
//               />
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleJoin}
//                 disabled={isLoading}
//                 className={`w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-medium ${
//                   isLoading ? 'opacity-75 cursor-not-allowed' : ''
//                 }`}
//                 aria-label="Join session"
//               >
//                 Join Session
//               </motion.button>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-4xl mx-auto mt-20 p-6"
//       role="main"
//       aria-label="PassShare Session"
//     >
//       <div className="mb-12">
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ type: 'spring', stiffness: 260, damping: 20 }}
//           className="inline-block p-4 bg-blue-500/20 backdrop-blur-lg rounded-full mb-4"
//         >
//           <Key className="h-12 w-12 text-blue-500" />
//         </motion.div>
//         <h1 className="text-3xl font-bold mb-2 text-white">Secure File Sharing Session</h1>
//         <div className="flex items-center space-x-2">
//           <p className="text-gray-400">Passkey: <span className="font-mono text-white">{passkey}</span></p>
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={copyPasskey}
//             className="p-2 text-blue-500 hover:bg-white/5 rounded-lg"
//             aria-label="Copy passkey"
//           >
//             <Copy className="h-5 w-5" />
//           </motion.button>
//         </div>
//       </div>

//       <motion.div
//         onDragOver={(e) => {
//           e.preventDefault();
//           setIsDragging(true);
//         }}
//         onDragLeave={() => setIsDragging(false)}
//         onDrop={handleDrop}
//         className={`border-2 border-dashed rounded-lg p-6 text-center mb-8 transition-colors ${
//           isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-white/5'
//         }`}
//         role="region"
//         aria-label="File upload area"
//       >
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileSelect}
//           className="hidden"
//           multiple
//           aria-label="File upload input"
//         />
//         <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
//         <p className="text-white mb-2">Drag & drop files here</p>
//         <p className="text-gray-400 mb-4">or</p>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => fileInputRef.current?.click()}
//           className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-500 font-medium hover:bg-blue-500/30"
//           aria-label="Browse files"
//         >
//           Browse Files
//         </motion.button>
//       </motion.div>

//       <div className="space-y-4" role="list" aria-label="Shared files">
//         {files.length === 0 && (
//           <p className="text-gray-400 text-center">No files shared yet.</p>
//         )}
//         {files.map((file) => (
//           <motion.div
//             key={file.id}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white/10 backdrop-blur-lg rounded-lg p-4 flex items-center justify-between"
//             role="listitem"
//             aria-label={`File: ${file.fileName}`}
//           >
//             <div className="flex items-center space-x-3">
//               <FileUp className="h-6 w-6 text-blue-500" />
//               <div>
//                 <h3 className="text-white font-medium">{file.fileName}</h3>
//                 <p className="text-sm text-gray-400">
//                   {(file.size / 1024 / 1024).toFixed(1)} MB • Uploaded by {file.uploaderUsername}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               {(uploadProgress[file.id] > 0 || downloadProgress[file.id] > 0) && (
//                 <div className="w-24 h-2 bg-gray-700 rounded">
//                   <div
//                     className="h-full bg-blue-500 rounded"
//                     style={{ width: `${uploadProgress[file.id] || downloadProgress[file.id] || 0}%` }}
//                   />
//                 </div>
//               )}
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => handleDownload(file.id, file.fileName)}
//                 className="p-2 text-blue-500 hover:bg-white/5 rounded-lg"
//                 aria-label={`Download ${file.fileName}`}
//               >
//                 <Download className="h-5 w-5" />
//               </motion.button>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// export default PassShare;