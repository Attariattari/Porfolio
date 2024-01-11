
// Import necessary dependencies
import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router } from "react-router-dom";

// Import your components
import Portfolio from "./Components/Portfolio/Portfolio";
import Services from "./Components/Services/Services";
import Contact from "./Components/Contact/Contact";
import Sidebar from "./Components/Sidebar/Bar";
import About from "./Components/About/About";
import Home from "./Components/Home/Home";
import News from "./Components/News/News";
import "./App.css";

// Define your sections
const sections = [
  { id: "Home", title: "Home", component: <Home /> },
  { id: "About", title: "About", component: <About /> },
  { id: "Services", title: "Services", component: <Services /> },
  { id: "Portfolio", title: "Portfolio", component: <Portfolio /> },
  { id: "Contact", title: "Contact", component: <Contact /> },
  { id: "News", title: "News", component: <News /> },
];

// Define your App component
const App = () => {
  const currentSectionRef = useRef();

  useEffect(() => {
    // Function to scroll to the desired section
    const scrollToSection = (sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Check if there's a hash in the URL (indicating the desired section)
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash);
    } else {
      // Default to scrolling to the "About" section when no hash is present
      scrollToSection("About");
    }
  }, [currentSectionRef]);

  return (
    <Router>
      <div className="app">
        <div className="sidebar">
          <Sidebar sections={sections} />
        </div>
        <div className="content">
          {sections.map((section) => (
            <div key={section.id} ref={section.id === "Home" ? currentSectionRef : null} id={section.id} className={section.id}>
              {section.component}
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
};

// Export your App component
export default App;

// import { BrowserRouter as Router } from "react-router-dom";
// import Portfolio from "./Components/Portfolio/Portfolio";
// import Services from "./Components/Services/Services";
// import Contact from "./Components/Contact/Contact";
// import Sidebar from "./Components/Sidebar/Bar";
// import About from "./Components/About/About";
// import Home from "./Components/Home/Home";
// import News from "./Components/News/News";
// import "./App.css";
// const sections = [
//   { id: "Home", title: "Home", component: <Home /> },
//   { id: "About", title: "About", component: <About /> },
//   { id: "Services", title: "Services", component: <Services /> },
//   { id: "Portfolio", title: "Portfolio", component: <Portfolio /> },
//   { id: "Contact", title: "Contact", component: <Contact /> },
//   { id: "News", title: "News", component: <News /> },
// ];

// const App = () => {
//   return (
//     <Router>
//       <div className="app">
//         <div className="sidebar">
//           <Sidebar sections={sections} />
//         </div>
//         <div className="content">
//           {sections.map((section) => (
//             <div key={section.id} id={section.id} className={section.id}>
//               {section.component}
//             </div>
//           ))}
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default App;
