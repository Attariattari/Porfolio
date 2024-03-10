import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { GiHadesSymbol } from "react-icons/gi";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./TextSlider.css";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function TextSlider() {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const onAutoplayTimeLeft = (s, time, progress) => {
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };
  return (
    <>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
        }}
        pagination={false}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="mySwiper"
      >
        <SwiperSlide>
          <div className="muhyotext">
            <div className="muhyotextin">
              <div className="Muhyotechicon">
                <GiHadesSymbol />
              </div>
              <p className="Muhyotechtext text-center">
                “Awesome to work with Muhyo. Good organized, easy to communicate
                with, responsive with next iterations.”
              </p>

              <div className="Muhyotechauthor">Muhyo Tech Web Developer</div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="muhyotext">
            <div className="muhyotextin">
              <div className="Muhyotechicon">
                <GiHadesSymbol />
              </div>
              <p className="Muhyotechtext text-center">
                “Muhyo collaboration: Organized, responsive,
                effective—effortless iterations, ensuring successful outcomes.”
              </p>

              <div className="Muhyotechauthor">Muhyo Tech Web Developer</div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="muhyotext">
            <div className="muhyotextin">
              <div className="Muhyotechicon">
                <GiHadesSymbol />
              </div>
              <p className="Muhyotechtext text-center">
                “Partnering with Muhyo: Efficient, communicative, smooth
                iterations—ensuring productive, successful collaboration.”
              </p>

              <div className="Muhyotechauthor">Muhyo Tech Web Developer</div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="muhyotext">
            <div className="muhyotextin">
              <div className="Muhyotechicon">
                <GiHadesSymbol />
              </div>
              <p className="Muhyotechtext text-center">
                “Muhyo teamwork: Organized, responsive, communicative—successful
                outcomes, streamlined iterations, effective collaboration.”
              </p>

              <div className="Muhyotechauthor">Muhyo Tech Web Developer</div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="muhyotext">
            <div className="muhyotextin">
              <div className="Muhyotechicon">
                <GiHadesSymbol />
              </div>
              <p className="Muhyotechtext text-center">
                “Collaborating with Muhyo: Organized, responsive,
                effective—smooth iterations, ensuring successful collaboration
                and outcomes.”
              </p>

              <div className="Muhyotechauthor">Muhyo Tech Web Developer</div>
            </div>
          </div>
        </SwiperSlide>
        <div className="autoplay-progress" slot="container-end">
          <svg viewBox="0 0 48 48" ref={progressCircle}>
            <circle cx="24" cy="24" r="20"></circle>
          </svg>
          <span ref={progressContent}></span>
        </div>
      </Swiper>
    </>
  );
}
