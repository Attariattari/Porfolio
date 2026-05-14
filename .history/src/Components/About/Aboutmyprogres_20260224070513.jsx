import React, { useEffect, useState, useRef } from "react";
import "./Aboutmyprogres.css";

function ProgressBar({ label, experience, progress }) {
  return (
    <div className="progress">
      <div className="progress-info">
        <div className="progress-label">
          {label} <span className="progress-experience">• {experience}</span>
        </div>
        <div className="progress-percentage">{progress}%</div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function CircularProgress({ label, progress, color }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-item">
      <div className="svg-container">
        <svg className="circular-svg" width="80" height="80">
          <circle
            className="circular-bg"
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="6"
          />
          <circle
            className="circular-bar"
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={color || "var(--primary-color)"}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="circular-percentage">{progress}%</div>
      </div>
      <div className="circular-label">{label}</div>
    </div>
  );
}

function Aboutmyprogres() {
  const [progress, setProgress] = useState([0, 0, 0, 0, 0]);
  const [circularProgress, setCircularProgress] = useState([0, 0, 0]);
  const targetProgress = [95, 90, 85, 80, 75];
  const targetCircular = [92, 98, 88];
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const startAnimation = () => {
    // Animate linear bars
    targetProgress.forEach((target, index) => {
      let current = 0;
      const interval = setInterval(() => {
        if (current >= target) {
          clearInterval(interval);
        } else {
          current += 1;
          setProgress((prev) => {
            const next = [...prev];
            next[index] = current;
            return next;
          });
        }
      }, 15);
    });

    // Animate circular bars
    targetCircular.forEach((target, index) => {
      let current = 0;
      const interval = setInterval(() => {
        if (current >= target) {
          clearInterval(interval);
        } else {
          current += 1;
          setCircularProgress((prev) => {
            const next = [...prev];
            next[index] = current;
            return next;
          });
        }
      }, 20);
    });
  };

  const skills = [
    { label: "Frontend Development", experience: "3+ Years", target: 95 },
    { label: "UI/UX Design", experience: "2 Years", target: 90 },
    { label: "React / Next.js", experience: "3 Years", target: 85 },
    { label: "Node.js / Backend", experience: "2 Years", target: 80 },
    { label: "Graphic Design", experience: "4 Years", target: 75 },
  ];

  const circularSkills = [
    { label: "Leadership", target: 92, color: "var(--primary-color)" },
    { label: "Teamwork", target: 98, color: "#10b981" },
    { label: "Creativity", target: 88, color: "#f59e0b" },
  ];

  return (
    <div className="Aboutchartsglassy" ref={containerRef}>
      <div className="AboutSomeTitle text-2xl font-bold mb-8">
        Knowledge & <span className="GradientText">Expertise</span>
      </div>

      <div className="progress-list">
        {skills.map((skill, index) => (
          <ProgressBar
            key={index}
            label={skill.label}
            experience={skill.experience}
            progress={progress[index]}
          />
        ))}
      </div>

      <div className="professional-stats">
        <div className="StatsTitle">Professional Skills</div>
        <div className="circular-progress-container">
          {circularSkills.map((skill, index) => (
            <CircularProgress
              key={index}
              label={skill.label}
              progress={circularProgress[index]}
              color={skill.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Aboutmyprogres;
