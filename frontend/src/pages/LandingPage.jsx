import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import StatsSection from "../components/ui/StatsSection";
import FeaturesSection from "../components/ui/FeaturesSection";
import CTASection from "../components/ui/CTASection";

import URLForm from "../components/url/URLForm";
import ResultCard from "../components/url/ResultCard";

import { useState } from "react";

export default function LandingPage() {
  const [shortUrl, setShortUrl] = useState("");

  const handleShorten = (longUrl) => {
    if (!longUrl) return;

    const fakeShort =
      "https://linksprint/" +
      Math.random().toString(36).substring(2, 8);

    setShortUrl(fakeShort);
  };

  return (
    <div className="relative min-h-screen overflow-hidden 
      bg-gradient-to-br 
      from-blue-50 via-white to-blue-100 
      dark:from-[#0f172a] dark:via-[#111827] dark:to-black
      transition-colors duration-500">
      

      {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">

          {/* Light Mode Blobs */}
          <div className="relative min-h-screen overflow-hidden 
            bg-gradient-to-br 
            from-blue-50 via-white to-blue-100 
            dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
            transition-colors duration-500"></div>

          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px]
            bg-purple-400 rounded-full mix-blend-multiply
            filter blur-3xl opacity-30 animate-pulse
            dark:hidden">
          </div>

          {/* Dark Mode Glow Blobs */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px]
            bg-blue-600 rounded-full
            filter blur-3xl opacity-20 animate-pulse
            hidden dark:block">
          </div>

          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px]
            bg-purple-600 rounded-full
            filter blur-3xl opacity-20 animate-pulse
            hidden dark:block">

         
          </div>

      </div>

      <Navbar />

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center 
        text-center px-6 py-28">

        <div className="mb-6">
          <span className="px-4 py-2 rounded-full 
            bg-blue-100 dark:bg-slate-800
            text-blue-600 dark:text-blue-400
            text-sm font-medium tracking-wide
            border border-blue-200 dark:border-slate-700">
            • NOW WITH REAL-TIME ANALYTICS
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="text-slate-900 dark:text-white">
            Short links.
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 
            bg-clip-text text-transparent drop-shadow-lg">
            Big impact.
          </span>
        </h1>

        <p className="text-lg md:text-xl 
          text-slate-600 dark:text-slate-400 
          max-w-2xl mb-12">
          LinkSprint helps you create powerful, trackable short links in seconds.
        </p>

        {/* Proper Component Usage */}
        <URLForm onShorten={handleShorten} />

        {/* Show Result ONLY if shortUrl exists */}
        {shortUrl && <ResultCard shortUrl={shortUrl} />}

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Free to use · No account required · HTTPS secured
        </p>

      </main>

      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}