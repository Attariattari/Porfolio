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
        <a
          href="https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/"
          target="_blank"
        >
          <li className="Linkdin">
            <FaLinkedinIn />
          </li>
        </a>
        <a href="https://www.facebook.com/muhyotech" target="_blank">
          <li className="facebook">
            <FaFacebookF />
          </li>
        </a>

        <a href="mailto:attariattari549@gmail.com" target="_blank">
          <li className="gmail">
            <SiGmail />
          </li>
        </a>

        <a href="https://wa.link/p944ry" target="_blank">
          <li className="whatsapp">
            <FaWhatsapp />
          </li>
        </a>

        <a href="https://twitter.com/GhulamMuhyo" target="_blank">
          <li className="twitter">
            <FaXTwitter />
          </li>
        </a>

        <a href="https://www.instagram.com/muhyotech/" target="_blank">
          <li className="instagram">
            <FaInstagram />
          </li>
        </a>
      </ul>
    </div>
  );
}

export default Aboutsocial;
