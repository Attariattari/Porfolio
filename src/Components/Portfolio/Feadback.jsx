import React, { useState, useEffect, useRef } from 'react';

const CounterComponent = ({ targetValue }) => {
  const [count, setCount] = useState(0);
  const duration = 2000; // 2 seconds
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 } // Adjust the threshold as needed
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = timestamp - startTime;
      const increment = (progress / duration) * targetValue;

      if (increment < targetValue) {
        setCount(Math.floor(increment));
        requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div ref={sectionRef}>
      <p>{count}</p>
      
    </div>
  );
};

export default CounterComponent;