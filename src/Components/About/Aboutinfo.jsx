import React from "react";
import "./About.css";
import { Link } from "react-router-dom";
function Aboutinfo({ typeEffect, Cursor }) {
  return (
    <div className="aboutdetails flex flex-col">
      <div className="AboutDetailsme">
        I'm Muhyo Tech and
        <span style={{ color: "#E3872D", paddingLeft: "5px" }}>
          {typeEffect}
          <Cursor style={{ color: "#E3872D" }} />
        </span>
      </div>
      <div className="aboutwork mt-2">
        Hi! My name is
        <span
          style={{
            color: "#E3872D",
            paddingLeft: "5px",
            fontWeight: "bold",
          }}
        >
          Ghulam Muhyo Din
        </span>
        . I am a{" "}
        <span style={{ color: "#E3872D" }}>
          {typeEffect}
          <Cursor style={{ color: "#E3872D" }} />
        </span>
        , and I'm very passionate and dedicated to my work. With 3 years
        experience as a professional Web developer, I have acquired the skills
        and knowledge necessary to make your project a success. I enjoy every
        step of the design process, from discussion and collaboration to concept
        and execution, but I find the most satisfaction in seeing the finished
        product do everything for you that it was created to do.
      </div>
        <table className="table-fixed mt-4">
          <tbody className="">
            <tr>
              <td>Birthday:</td>
              <td>02/04/2001</td>
              <td>Age:</td>
              <td>23</td>
            </tr>
            <tr>
              <td>City:</td>
              <td>Lahore</td>
              <td>Interests:</td>
              <td>Web Designing</td>
            </tr>
            <tr>
              <td>Study:</td>
              <td>Punjab Uni Of Lahore</td>
              <td>Degree:</td>
              <td>B,sc</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td className="Whatsapp">
                <Link
                  target="_blank"
                  to="mailto:attariattari549@gmail.com"
                  className="leftinfotwo Whatsapp"
                >
                  Attari
                  <span
                    style={{
                      color: "#E3872D",
                    }}
                  >
                    attari
                  </span>
                </Link>
              </td>
              <td>Phone:</td>
              <td>
                <div className="Whatsapp w-40">
                  <Link
                    target="_blank"
                    to="https://wa.link/p944ry"
                    className="leftinfotwo Whatsapp"
                  >
                    0322{" "}
                    <span
                      style={{
                        color: "#E3872D",
                      }}
                    >
                      {" "}
                      445-8481
                    </span>
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  );
}

export default Aboutinfo;
