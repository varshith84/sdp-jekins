import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[90%] sm:max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-400 hover:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back to login
          </Link>

          {!submitted ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-6 sm:mb-8"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Enter your email to receive reset instructions
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 sm:py-3 pl-10 sm:pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Email address"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-2 sm:py-3 font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm sm:text-base"
                >
                  Send Reset Link
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 sm:py-8"
            >
              <div className="mb-4 sm:mb-6">
                <Mail className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Check Your Email</h2>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                We've sent password reset instructions to {email}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-500 hover:text-blue-400 text-sm sm:text-base"
              >
                Try another email
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};