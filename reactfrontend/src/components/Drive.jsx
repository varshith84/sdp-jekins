import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useContext } from 'react';
import {
  Star,
  Clock,
  FolderOpen,
  Plus,
  File,
  MoreVertical,
  ChevronRight,
  Search,
  Upload,
  Grid,
  List,
  Filter,
  Download,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { renderAsync } from 'docx-preview';
import config from '../config';

const sidebarItems = [
  { icon: Star, label: 'Favorites', id: 'favorites' },
  { icon: Clock, label: 'Recents', id: 'recents' },
  { icon: FolderOpen, label: 'My Files', id: 'files' },
];

export const Drive = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('files');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  const [showMenu, setShowMenu] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const docxPreviewRef = useRef(null);
  const prevActiveTabRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && prevActiveTabRef.current !== activeTab) {
      fetchFiles();
      prevActiveTabRef.current = activeTab;
    }
  }, [activeTab, user]);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) {
          window.URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  const fetchFiles = async () => {
    if (!user?.username) {
      toast.error('No username available');
      return;
    }

    setLoading(true);
    try {
      let url;
      if (activeTab === 'favorites') {
        url = `${config.url}/api/users/file/favourites/${user.username}`;
      } else if (activeTab === 'recents') {
        url = `${config.url}/api/file/viewall/${user.username}`;
      } else {
        url = `${config.url}/api/file/viewall/${user.username}`;
      }

      const response = await axios.get(url);
      const fetchedFiles = Array.isArray(response.data) ? response.data : [];

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
              const file = JSON.parse(entry.target.dataset.file);
              if (['png', 'jpg', 'jpeg'].includes(file.extension) && !file.previewUrl) {
                const response = await axios.get(`${config.url}/api/file/download/${file.id}`, {
                  responseType: 'blob',
                });
                const previewUrl = window.URL.createObjectURL(new Blob([response.data]));
                setFiles((prev) =>
                  prev.map((f) => (f.id === file.id ? { ...f, previewUrl } : f))
                );
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      const transformedFiles = await Promise.all(
        fetchedFiles.map(async (file) => {
          const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || '';
          return {
            id: file.id,
            name: file.fileName || file.name,
            type: file.isFolder ? 'folder' : 'file',
            size: file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '-',
            date: file.uploadDate || new Date().toISOString().split('T')[0],
            isFavourite: file.isFavourite || false,
            previewUrl: null,
            extension: fileExtension,
          };
        })
      );

      setFiles(activeTab === 'recents' ? transformedFiles.slice(-3) : transformedFiles);

      transformedFiles.forEach((file) => {
        const element = document.querySelector(`[data-file-id="${file.id}"]`);
        if (element) {
          element.dataset.file = JSON.stringify(file);
          observer.observe(element);
        }
      });
    } catch (error) {
      toast.error('Failed to load files: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user || !user.id) {
      toast.error('User not authenticated. Please log in.');
      return;
    }

    const validTypes = [
      'image/png',
      'image/jpeg',
      'application/pdf',
      'video/mp4',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload PNG, JPEG, PDF, MP4, or DOCX.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let previewUrl = null;

    if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
      previewUrl = window.URL.createObjectURL(file);
    }

    const newFile = {
      id: tempId,
      name: file.name,
      type: 'file',
      size: '-',
      date: new Date().toISOString().split('T')[0],
      isFavourite: false,
      previewUrl,
      extension: fileExtension,
      isUploading: true,
    };

    setFiles((prev) => [...prev, newFile]);
    setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadUrl = `${config.url}/api/file/upload/${user.id}`;
      const response = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({ ...prev, [tempId]: percentCompleted }));
        },
      });

      const uploadedFile = {
        ...newFile,
        id: response.data.id || tempId,
        size: file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '-',
        isUploading: false,
      };

      setFiles((prev) => prev.map((f) => (f.id === tempId ? uploadedFile : f)));
      toast.success('File uploaded successfully!');
      await fetchFiles();
    } catch (error) {
      toast.error('Failed to upload file: ' + (error.response?.data?.message || error.message));
      setFiles((prev) => prev.filter((f) => f.id !== tempId));
    } finally {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[tempId];
        return newProgress;
      });
    }
  };

  const handleDownload = async (file) => {
    if (!file) return;

    setDownloadProgress((prev) => ({ ...prev, [file.id]: 0 }));
    try {
      const response = await axios.get(`${config.url}/api/file/download/${file.id}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress((prev) => ({ ...prev, [file.id]: percentCompleted }));
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      toast.error('Failed to download file: ' + (error.message || 'Unknown error'));
    } finally {
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.id];
        return newProgress;
      });
    }
  };

  const handleDelete = async (file) => {
    if (!file) return;

    try {
      await axios.delete(`${config.url}/api/file/delete/${file.id}`);
      toast.success(`Deleted ${file.name}`);
      await fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleFavourite = async (file) => {
    if (!file) return;

    try {
      await axios.put(`${config.url}/api/users/file/favourite/${file.id}/${!file.isFavourite}`);
      toast.success(file.isFavourite ? 'Removed from Favorites' : 'Added to Favorites');
      await fetchFiles();
    } catch (error) {
      toast.error('Failed to update favorite status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewFile = async (file) => {
    if (!file) return;

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg'].includes(fileExtension);
      const isPDF = fileExtension === 'pdf';
      const isDoc = ['doc', 'docx'].includes(fileExtension);
      const isPPT = ['ppt', 'pptx'].includes(fileExtension);
      const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(fileExtension);

      const response = await axios.get(`${config.url}/api/file/download/${file.id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      if (isImage) {
        const url = window.URL.createObjectURL(blob);
        setViewingFile({ url, name: file.name, type: 'image' });
      } else if (isPDF) {
        const url = window.URL.createObjectURL(blob);
        setViewingFile({ url, name: file.name, type: 'pdf' });
      } else if (isDoc) {
        setViewingFile({ name: file.name, type: 'docx', blob });
        setTimeout(() => {
          if (docxPreviewRef.current) {
            renderAsync(blob, docxPreviewRef.current, docxPreviewRef.current, {
              className: 'docx',
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              ignoreFonts: false,
              breakPages: true,
              trimXmlDeclaration: true,
              experimental: true,
            }).catch((err) => {
              toast.error('Failed to render .docx file: ' + err.message);
              setViewingFile({ url: window.URL.createObjectURL(blob), name: file.name, type: 'download' });
            });
          }
        }, 0);
      } else if (isPPT) {
        const url = window.URL.createObjectURL(blob);
        setViewingFile({ url, name: file.name, type: 'download' });
      } else if (isVideo) {
        const url = window.URL.createObjectURL(blob);
        setViewingFile({ url, name: file.name, type: 'video' });
      } else {
        const url = window.URL.createObjectURL(blob);
        setViewingFile({ url, name: file.name, type: 'download' });
        toast.error('Unsupported file type for viewing');
      }
    } catch (error) {
      toast.error('Failed to load file: ' + (error.message || 'Unknown error'));
      setViewingFile(null);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Please provide a folder name');
      return;
    }

    try {
      await axios.post(`${config.url}/api/folder/create/${user.id}`, {
        name: folderName,
      });
      toast.success('Folder created successfully!');
      setShowNewFolderModal(false);
      setFolderName('');
      await fetchFiles();
    } catch (error) {
      toast.error('Failed to create folder: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleItemClick = (file) => {
    setSelectedItem(selectedItem?.id === file.id ? null : file);
    setShowMenu(null);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setShowMenu(showMenu === id ? null : id);
  };

  const handleAction = (action, file, e) => {
    e.stopPropagation();
    switch (action) {
      case 'download':
        handleDownload(file);
        break;
      case 'delete':
        handleDelete(file);
        break;
      case 'favourite':
        toggleFavourite(file);
        break;
      case 'view':
        handleViewFile(file);
        break;
      default:
        break;
    }
    setShowMenu(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') return <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />;
    if (file.previewUrl && ['png', 'jpg', 'jpeg'].includes(file.extension)) {
      return <img src={file.previewUrl} alt="preview" className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv'].includes(file.extension)) {
      return <VideoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />;
    }
    if (file.extension === 'pdf') {
      return <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />;
    }
    if (['doc', 'docx'].includes(file.extension)) {
      return <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />;
    }
    if (['ppt', 'pptx'].includes(file.extension)) {
      return <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />;
    }
    return <File className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col sm:flex-row h-[calc(100vh-8rem)] mt-20 bg-[#0A0A0A] rounded-lg overflow-hidden max-w-[95%] sm:max-w-7xl mx-auto px-2 sm:px-6"
      role="main"
      aria-label="File Drive"
    >
      {/* Sidebar */}
      <div className="w-full sm:w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 p-2 sm:p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white mb-4 text-sm sm:text-base"
          aria-label="Upload Files"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Files</span>
        </motion.button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          aria-label="File upload input"
        />

        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeTab === item.id
                  ? 'bg-blue-500/20 text-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-label={`Switch to ${item.label}`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-2 sm:p-6 border-b border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-6">
            <div className="flex-1 max-w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 text-sm"
                  aria-label="Search files"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                aria-label="Filter files"
              >
                <Filter className="h-5 w-5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg text-white text-sm"
                aria-label="Create new folder"
              >
                <Plus className="h-5 w-5" />
                <span>New Folder</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 rounded-lg text-white text-sm"
                aria-label="Sign out"
              >
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Files Grid/List */}
        <div className="flex-1 p-2 sm:p-6 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div
                className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"
                role="status"
                aria-label="Loading files"
              ></div>
            </div>
          ) : (
            <div
              className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6' : 'space-y-2 sm:space-y-4'}
              role="list"
              aria-label="File list"
            >
              {files
                .filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: file.isUploading ? 0 : 1 }}
                    animate={{ opacity: file.isUploading ? (uploadProgress[file.id] === 100 ? 1 : 0) : 1 }}
                    whileHover={{ y: -2 }}
                    onClick={() => handleItemClick(file)}
                    className={`${
                      viewMode === 'grid'
                        ? 'bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 relative'
                        : 'flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 relative'
                    } ${selectedItem?.id === file.id ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
                    role="listitem"
                    data-file-id={file.id}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleItemClick(file)}
                    aria-label={`File: ${file.name}`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 w-full">
                            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                              {getFileIcon(file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm sm:text-base text-white font-medium truncate max-w-[70%] sm:max-w-[80%]">
                                  {file.name}
                                </h3>
                                <button
                                  onClick={(e) => toggleMenu(file.id, e)}
                                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 flex-shrink-0"
                                  aria-label="More options"
                                >
                                  <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400">{file.size}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-400">
                          <span>Modified {new Date(file.date).toLocaleDateString()}</span>
                          {file.type === 'folder' && (
                            <button
                              className="p-1 hover:text-white rounded-full hover:bg-white/5"
                              aria-label="Open folder"
                            >
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          )}
                        </div>
                        {(downloadProgress[file.id] > 0 || uploadProgress[file.id] > 0) && (
                          <div className="mt-2 h-1 bg-gray-700 rounded">
                            <div
                              className="h-full bg-blue-500 rounded"
                              style={{ width: `${downloadProgress[file.id] || uploadProgress[file.id] || 0}%` }}
                            />
                          </div>
                        )}
                        {showMenu === file.id && (
                          <div className="absolute right-2 sm:right-4 top-12 bg-[#1A1A1A] rounded-lg shadow-lg z-10 w-36 sm:w-40">
                            <button
                              onClick={(e) => handleAction('download', file, e)}
                              className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                              aria-label="Download file"
                            >
                              Download
                            </button>
                            {['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'mp4', 'mov', 'avi', 'mkv'].some(
                              (ext) => file.name.toLowerCase().endsWith(`.${ext}`)
                            ) && (
                              <button
                                onClick={(e) => handleAction('view', file, e)}
                                className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                                aria-label="View file"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={(e) => handleAction('favourite', file, e)}
                              className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                              aria-label={file.isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                              {file.isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                            <button
                              onClick={(e) => handleAction('delete', file, e)}
                              className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                              aria-label="Delete file"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3 w-full">
                          <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm sm:text-base text-white font-medium truncate max-w-[70%] sm:max-w-[80%]">
                                {file.name}
                              </h3>
                              <button
                                onClick={(e) => toggleMenu(file.id, e)}
                                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 flex-shrink-0"
                                aria-label="More options"
                              >
                                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400">
                              Modified {new Date(file.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span className="text-xs sm:text-sm text-gray-400">{file.size}</span>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={(e) => handleAction('download', file, e)}
                              className="p-1 sm:p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                              aria-label="Download file"
                            >
                              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            {['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'mp4', 'mov', 'avi', 'mkv'].some(
                              (ext) => file.name.toLowerCase().endsWith(`.${ext}`)
                            ) && (
                              <button
                                onClick={(e) => handleAction('view', file, e)}
                                className="p-1 sm:p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                                aria-label="View file"
                              >
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleAction('favourite', file, e)}
                              className="p-1 sm:p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                              aria-label={file.isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                              <Star className={`h-4 w-4 sm:h-5 sm:w-5 ${file.isFavourite ? 'text-yellow-400' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleAction('delete', file, e)}
                              className="p-1 sm:p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                              aria-label="Delete file"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </div>
                        {(downloadProgress[file.id] > 0 || uploadProgress[file.id] > 0) && (
                          <div className="mt-2 h-1 bg-gray-700 rounded">
                            <div
                              className="h-full bg-blue-500 rounded"
                              style={{ width: `${downloadProgress[file.id] || uploadProgress[file.id] || 0}%` }}
                            />
                          </div>
                        )}
                        {showMenu === file.id && (
                          <div className="absolute right-2 sm:right-4 top-10 bg-[#1A1A1A] rounded-lg shadow-lg z-10 w-36 sm:w-40">
                            <button
                              onClick={(e) => handleAction('download', file, e)}
                              className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                              aria-label="Download file"
                            >
                              Download
                            </button>
                            {['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'mp4', 'mov', 'avi', 'mkv'].some(
                              (ext) => file.name.toLowerCase().endsWith(`.${ext}`)
                            ) && (
                              <button
                                onClick={(e) => handleAction('view', file, e)}
                                className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                                aria-label="View file"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={(e) => handleAction('favourite', file, e)}
                              className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                              aria-label={file.isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                              {file.isFavourite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                            <button
                              onClick={(e) => handleAction('delete', file, e)}
                              className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-white/10 text-sm"
                              aria-label="Delete file"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="new-folder-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] rounded-lg p-3 sm:p-6 w-full max-w-[95%] sm:max-w-md"
          >
            <h2 id="new-folder-modal-title" className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              Create New Folder
            </h2>
            <input
              type="text"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 text-sm sm:text-base mb-3 sm:mb-4"
              aria-label="Folder name"
            />
            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-2 text-gray-400 hover:text-white text-sm"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createFolder}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white text-sm"
                aria-label="Create folder"
              >
                Create
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4"
          role="dialog"
          aria-labelledby="file-viewer-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] rounded-lg p-4 sm:p-6 w-full max-w-[95%] sm:max-w-7xl max-h-[100vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 id="file-viewer-modal-title" className="text-lg sm:text-2xl font-bold text-white truncate max-w-[80%]">
                {viewingFile.name}
              </h2>
              <button
                onClick={() => setViewingFile(null)}
                className="text-gray-400 hover:text-white text-sm sm:text-base"
                aria-label="Close file viewer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-lg">
              {viewingFile.type === 'image' ? (
                <div className="flex items-center justify-center h-full w-full">
                  <img
                    src={viewingFile.url}
                    alt={viewingFile.name}
                    className="max-w-full max-h-full min-w-[80%] min-h-[80%] object-contain rounded-lg"
                  />
                </div>
              ) : viewingFile.type === 'pdf' ? (
                <iframe
                  src={viewingFile.url}
                  className="w-full h-full rounded-lg"
                  style={{ minHeight: '80vh' }}
                  title="File Viewer"
                />
              ) : viewingFile.type === 'docx' ? (
                <div
                  ref={docxPreviewRef}
                  className="w-full h-full bg-white text-black p-4 sm:p-6 rounded-lg overflow-auto"
                  style={{ minHeight: '80vh' }}
                />
              ) : viewingFile.type === 'video' ? (
                <div className="flex items-center justify-center h-full w-full">
                  <video
                    src={viewingFile.url}
                    controls
                    className="max-w-full max-h-full min-w-[80%] min-h-[80%] rounded-lg"
                  />
                </div>
              ) : viewingFile.type === 'download' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4 sm:mb-6" />
                  <p className="text-white mb-4 sm:mb-6 text-sm sm:text-base text-center">
                    This file cannot be viewed in the browser. Please download it to view.
                  </p>
                  <a
                    href={viewingFile.url}
                    download={viewingFile.name}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                    aria-label={`Download ${viewingFile.name}`}
                  >
                    Download {viewingFile.name}
                  </a>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Drive;