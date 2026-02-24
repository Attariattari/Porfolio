import React from "react";
import "./About.css";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaEnvelope,
  FaPhoneAlt,
  FaUserGraduate,
  FaCode,
  FaBriefcase,
} from "react-icons/fa";

function Aboutinfo({ typeEffect, Cursor }) {
  const details = [
    { icon: <FaCalendarAlt />, label: "Born", value: "02 Feb 2001" },
    { icon: <FaMapMarkerAlt />, label: "Location", value: "Lahore, PK" },
    {
      icon: <FaGraduationCap />,
      label: "Education",
      value: "B.Sc (Punjab Univ)",
    },
    { icon: <FaBriefcase />, label: "Experience", value: "3+ Years" },
  ];

  return (
    <div className="aboutdetails">
      <h2 className="AboutDetailsme">
        Ghulam Muhyo Din —{" "}
        <span className="typeeffect">
          {typeEffect}
          <Cursor cursorStyle="_" />
        </span>
      </h2>

      <p className="aboutwork">
        I am a professional{" "}
        <span className="text-white font-bold">{typeEffect}</span> dedicated to
        crafting immersive digital experiences. With a focus on{" "}
        <span className="text-white">user-centric design</span> and
        <span className="text-white"> robust development</span>, I transform
        complex ideas into elegant, efficient solutions that drive growth and
        engagement.
      </p>

      <div className="details-grid grid grid-cols-2 gap-6 my-10">
        {details.map((item, index) => (
          <div key={index} className="flex items-center gap-4 group">
            <span className="text-indigo-500 text-2xl p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              {item.icon}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                {item.label}
              </span>
              <span className="text-sm font-bold text-slate-300">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-details flex flex-wrap gap-8 pt-8 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="p-4 bg-white/5 text-indigo-400 rounded-2xl border border-white/10">
            <FaEnvelope size={20} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Secure Email
            </span>
            <Link
              to="mailto:attariattari549@gmail.com"
              className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
            >
              attariattari549@gmail.com
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="p-4 bg-white/5 text-indigo-400 rounded-2xl border border-white/10">
            <FaPhoneAlt size={20} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Direct Line
            </span>
            <a
              href="tel:+923224458481"
              className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
            >
              +92 322 445 8481
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Aboutinfo;
