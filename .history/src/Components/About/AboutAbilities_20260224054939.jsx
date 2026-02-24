import React from "react";
import "./About.css";
import { FaRocket, FaPalette, FaCode, FaChartLine } from "react-icons/fa";

function AboutAbilities({ typesome, Cursor }) {
  const highlights = [
    {
      icon: <FaRocket />,
      title: "Fast Performance",
      desc: "Optimized, lag-free user experiences across all devices.",
    },
    {
      icon: <FaPalette />,
      title: "Modern Design",
      desc: "Clean, pixel-perfect interfaces that wow users instantly.",
    },
    {
      icon: <FaCode />,
      title: "Clean Code",
      desc: "Scalable and maintainable codebases using best practices.",
    },
    {
      icon: <FaChartLine />,
      title: "SEO Friendly",
      desc: "Search engine optimized structures for maximum visibility.",
    },
  ];

  return (
    <div className="Aboutsomeglassy">
      <div
        className="AboutSomeTitle text-3xl font-black mb-10 tracking-tighter"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        About My <span className="GradientText">Abilities</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {highlights.map((item, index) => (
          <div key={index} className="AbilityCard">
            <span className="AbilityIcon">{item.icon}</span>
            <h3 className="AbilityTitle">{item.title}</h3>
            <p className="AbilityDesc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AboutAbilities;
