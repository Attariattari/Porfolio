import React, { useEffect, useState } from "react";
import "./Contact.css";
import { useForm, ValidationError } from "@formspree/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useData } from "../../UseContaxt/Datacontaxt";

function Contact() {
  const { subject, message } = useData();
  console.log(subject);
  console.log(message);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: subject || "",
    message: message || "",
  });
  const [focusedFields, setFocusedFields] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [errors, setErrors] = useState({});
  const [maxRows, setMaxRows] = useState(5);
  const [state, handleSubmitFormspree] = useForm("xpzvwzeq");
  useEffect(() => {
    // Update formData when subject or message changes
    setFormData((prevFormData) => ({
      ...prevFormData,
      subject: subject || "",
      message: message || "",
    }));
  }, [subject, message]);
  useEffect(() => {
    if (state.succeeded) {
      toast.success("Form submitted successfully!");
    } else if (state.errors && state.errors.length > 0) {
      toast.error("Error submitting form. Please try again.");
    }
  }, [state.succeeded, state.errors]);

  const handleChange = (e) => {
    console.log("Changing", e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (field) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field) => {
    if (formData[field].trim() === "") {
      setFocusedFields({ ...focusedFields, [field]: false });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((value) => value.trim() === "")) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      await handleSubmitFormspree(e);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Error submitting form. Please try again.");
    }
  };
  const handleTextareaChange = (e) => {
    const rows = e.target.value.split("\n").length;

    // Set the maximum number of rows to 6
    setMaxRows(rows > 5 ? 6 : rows);

    // Update the form data
    handleChange(e);
  };
  return (
    <div className="Contact">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">CONTACT ME</div>
          <div className="text-lg">Get in touch with me</div>
        </div>
      </div>
      <div className="formarea md:mt-28">
        <div className="contectinfo ">
          <div className="text-3xl text-zinc-800 pb-16">Contact Us.</div>
          <div className="space-y-5">
            <div className="flex space-x-5 text-sm">
              <p className="font-bold">Address:</p>
              <p>Arfa Tower Lahore – Nishtar Town, Lahore</p>
            </div>
            <div className="flex space-x-5 text-sm">
              <p className="font-bold">Email:</p>
              <p>attariattari549@gmail.com</p>
            </div>
            <div className="flex space-x-5 text-sm">
              <p className="font-bold">Phone:</p>
              <p>0322 445-8481</p>
            </div>
            <div className="flex space-x-5 text-sm">
              <p className="font-bold">Address:</p>
              <p>Arfa Tower Lahore – Nishtar Town, Lahore</p>
            </div>
          </div>
        </div>
        <div className="form flex flex-col">
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col items-center w-full submitform"
          >
            <div className="mb-6 relative w-full outline-none">
              <label
                className={`absolute left-4 text-xs transition-all duration-150 ${
                  !focusedFields.name ? "-z-10 top-5" : "top-1"
                }`}
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder={!focusedFields.name ? "Name" : ""}
                className={`w-full outline-none inputbottomborder pt-4 p-5${
                  errors.name ? "border-red-500" : "border-gray-300"
                }  p-4`}
                value={formData.name}
                onChange={handleChange}
                onFocus={() => handleFocus("name")}
                onBlur={() => handleBlur("name", formData.name)}
              />
            </div>
            <div className="mb-6 relative w-full">
              <label
                className={`absolute left-4 text-xs transition-all duration-150 ${
                  !focusedFields.email ? "-z-10 top-5" : "top-1"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder={!focusedFields.email ? "Email" : ""}
                className={`outline-none inputbottomborder pt-4 p-3 w-full ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }  p-2`}
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email", formData.email)}
              />
            </div>
            <div className="mb-6 relative w-full">
              <label
                className={`absolute left-4 text-xs transition-all duration-150 ${
                  !focusedFields.subject ? "-z-10 top-5" : "top-1"
                }`}
              >
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder={!focusedFields.subject ? "subject" : ""}
                className={`outline-none inputbottomborder pt-4 p-3 w-full ${
                  errors.subject ? "border-red-500" : "border-gray-300"
                }  p-2`}
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => handleFocus("subject")}
                onBlur={() => handleBlur("subject", formData.subject)}
              />
            </div>
            <div className="mb-6 relative w-full">
              <label
                className={`absolute left-4 text-xs transition-all duration-150 ${
                  !focusedFields.message ? "-z-10 top-5" : "top-1"
                }`}
              >
                Message
              </label>
              <textarea
                name="message"
                placeholder={!focusedFields.message ? "Message" : ""}
                className={`outline-none inputbottomborder pt-4 p-3 w-full h-32 resize-none ${
                  errors.message ? "border-red-500" : "border-gray-300"
                } p-2`}
                rows={maxRows}
                value={formData.message}
                onChange={handleTextareaChange}
                onFocus={() => handleFocus("message")}
                onBlur={() => handleBlur("message", formData.message)}
              />
              {errors.message && (
                <div className="text-red-500">{errors.message}</div>
              )}
            </div>
            <ToastContainer position="top-right" theme="dark" />
            <button type="submit" className="buttonsub p-2 rounded">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div className="Footer">
        <div>© Copyright 2024. All Rights are Reserved.</div>
      </div>
    </div>
  );
}

export default Contact;
{
  /*      {/* <div className="mapsgettech">
        <div className="maps rounded-xl">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6805.521423332021!2d74.34257200000002!3d31.475768!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919042715f767ad%3A0xb0251034ce47145e!2sARFA%20Tower%2C%20Lahore%20%E2%80%93%20Kasur%20Rd%2C%20Nishtar%20Town%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2sus!4v1704818346002!5m2!1sen!2sus"
            width="100%"
            height="100%"
            className="rounded-xl"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div className="gettech rounded-xl">
          <div className="techtext">Get in Touch.</div>{" "}
          <div>
            <div className="coustmerthanks">
              Excited to hear about your project! Drop me a message, and let's
              turn your ideas into a standout website.
            </div>
          </div>
        </div>
      </div> */
}
