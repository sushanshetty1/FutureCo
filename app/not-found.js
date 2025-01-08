"use client"
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        {/* Top glow effect */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none">
          <div className="absolute inset-0 bg-lime-400/20 blur-[100px]" />
        </div>

        <div className="w-full max-w-[1200px] mx-auto px-10 lg:px-10 md:px-5 text-center">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* 404 Text */}
            <h1 className="text-lime-400 text-9xl font-bold tracking-wider lg:text-8xl md:text-7xl sm:text-6xl">
              404
            </h1>
            
            {/* Message */}
            <h2 className="text-white text-4xl font-bold leading-tight lg:text-3xl md:text-2xl sm:text-xl">
              Oops! Page Not Found
            </h2>
            
            {/* Description */}
            <p className="text-gray-400 text-lg max-w-md mb-8 lg:text-base">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            {/* Back to Home Button */}
            <Link 
              href="/"
              className="bg-lime-400 hover:bg-lime-500 text-black font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;