import { motion } from 'framer-motion';
import { FileUp } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center z-50"
    >
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <div className="relative">
            <FileUp size={80} className="text-blue-500" />
            <motion.div
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-500 rounded-full filter blur-xl opacity-20"
            />
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-32 h-32 rounded-full border-2 border-blue-500/20" />
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1.2, 1.7, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        >
          <div className="w-40 h-40 rounded-full border-2 border-blue-500/10" />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
      />
      
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-28 left-1/2 transform -translate-x-1/2 text-blue-500 font-medium"
      >
        Loading your secure space...
      </motion.p>
    </motion.div>
  );
};