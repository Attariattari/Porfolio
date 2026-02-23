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

function Aboutmyprogres() {
  const [progress, setProgress] = useState([0, 0, 0, 0, 0]);
  const targetProgress = [95, 90, 85, 80, 75];
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
  };

  const skills = [
    { label: "Frontend Development", experience: "3+ Years", target: 95 },
    { label: "UI/UX Design", experience: "2 Years", target: 90 },
    { label: "React / Next.js", experience: "3 Years", target: 85 },
    { label: "Node.js / Backend", experience: "2 Years", target: 80 },
    { label: "Graphic Design", experience: "4 Years", target: 75 },
  ];

  return (
    <div id="progress-container" ref={containerRef}>
      <div className="AboutSomeTitle text-2xl font-bold mb-8">
        Knowledge & <span className="GradientText">Expertise</span>
      </div>
      {skills.map((skill, index) => (
        <ProgressBar
          key={index}
          label={skill.label}
          experience={skill.experience}
          progress={progress[index]}
        />
      ))}
    </div>
  );
}

export default Aboutmyprogres;
