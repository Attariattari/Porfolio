import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./TextSlider.css";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const testimonials = [
  {
    text: "Awesome to work with Muhyo. Good organized, easy to communicate with, responsive with next iterations.",
    author: "James Wilson",
    role: "Senior Web Developer",
    rating: 5,
  },
  {
    text: "Muhyo collaboration: Organized, responsive, effective—effortless iterations, ensuring successful outcomes.",
    author: "Sarah Chen",
    role: "Project Manager",
    rating: 5,
  },
  {
    text: "Partnering with Muhyo: Efficient, communicative, smooth iterations—ensuring productive, successful collaboration.",
    author: "Michael Ross",
    role: "Creative Director",
    rating: 5,
  },
  {
    text: "Muhyo teamwork: Organized, responsive, communicative—successful outcomes, streamlined iterations, effective collaboration.",
    author: "Elena Rodriguez",
    role: "UI/UX Designer",
    rating: 5,
  },
  {
    text: "Collaborating with Muhyo: Organized, responsive, effective—smooth iterations, ensuring successful collaboration and outcomes.",
    author: "David Knight",
    role: "Tech Lead",
    rating: 5,
  },
];

export default function TextSlider() {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);

  const onAutoplayTimeLeft = (s, time, progress) => {
    if (progressCircle.current) {
      progressCircle.current.style.setProperty("--progress", 1 - progress);
    }
    if (progressContent.current) {
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    }
  };

  return (
    <div className="TestimonialSliderContainer">
      <Swiper
        spaceBetween={50}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="testimonialSwiper"
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="testimonialContent">
              <div className="quoteIcon">
                <FaQuoteLeft />
              </div>
              <div className="ratingStars">
                {[...Array(item.rating)].map((_, i) => (
                  <FaStar key={i} className="starIcon" />
                ))}
              </div>
              <p className="testimonialText">{item.text}</p>
              <div className="authorInfo">
                <h4 className="authorName">{item.author}</h4>
                <p className="authorRole">{item.role}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <div className="autoplay-progress" slot="container-end">
          <svg viewBox="0 0 48 48" ref={progressCircle}>
            <circle cx="24" cy="24" r="20"></circle>
          </svg>
          <span ref={progressContent}></span>
        </div>
      </Swiper>
    </div>
  );
}
