import React, { useEffect, useState } from "react";
import "./Contact.css";
import { useForm, ValidationError } from "@formspree/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useData } from "../../UseContaxt/Datacontaxt";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

function Contact() {
  const { subject, message } = useData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: subject || "",
    message: message || "",
  });

  const [state, handleSubmitFormspree] = useForm("xpzvwzeq");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subject: subject || "",
      message: message || "",
    }));
  }, [subject, message]);

  useEffect(() => {
    if (state.succeeded) {
      toast.success("Message transmitted successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else if (state.errors && state.errors.length > 0) {
      toast.error("Transmission failed. Please check your signal.");
    }
  }, [state.succeeded, state.errors]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(formData).some((val) => val.trim() === "")) {
      toast.warning("Please complete all transmission fields.");
      return;
    }
    await handleSubmitFormspree(e);
  };

  return (
    <div className="Contact">
      {/* Aurora Section Header */}
      <div className="AboutHeader_modern">
        <div className="HeaderBadge">
          <span className="BadgeLine"></span>
          <span className="BadgeText">GET IN TOUCH</span>
          <span className="BadgeLine"></span>
        </div>
        <h2 className="HeaderTitle">
          Start A <span className="GradientText">Project</span>
        </h2>
        <div className="HeaderDivider">
          <div className="Dot"></div>
          <div className="Line"></div>
          <div className="Dot"></div>
        </div>
      </div>

      <div className="formarea">
        <div className="contectinfo">
          <h1 className="ContactUs">Reach Out.</h1>

          <div className="contact-method-card">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <div>
              <div className="contact-label">Location</div>
              <div className="contact-value">Arfa Tower, Lahore, Pakistan</div>
            </div>
          </div>

          <div className="contact-method-card">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <div>
              <div className="contact-label">Email</div>
              <div className="contact-value">attariattari549@gmail.com</div>
            </div>
          </div>

          <div className="contact-method-card">
            <div className="contact-icon">
              <FaPhoneAlt />
            </div>
            <div>
              <div className="contact-label">Secure Line</div>
              <div className="contact-value">+92 322 445-8481</div>
            </div>
          </div>
        </div>

        <div className="form">
          <form onSubmit={handleFormSubmit}>
            <div className="input-glow-group">
              <input
                type="text"
                name="name"
                id="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label htmlFor="name">Full Name</label>
              <ValidationError
                prefix="Name"
                field="name"
                errors={state.errors}
              />
            </div>

            <div className="input-glow-group">
              <input
                type="email"
                name="email"
                id="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="email">Email Address</label>
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
              />
            </div>

            <div className="input-glow-group">
              <input
                type="text"
                name="subject"
                id="subject"
                placeholder=" "
                value={formData.subject}
                onChange={handleChange}
                required
              />
              <label htmlFor="subject">Subject</label>
            </div>

            <div className="input-glow-group">
              <textarea
                name="message"
                id="message"
                placeholder=" "
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <label htmlFor="message">Message</label>
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
            </div>

            <button
              type="submit"
              className="aurora-submit-btn"
              disabled={state.submitting}
            >
              {state.submitting ? "Transmitting..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />

      <footer className="Footer">
        <div>
          © {new Date().getFullYear()} AURORA DIGITAL. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}

export default Contact;
