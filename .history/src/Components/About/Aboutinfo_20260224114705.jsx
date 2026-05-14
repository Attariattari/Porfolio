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
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday.split("/").reverse().join("-"));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const birthday = "02/04/2001";

  const details = [
    { icon: <FaCalendarAlt />, label: "Birthday", value: birthday },
    {
      icon: <FaUserGraduate />,
      label: "Age",
      value: calculateAge(birthday).toString(),
    },
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

      <div className="details-grid grid grid-cols-2 gap-y-6 gap-x-12 my-10">
        {details.map((item, index) => (
          <div key={index} className="flex items-center gap-4 group">
            <span className="text-indigo-500 text-xl group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                {item.label}
              </span>
              <span className="text-[1.05rem] font-semibold text-slate-200">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-details flex flex-wrap gap-10 pt-8 border-t border-white/5">
        <div className="flex items-center gap-4 group">
          <span className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <FaEnvelope />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Email
            </span>
            <a
              href="mailto:attariattari549@gmail.com"
              className="text-[1.05rem] font-semibold text-slate-200 hover:text-indigo-400 transition-colors"
            >
              attariattari549@gmail.com
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <span className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <FaPhoneAlt />
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Phone
            </span>
            <a
              href="tel:+923224458481"
              className="text-[1.05rem] font-semibold text-slate-200 hover:text-indigo-400 transition-colors"
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
