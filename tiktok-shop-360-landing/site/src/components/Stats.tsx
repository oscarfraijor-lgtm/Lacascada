const stats = [
  {
    number: "100+",
    label: "Brands Managed",
    description: "Across Mexico & the United States",
  },
  {
    number: "500+",
    label: "Affiliates Activated",
    description: "Qualified creators driving sales daily",
  },
  {
    number: "30-40%",
    label: "Cross-Channel Lift",
    description: "Average performance boost on Meta, Google & Amazon",
  },
  {
    number: "24/7",
    label: "Content Machine",
    description: "Non-stop content creation & optimization",
  },
];

export default function Stats() {
  return (
    <section className="relative bg-white py-16 -mt-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#ED2450] mb-2 tracking-wide">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#010101] uppercase tracking-wider mb-1">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-light">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
