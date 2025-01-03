import React, { useEffect, useState, useRef } from "react";
import "./Aboutmyprogres.css";

function ProgressBar({ label, experience, progress }) {
  return (
    <div className="progress">
      <div className="flex justify-between items-center ">
        <div
          className="text-black"
          style={{
            fontSize: "1em",
          }}
        >
          {label} - <span className="text-sm">{experience}</span>
        </div>
        <div className="text-black">{progress}%</div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function Aboutmyprogres() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);
  const [progress4, setProgress4] = useState(0);
  const [progress5, setProgress5] = useState(0);

  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startProgressAnimation();
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const startProgressAnimation = () => {
    const intervals = [
      setInterval(
        () => setProgress1((prev) => (prev < 70 ? prev + 1 : 70)),
        10
      ),
      setInterval(
        () => setProgress2((prev) => (prev < 50 ? prev + 1 : 50)),
        10
      ),
      setInterval(
        () => setProgress3((prev) => (prev < 80 ? prev + 1 : 80)),
        10
      ),
      setInterval(
        () => setProgress4((prev) => (prev < 60 ? prev + 1 : 60)),
        10
      ),
      setInterval(
        () => setProgress5((prev) => (prev < 90 ? prev + 1 : 90)),
        10
      ),
    ];

    intervals.forEach((interval) => {
      setTimeout(() => clearInterval(interval), 2000); // Clear intervals after 2 seconds
    });
  };

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.observe(
        document.getElementById("progress-container")
      );
    }
  }, []);

  return (
    <div id="progress-container">
      <ProgressBar
        label="Full Stack Developer"
        experience="2 Years"
        progress={progress1}
      />
      <ProgressBar
        label="Front-end Developer"
        experience="1 Year"
        progress={progress2}
      />
      <ProgressBar
        label="Backend Developer"
        experience="3 Years"
        progress={progress3}
      />
      <ProgressBar
        label="UI/UX Designer"
        experience="2 Years"
        progress={progress4}
      />
      <ProgressBar
        label="DevOps Engineer"
        experience="1 Year"
        progress={progress5}
      />
    </div>
  );
}

export default Aboutmyprogres;
