import React from "react";
import "./Portfolio.css";

function Portfolio() {
  return (
    <div className="Portfolio">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">CREATIVE WORKS</div>
          <div className="text-lg">Check out our latest creative works</div>
        </div>
      </div>
      <div className="ProtfolioSection">
        <div className="ProtfolioButtons">
          <button className="Buttonfor">All Show</button>
          <button className="Buttonfor">Mern Stack</button>
          <button className="Buttonfor">UX / UI Designing</button>
          <button className="Buttonfor">Backend Projects</button>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
