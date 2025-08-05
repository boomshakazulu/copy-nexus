import React from "react";

const features = [
  {
    title: "COPIERS",
    icon: "/copier-icon.png",
    description:
      "Lorem ipsum dolor ag met, consectetuer adipiscing eli. Augdet quam ult amet.",
  },
  {
    title: "TONER",
    icon: "/toner-icon.png",
    description:
      "Lorem ipsum dolor amet, consectetuer adipiscing. Augdet quam ult amet.",
  },
  {
    title: "PARTS",
    icon: "/parts-icon.png",
    description:
      "Lorem ipsum dolor amet, consectetuer adipiscing. Augide quam ult ame.",
  },
];

export default function HomePage() {
  return (
    <div className="px-4 max-w-3xl mx-auto">
      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-start justify-between gap-8 mb-16">
        {/* Text */}
        <div className="text-center text-left flex-1">
          <h1 className="text-7xl font-bold text-[#00294D] leading-tight text-left">
            COPIER
          </h1>
          <h1 className="text-7xl font-bold text-[#00294D] leading-tight text-left">
            STORE
          </h1>
          <p className="text-3xl mt-2 text-red-600 font-semibold text-left">
            Copier Rentals & Sales
          </p>
        </div>

        {/* Image */}
        <div className="bg-yellow-400 p-4 rounded-md flex-1 max-w-xs">
          <img
            src="/copier.png"
            alt="Copier"
            className="w-full h-auto max-h-70 object-contain mx-auto scale-x-[-1]"
          />
        </div>
      </section>

      {/* PRODUCT FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <img
              src={feature.icon}
              alt={feature.title}
              className="h-20 mx-auto mb-4"
            />
            <h3 className="text-lg font-bold text-[#00294D] uppercase">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
