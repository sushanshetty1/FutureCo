"use client"
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      // Handle successful login - you can add your redirect logic here
      console.log('Google Login successful:', result.user);
    } catch (error) {
      setError(error.message);
      console.error('Error logging in with Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Handle successful login - you can add your redirect logic here
      console.log('Email Login successful:', result.user);
    } catch (error) {
      setError(error.message);
      console.error('Error logging in with email/password:', error);
    } finally {
      setLoading(false);
    }
  };

  const formStyles = {
    transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
    transformStyle: 'preserve-3d',
    opacity: 1,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex flex-col items-center justify-center mt-32 mb-36">
        {/* Top glow effect */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none">
          <div className="absolute inset-0 bg-lime-400/20 blur-[100px]" />
        </div>

        <div className="w-full max-w-[1200px] mx-auto px-10 lg:px-10 md:px-5">
          <div className="flex flex-col items-center justify-center">
            <div className="text-lime-400 tracking-[0.21em] uppercase text-sm font-medium leading-tight md:text-xs mb-6">
              JOIN DOMNIX
            </div>

            <div className="w-full max-w-md">
              <div className="flex flex-col items-center gap-6 max-w-[600px] text-center mb-8">
                <h2 className="text-white text-5xl font-bold leading-tight mt-0 mb-0 
                  lg:text-4xl md:text-3xl sm:text-2xl">
                  Login
                </h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <form 
                onSubmit={handleEmailLogin}
                className="flex flex-col items-center justify-start gap-8 w-full bg-[#151515] border border-[#1a1a1a] rounded-[24px] p-[60px] lg:p-8"
                style={formStyles}
              >
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FcGoogle className="w-5 h-5" />
                  Continue with Google
                </button>

                <div className="w-full flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#1a1a1a]"></div>
                  <span className="text-gray-400 text-sm">or</span>
                  <div className="flex-1 h-px bg-[#1a1a1a]"></div>
                </div>

                <div className="w-full space-y-2">
                  <label htmlFor="email" className="block text-gray-300 text-sm">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-lime-400 border border-[#1a1a1a]"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="w-full space-y-2">
                  <label htmlFor="password" className="block text-gray-300 text-sm">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-lime-400 border border-[#1a1a1a]"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>

                <Link 
                  href="/SignUp" 
                  className="text-lime-400 hover:text-lime-500 text-sm text-center"
                >
                  Sign Up
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;