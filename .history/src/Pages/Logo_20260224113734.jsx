import { Link } from "react-router-dom";
import Avatar from "react-avatar";

export default function Logo({ show }) {
  return (
    <Link to={"/"} className="flex items-center gap-3 no-underline group">
      <div
        className={`logo-container transition-all duration-500 ${show ? "w-20" : "w-14"}`}
      >
        <img
          src="/muhyo_logo.png"
          alt="MUHYO TECH Logo"
          className="w-full h-auto rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
          style={{
            filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))",
          }}
        />
      </div>
      {show && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white leading-none">
            MUHYO<span className="text-[var(--primary-color)]">TECH</span>
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-500 font-bold">
            Digital Architect
          </span>
        </div>
      )}
    </Link>
  );
}
