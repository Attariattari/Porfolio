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
      <div className="firstchild mb-6">
        S{typesome}
        <Cursor />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {highlights.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            <span className="text-2xl text-orange-500 mb-2">{item.icon}</span>
            <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AboutAbilities;
