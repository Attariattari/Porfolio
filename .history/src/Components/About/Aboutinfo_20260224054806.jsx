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
} from "react-icons/fa";

function Aboutinfo({ typeEffect, Cursor }) {
  const details = [
    { icon: <FaCalendarAlt />, label: "Birthday", value: "02/04/2001" },
    { icon: <FaUserGraduate />, label: "Age", value: "23" },
    { icon: <FaMapMarkerAlt />, label: "City", value: "Lahore, PK" },
    { icon: <FaCode />, label: "Interests", value: "Web Designing" },
    { icon: <FaGraduationCap />, label: "Study", value: "Punjab University" },
    { icon: <FaUserGraduate />, label: "Degree", value: "B.Sc" },
  ];

  return (
    <div className="aboutdetails">
      <h2 className="AboutDetailsme">
        I'm Muhyo Tech &{" "}
        <span className="typeeffect">
          {typeEffect}
          <Cursor cursorStyle="_" />
        </span>
      </h2>

      <p className="aboutwork">
        Hi! My name is{" "}
        <span className="text-white font-bold">Ghulam Muhyo Din</span>. I am a
        professional{" "}
        <span className="text-indigo-400 font-bold">{typeEffect}</span> with
        over 3 years of experience. I am deeply passionate about creating
        high-quality, scalable, and visually stunning web solutions. From
        initial concept to final execution, I ensure every pixel serves a
        purpose.
      </p>

      {/* Preservation of the grid structure the user likes */}
      <div className="details-grid">
        {details.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-indigo-500 text-xl">{item.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                {item.label}
              </span>
              <span className="text-sm font-bold text-white">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-details flex flex-wrap gap-8 pt-8 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="p-4 bg-white/5 text-indigo-400 rounded-2xl border border-white/10">
            <FaEnvelope />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Email
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
            <FaPhoneAlt />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Phone
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
