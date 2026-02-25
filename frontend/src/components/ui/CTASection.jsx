import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto 
        bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
        rounded-3xl p-16 text-center text-white shadow-2xl
        relative overflow-hidden">

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to simplify your links?
        </h2>

        <p className="text-lg mb-8 opacity-90">
          Join thousands of users shortening smarter.
        </p>

        <Link
          to="/signup"
          className="inline-block px-8 py-4 
          bg-white text-blue-600 font-semibold 
          rounded-xl hover:scale-105 hover:shadow-lg
          transition-all duration-300"
        >
          Create Free Account →
        </Link>
      </div>
    </section>
  );
}