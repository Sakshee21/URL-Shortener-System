import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import URLForm from "../components/url/URLForm";
import ResultCard from "../components/url/ResultCard";

function LandingPage() {
  const [shortUrl, setShortUrl] = useState(null);
  const [animate, setAnimate] = useState(false);

  // Page fade-in on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div
        className="
          relative min-h-screen flex flex-col overflow-hidden
          bg-gradient-to-br
          from-blue-100 via-white to-purple-100
          dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1e293b]
          transition-all duration-700
        "
      >

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
  
    {/* Left Blob */}
      <div className="
        absolute top-[-200px] left-[-200px]
        w-[600px] h-[600px]
        bg-blue-500/30
        dark:bg-blue-600/25
        rounded-full
        blur-[120px]
      " />

      {/* Right Blob */}
      <div className="
        absolute bottom-[-200px] right-[-200px]
        w-[600px] h-[600px]
        bg-purple-500/30
        dark:bg-purple-600/25
        rounded-full
        blur-[120px]
      " />

    </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] 
          bg-blue-500 opacity-20 dark:opacity-30 
          rounded-full blur-[150px]" />
      </div>
      <Navbar />

      <main
        className={`flex-1 flex flex-col items-center justify-center px-4 text-center 
        transition-all duration-700 ease-out 
        ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="max-w-2xl w-full">

          {/* Hero Section */}
          <h1 className="text-4xl md:text-5xl font-extrabold 
            text-slate-800 dark:text-white 
            mb-6 leading-tight 
            transition duration-500">
            
            Shorten Your Long Links <br />
            <span className="
              bg-gradient-to-r from-blue-500 to-indigo-500
              bg-clip-text text-transparent
              drop-shadow-lg
            ">
              In Seconds
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-lg mb-10 transition">
            Fast, secure and reliable URL shortening with real-time analytics.
          </p>

          {/* Form Card */}
          <div
            className="
              backdrop-blur-xl
              bg-white/70 dark:bg-slate-800/70
              border border-slate-200 dark:border-slate-700
              p-6 rounded-2xl
              shadow-xl
              hover:shadow-blue-400/20 dark:hover:shadow-blue-900/40
              hover:-translate-y-1
              transition-all duration-300
            "
          >
              <URLForm setShortUrl={setShortUrl} />
            </div>

          {/* Result Animation */}
          {shortUrl && (
            <div className="mt-6 animate-fadeIn">
              <ResultCard shortUrl={shortUrl} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;