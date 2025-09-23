import { motion } from 'framer-motion';
import { useState } from 'react';
import { Crown, Check } from 'lucide-react';
import { themes } from '../lib/themes';

export const Settings = ({ setTheme }) => {
  const [downloadSpeed, setDownloadSpeed] = useState(10);
  const [uploadSpeed, setUploadSpeed] = useState(10);
  const [uploadSize, setUploadSize] = useState(50);
  const [showPremium, setShowPremium] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const handleSpeedChange = (value, type) => {
    if (type === 'download') setDownloadSpeed(value);
    if (type === 'upload') setUploadSpeed(value);
    if (type === 'size') setUploadSize(value);

    if (value > 20 || uploadSize > 100) {
      setShowPremium(true);
    }
  };

  const handleThemeChange = (themeName) => {
    setSelectedTheme(themeName);
    setTheme(themeName);
    setIsThemeDropdownOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-20 p-6"
    >
      <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

      <div className="space-y-8">
    
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Transfer Controls</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Download Speed: {downloadSpeed} Mbps
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={downloadSpeed}
                onChange={(e) => handleSpeedChange(Number(e.target.value), 'download')}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Upload Speed: {uploadSpeed} Mbps
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={uploadSpeed}
                onChange={(e) => handleSpeedChange(Number(e.target.value), 'upload')}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Upload Size Limit: {uploadSize}MB
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={uploadSize}
                onChange={(e) => handleSpeedChange(Number(e.target.value), 'size')}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

     
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Theme Selection</h2>
          <div className="relative">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="w-full px-4 py-2 text-left bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="capitalize">{selectedTheme}</span>
            </button>
            
            {isThemeDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-2 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl max-h-60 overflow-auto"
              >
                {Object.entries(themes).map(([name, colors]) => (
                  <button
                    key={name}
                    onClick={() => handleThemeChange(name)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center justify-between text-white ${
                      selectedTheme === name ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${colors.primary}`} />
                      <span className="capitalize">{name}</span>
                    </div>
                    {selectedTheme === name && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {showPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <img
                src="https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&w=800&q=80"
                alt="Premium"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowPremium(false)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <h3 className="text-2xl font-bold text-white">Upgrade to Premium</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-white/90">
                  <Check className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>Unlimited upload & download speeds</span>
                </div>
                <div className="flex items-center text-white/90">
                  <Check className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>No file size limits</span>
                </div>
                <div className="flex items-center text-white/90">
                  <Check className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/60">Starting at</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">₹19</span>
                    <span className="text-white/60 ml-1">/month</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg"
                >
                  Upgrade Now
                </motion.button>
              </div>

              <p className="text-white/40 text-sm text-center">
                Cancel anytime. No commitments.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
