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
  const [progress, setProgress] = useState(new Array(8).fill(0));
  const targetProgress = [98, 92, 88, 85, 90, 78, 82, 75];
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
    { label: "Frontend Development", experience: "3+ Years", target: 98 },
    { label: "UI/UX & Web Design", experience: "2 Years", target: 92 },
    { label: "React & Next.js", experience: "3 Years", target: 88 },
    { label: "Node.js & Backend", experience: "2 Years", target: 85 },
    { label: "Graphic Designing", experience: "4 Years", target: 90 },
    { label: "E-commerce Solutions", experience: "2 Years", target: 78 },
    { label: "Mobile App Development", experience: "1.5 Years", target: 82 },
    { label: "SEO & Digital Marketing", experience: "2.5 Years", target: 75 },
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
    </div>
  );
}

export default Aboutmyprogres;
