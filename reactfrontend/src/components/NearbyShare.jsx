import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Laptop, Smartphone, Tablet } from 'lucide-react';

export const NearbyShare = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  const startScanning = () => {
    setIsScanning(true);

    setTimeout(() => {
      setDevices([
        { id: 1, name: "John's MacBook", type: "laptop" },
        { id: 2, name: "Sarah's iPhone", type: "phone" },
        { id: 3, name: "Meeting Room iPad", type: "tablet" }
      ]);
    }, 3000);
  };

  const connectToDevice = (deviceId) => {
    navigate('/chat');
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'laptop':
        return Laptop;
      case 'phone':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Laptop;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-20 p-6"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-white">Nearby Devices</h1>
        <p className="text-gray-400">Discover and share with devices around you</p>
      </div>

      <div className="relative">
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startScanning}
            disabled={isScanning}
            className={`px-6 py-3 rounded-full font-medium text-white
              ${isScanning ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/20'}
            `}
          >
            <div className="flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>{isScanning ? 'Scanning...' : 'Scan for Devices'}</span>
            </div>
          </motion.button>
        </div>

        {/* Radar Animation */}
        <div className="relative w-72 h-72 mx-auto">
          {isScanning && (
            <>
              <motion.div
                animate={{
                  scale: [1, 2],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 2],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 border-2 border-blue-500/20 rounded-full"
              />
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom bg-gradient-to-t from-blue-500/0 to-blue-500/50" />
              </motion.div>
            </>
          )}

          {/* Devices */}
          {devices.map((device, index) => {
            const DeviceIcon = getDeviceIcon(device.type);
            const angle = (360 / devices.length) * index;
            const x = Math.cos((angle * Math.PI) / 180) * 100;
            const y = Math.sin((angle * Math.PI) / 180) * 100;

            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="absolute cursor-pointer"
                onClick={() => connectToDevice(device.id)}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-white/10 backdrop-blur-lg p-3 rounded-lg shadow-lg hover:shadow-blue-500/20"
                >
                  <DeviceIcon className="h-6 w-6 text-blue-500" />
                </motion.div>
                <div className="mt-2 text-sm font-medium text-center whitespace-nowrap text-white">
                  {device.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};