import React from "react";
import "./About.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./social.css";
import { SiGmail } from "react-icons/si";
function Aboutsocial() {
  return (
    <div className="social">
      <ul className="flex justify-between w-full h-full items-center">
        <div className="social-icon">
          <a
            href="https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/"
            target="_blank"
            data-tip="LinkedIn"
            className="linkedin"
          >
            <FaLinkedinIn />
          </a>
        </div>
        <div className="social-icon">
          <a
            href="https://www.facebook.com/muhyotech"
            target="_blank"
            data-tip="Facebook"
            className="facebook"
          >
            <FaFacebookF />
          </a>
        </div>

        <div className="social-icon">
          <a
            href="mailto:attariattari549@gmail.com"
            target="_blank"
            data-tip="Gmail"
            className="gmail"
          >
            <SiGmail />
          </a>
        </div>

        <div className="social-icon">
          <a
            href="https://wa.link/p944ry"
            target="_blank"
            data-tip="WhatsApp"
            className="whatsapp"
          >
            <FaWhatsapp />
          </a>
        </div>

        <div className="social-icon">
          <a
            href="https://twitter.com/GhulamMuhyo"
            target="_blank"
            data-tip="Twitter"
            className="twitter"
          >
            <FaXTwitter />
          </a>
        </div>

        <div className="social-icon">
          <a
            href="https://www.instagram.com/muhyotech/"
            target="_blank"
            data-tip="Instagram"
            className="instagram"
          >
            <FaInstagram />
          </a>
        </div>
      </ul>
    </div>
  );
}

export default Aboutsocial;
