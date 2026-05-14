import React, { useState } from "react";
import "./Projects.css";
import {
  BankingApp,
  AouponApp,
  fooddeliverwebandmobileapp,
} from "../../../DummyData/DummyData";

const Uxuidesigner = [BankingApp, AouponApp, fooddeliverwebandmobileapp];

function Designer() {
  return (
    <div className="Mernstack">
      <div className="Mernimagesection">
        {Uxuidesigner.map((item, index) => {
          const projectImage = item.img || item.image;
          const projectLink =
            item.Link || item.link || item.Veiwlight || item.VeiwDark;
          const projectCategory = "UX/UI Design";

          return (
            <div key={index} className="Imagecontainer">
              <span className="project-tag">{projectCategory}</span>
              <img src={projectImage} alt={item.title} />
              <div className="imagehovertext">
                <h3>{item.title}</h3>
                <p>
                  Advanced interface design and user experience prototyping.
                </p>
                <a href={projectLink} target="_blank" rel="noopener noreferrer">
                  <button className="merntext">
                    View Project <span>→</span>
                  </button>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Designer;
