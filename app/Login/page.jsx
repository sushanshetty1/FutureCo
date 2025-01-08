"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBar';
import { auth, googleProvider, githubProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider, providerName) => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email,
          provider: providerName,
          createdAt: serverTimestamp(),
        });
        console.log('New user added to Firestore:', user.uid);
      } else {
        console.log('User already exists in Firestore:', user.uid);
      }

      console.log(`${providerName} Login successful:`, user);
      router.push('/Dashboard');
    } catch (error) {
      setError(error.message);
      console.error(`Error logging in with ${providerName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex flex-col items-center justify-center mt-4 mb-36">

        <div className="w-full max-w-[1200px] mx-auto px-10 lg:px-10 md:px-5">
          <div className="flex flex-col items-center justify-center">
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

              <div className="flex flex-col items-center justify-start gap-6 w-full bg-[#151515] border border-[#1a1a1a] rounded-[24px] p-[60px] lg:p-8">
                <button
                  type="button"
                  onClick={() => handleSocialLogin(googleProvider, 'Google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FcGoogle className="w-5 h-5" />
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin(githubProvider, 'GitHub')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#24292e] hover:bg-[#2f363d] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaGithub className="w-5 h-5" />
                  Continue with GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
