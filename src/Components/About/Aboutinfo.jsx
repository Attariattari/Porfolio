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
          <Cursor />
        </span>
      </h2>

      <p className="aboutwork">
        Hi! My name is{" "}
        <span style={{ color: "var(--primary-color)", fontWeight: "700" }}>
          Ghulam Muhyo Din
        </span>
        . I am a professional{" "}
        <span style={{ color: "var(--primary-color)" }}>{typeEffect}</span> with
        over 3 years of experience. I am deeply passionate about creating
        high-quality, scalable, and visually stunning web solutions. From
        initial concept to final execution, I ensure every pixel serves a
        purpose.
      </p>

      <div className="details-grid grid grid-cols-2 gap-y-4 gap-x-8 my-8">
        {details.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-orange-500 text-xl">{item.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-details flex flex-wrap gap-8 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="p-3 bg-orange-50 text-orange-500 rounded-full">
            <FaEnvelope />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Email
            </span>
            <Link
              to="mailto:attariattari549@gmail.com"
              className="text-sm font-semibold hover:text-orange-500 transition-colors"
            >
              attariattari549@gmail.com
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="p-3 bg-blue-50 text-blue-500 rounded-full">
            <FaPhoneAlt />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Phone
            </span>
            <a
              href="tel:+923224458481"
              className="text-sm font-semibold hover:text-blue-500 transition-colors"
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
