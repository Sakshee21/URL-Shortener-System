import { Zap, BarChart3, Shield } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap size={30} />,
      title: "Instant Shortening",
      desc: "Generate clean short links in milliseconds."
    },
    {
      icon: <BarChart3 size={30} />,
      title: "Real-Time Analytics",
      desc: "Track clicks, devices and performance instantly."
    },
    {
      icon: <Shield size={30} />,
      title: "Secure & Reliable",
      desc: "HTTPS protected with 99.9% uptime."
    }
  ];

  return (
    <section className="py-24 px-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <p className="text-blue-600 font-semibold uppercase tracking-wider">
          Why Choose Us
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-4">
          Everything you need to manage links
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-8 rounded-2xl 
            bg-white/70 dark:bg-slate-800/70
            border border-slate-200 dark:border-slate-700
            hover:shadow-2xl hover:-translate-y-3
            transition-all duration-300"
          >
            <div className="mb-4 text-blue-600 dark:text-blue-400">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}