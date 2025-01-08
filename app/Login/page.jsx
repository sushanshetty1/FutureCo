"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
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
      }

      router.push('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8">
            Login
          </h1>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#151515] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8 md:p-10">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleSocialLogin(googleProvider, 'Google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin(githubProvider, 'GitHub')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGithub className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;