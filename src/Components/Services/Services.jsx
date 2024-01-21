import React, { useEffect, useState } from "react";
import "./Services.css";
import {
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  SEO,
} from "../../DummyData/DummyData";
import Servicepopup from "./Servicepopup";
import AOS from 'aos';
import 'aos/dist/aos.css';
const servicesData = [
  Webdeveloper,
  Uxuidesigner,
  Backenddeveloper,
  Branding,
  SocialMedia,
  SEO,
];

function Services() {
  const [selectedService, setSelectedService] = useState(null);

  const handleButtonClick = (service) => {
    setSelectedService(service);
  };

  const closePopup = () => {
    setSelectedService(null); // Update to set the selectedService to null
  };
 useEffect(() => {
  AOS.init({
    duration: 1000, // Animation duration in milliseconds
    offset: 200,    // Offset (in pixels) from the top of the screen
    // other configuration options...
  });
}, []);
  return (
    <div className="Services">
      <div className="Servicesabout">
        <div className="Servicesborder">
          <div className="text-zinc-800 Servicestext">AMAZING SERVICES</div>
          <div className="text-lg">Meet our amazing services</div>
        </div>
      </div>
      <div className="Servicessection">
        {servicesData.slice(0, 6).map((service, index) => (
          <div className="ServiceBox" key={index}>
            <div className="Servicesdetails">
              <img src={service.img} alt="" />
              <div className="Serviceslabel">{service.title}</div>
              <div className="Servicesinfo">{service.details}</div>
            </div>
            <button
              onClick={() => handleButtonClick(service)}
              className=" mt-3"
            >
              More info
            </button>
          </div>
        ))}
      </div>
      <Servicepopup info={selectedService} closePopup={closePopup} />
    </div>
  );
}

export default Services;
// import React, { useState } from "react";
// import "./Services.css";
// import {
//   Webdeveloper,
//   Uxuidesigner,
//   Backenddeveloper,
//   Branding,
//   SocialMedia,
//   SEO,
// } from "../../DummyData/DummyData";
// const servicesData = [
//   Webdeveloper,
//   Uxuidesigner,
//   Backenddeveloper,
//   Branding,
//   SocialMedia,
//   SEO,
// ];

// function Services() {
//   const [selectedService, setSelectedService] = useState(null);
//   const [showList, setShowList] = useState(true);

//   const handleButtonClick = (service) => {
//     setSelectedService(service);
//     setShowList(false);
//   };

//   const closePopup = () => {
//     setSelectedService(null);
//     setShowList(true);
//   };
//   return (
//     <div className="Services">
//       <div className="Servicesabout">
//         <div className="Servicesborder">
//           <div className="text-zinc-800 Servicestext">AMAZING SERVICES</div>
//           <div className="text-lg">Meet our amazing services</div>
//         </div>
//       </div>

//       <div className="Servicessection">
//         {showList &&
//           servicesData.slice(0, 6).map((service, index) => (
//             <div className="ServiceBox" key={index}>
//               <div className="Servicesdetails">
//                 <img src={service.img} alt="" />
//                 <div className="Serviceslabel">{service.title}</div>
//                 <div className="Servicesinfo">{service.details}</div>
//               </div>
//               <button
//                 onClick={() => handleButtonClick(service)}
//                 className="Button mt-3"
//               >
//                 More info
//               </button>
//             </div>
//           ))}
//       </div>
//       {selectedService && (
//         <div className="merndetails">
//           <div className="detailsmern">
//             <div className="detailsone">
//               <p className="titletwo">{selectedService.titletwo}</p>
//               <p className="pt-4 font-bold">{selectedService.titlethree}</p>
//               <p className="pt-8 font-bold">{selectedService.about}</p>
//               <span className="flex justify-center items-center buttonget">
//                 <button className="projectstartecd">
//                   {selectedService.button}
//                 </button>
//               </span>
//             </div>
//             <div className="backgroundimage">
//               <img src={selectedService.background} alt="" />
//             </div>
//           </div>
//           <div className="detailsveiw">
//             <div className="p-3 one">
//               {selectedService.details}
//             </div>
//             <div className="p-3 two">
//               {selectedService.detailstwo}
//             </div>
//             <div className="p-3 three">
//               {selectedService.detailsthree}
//             </div>
//             <div className="p-3 four">
//               {selectedService.detailsfour}
//             </div>
//           </div>
//           <div className="flex justify-center items-center mt-4 underline">
//             <div className="mt-3 p-3 font-bold">{selectedService.forhair}</div>
//           </div>
//           <div className="popbuttonstwo">
//             <button className="Button mt-3">{selectedService.button}</button>
//             <button onClick={closePopup} className="Button mt-3">
//               Go Back
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Services;

