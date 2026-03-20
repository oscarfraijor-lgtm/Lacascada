const steps = [
  {
    number: "01",
    title: "We Strategize",
    description:
      "We map out the launch plan from start to finish to give you the highest chance of success on TikTok Shop.",
    color: "#ED2450",
  },
  {
    number: "02",
    title: "We Establish Shop",
    description:
      "We build and optimize your TikTok Shop with social proof to attract customers from Day 1.",
    color: "#E4003B",
  },
  {
    number: "03",
    title: "We Recruit Creators",
    description:
      "We activate 100+ qualified affiliates testing different content styles, messaging, and product promotions.",
    color: "#00C1B2",
  },
  {
    number: "04",
    title: "We Scale",
    description:
      "We leverage initial momentum to scale winning angles and build the growth flywheel for sustained revenue.",
    color: "#FDD811",
  },
  {
    number: "05",
    title: "We Distribute",
    description:
      "We use your Shop's success to boost performance across Meta, Google, Amazon, email, and retail — achieving 30-40% cross-channel lift.",
    color: "#ED2450",
  },
];

export default function Process() {
  return (
    <section id="process" className="py-24 bg-[#010101]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#00C1B2] text-sm font-semibold uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
            OUR <span className="text-[#ED2450]">PROCESS</span>
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#ED2450] via-[#00C1B2] to-[#FDD811] opacity-30" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center lg:text-left">
                  <div
                    className="inline-block font-heading text-7xl lg:text-8xl opacity-20 leading-none mb-2"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl text-white tracking-wide mb-4">
                    {step.title.toUpperCase()}
                  </h3>
                  <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>

                <div className="relative hidden lg:flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center border-2 z-10"
                    style={{
                      borderColor: step.color,
                      backgroundColor: `${step.color}20`,
                    }}
                  >
                    <span
                      className="font-heading text-xl"
                      style={{ color: step.color }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
