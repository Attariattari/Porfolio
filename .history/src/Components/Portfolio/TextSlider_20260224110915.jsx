import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "./TextSlider.css";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

const testimonials = [
  {
    text: "Awesome to work with Muhyo. Good organized, easy to communicate with, responsive with next iterations. Highly recommended for complex web projects.",
    author: "James Wilson",
    role: "Senior Web Developer",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=james",
  },
  {
    text: "Muhyo collaboration: Organized, responsive, effective—effortless iterations, ensuring successful outcomes. The attention to detail is truly impressive.",
    author: "Sarah Chen",
    role: "Project Manager @TechScale",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    text: "Partnering with Muhyo: Efficient, communicative, smooth iterations—ensuring productive, successful collaboration. A true professional in every sense.",
    author: "Michael Ross",
    role: "Creative Director",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
  {
    text: "Muhyo teamwork: Organized, responsive, communicative—successful outcomes, streamlined iterations, effective collaboration. Exceeded all expectations.",
    author: "Elena Rodriguez",
    role: "UI/UX Designer",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=elena",
  },
  {
    text: "Collaborating with Muhyo: Organized, responsive, effective—smooth iterations, ensuring successful collaboration and outcomes. Will work again!",
    author: "David Knight",
    role: "Tech Lead",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=david",
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
        effect={"fade"}
        spaceBetween={30}
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
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="testimonialSwiper"
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="testimonialGlassCard">
              <div className="cardTop">
                <div className="quoteCircle">
                  <FaQuoteLeft />
                </div>
                <div className="ratingGroup">
                  {[...Array(item.rating)].map((_, i) => (
                    <FaStar key={i} className="starIcon" />
                  ))}
                </div>
              </div>

              <p className="testimonialText">"{item.text}"</p>

              <div className="authorWrapper">
                <div className="avatarContainer">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="authorAvatar"
                  />
                </div>
                <div className="authorDetails">
                  <h4 className="authorName">{item.author}</h4>
                  <span className="authorRole">{item.role}</span>
                </div>
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
