import React, { useState } from "react";
import "./News.css";
import Designing from "./../Portfolio/Myportfolios/Designing";

function News() {
  return (
    <div className="News">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">My Strength</div>
          <div className="text-lg">Check my work strength</div>
        </div>
      </div>
      <div className="strength">
        <div className="firstcard flex justify-center items-center flex-col space-y-5">
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/web-development-5617617-4674328.png"
            alt=""
            style={{
              width: "70px",
              height: "70px",
            }}
          />
          <div className="strenthtext">
            <p className="strenthtitle text-3xl">Web Designing</p>
          </div>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default News;
// {
//   whatisreacta.map((News, index) => (
//     <div className="ServiceBox" key={index}>
//       <div className="Servicesdetails">
//         <div className="Servicesicons shadow-lg ">
//           <img src={News.img} alt="" />
//         </div>
//         <div className="text-md font-bold py-2">{News.title}</div>
//         <div className="Servicesinfo">{News.Introduction}</div>
//       </div>
//       <button onClick={() => handleButtonClick(News)} className="Button mt-3">
//         More info
//       </button>
//     </div>
//   ));
// }
