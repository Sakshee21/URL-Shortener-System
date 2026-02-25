export default function StatsSection() {
  const stats = [
    { number: "48M+", label: "Links Shortened" },
    { number: "120M+", label: "Clicks Tracked" },
    { number: "99.9%", label: "Uptime Guarantee" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-8 rounded-2xl 
            bg-white/60 dark:bg-slate-800/60
            backdrop-blur-md
            border border-slate-200 dark:border-slate-700
            hover:shadow-xl hover:-translate-y-2
            transition-all duration-300"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
              {stat.number}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-lg">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}