import { motion } from 'framer-motion';
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../AuthContext';
import config from '../../config';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    const generateCode = () => {
      const code = Math.floor(100 + Math.random() * 900).toString();
      setCaptchaCode(code);
      console.log('Generated CAPTCHA:', code);
    };
    generateCode();
  }, []);

  const verifyCaptcha = () => {
    console.log('Verifying CAPTCHA:', { input: captchaInput, code: captchaCode });
    if (captchaInput === captchaCode) {
      setCaptchaVerified(true);
      toast.success('CAPTCHA verified!');
    } else {
      setCaptchaInput('');
      setCaptchaCode(Math.floor(100 + Math.random() * 900).toString());
      toast.error('Incorrect CAPTCHA. Try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error('Please verify CAPTCHA first');
      return;
    }

    setLoading(true);
    try {
      const isEmail = email.includes('@');
      const loginData = {
        username: isEmail ? null : email,
        email: isEmail ? email : null,
        password: password,
      };
      console.log('Sending login request:', loginData);

      const response = await axios.post(`${config.url}/api/users/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const user = response.data;
      console.log('Login response:', user);

      if (user && user.id && user.username) {
        const userData = { id: user.id, username: user.username, isAdmin: user.admin };
        console.log('Calling login with:', userData);
        login(userData);
        toast.success('Login successful');

        if (user.admin) {
          console.log('Navigating to /admin-dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else {
          console.log('Navigating to /pass-share');
          navigate('/pass-share', { replace: true });
        }
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data ||
        error.response?.data?.message ||
        error.message ||
        'An error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[90%] sm:max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm sm:text-base">Sign in to continue sharing files</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 sm:py-3 pl-10 sm:pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Username or Email"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 sm:py-3 pl-10 sm:pl-12 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <p className="text-gray-400 mb-2 text-sm sm:text-base">Verify you're not a bot</p>
                <div className="bg-white/5 p-2 sm:p-4 rounded-lg inline-block">
                  <span className="text-white text-lg sm:text-xl md:text-2xl font-mono">
                    {captchaVerified ? '✓ Verified' : captchaCode}
                  </span>
                </div>
              </div>

              {!captchaVerified && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full bg-white/5 border border-gray-700 rounded-lg py-2 sm:py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Enter CAPTCHA code"
                    maxLength={3}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={verifyCaptcha}
                    className="w-full bg-gray-600 text-white rounded-lg py-2 sm:py-3 font-medium text-sm sm:text-base"
                  >
                    Verify CAPTCHA
                  </motion.button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center text-gray-400">
                <input
                  type="checkbox"
                  className="mr-1 sm:mr-2 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !captchaVerified}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-2 sm:py-3 font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-sm sm:text-base ${
                loading || !captchaVerified ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-4 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
