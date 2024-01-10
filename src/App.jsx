import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Bar";
import Home from "./Components/Home/Home";
import About from "./Components/About/About";
import Services from "./Components/Services/Services";
import Portfolio from "./Components/Portfolio/Portfolio";
import News from "./Components/News/News";
import Contact from "./Components/Contact/Contact";
const sections = [
  { id: "Home", title: "Home", component: <Home /> },
  { id: "About", title: "About", component: <About /> },
  { id: "Services", title: "Services", component: <Services /> },
  { id: "Portfolio", title: "Portfolio", component: <Portfolio /> },
  { id: "Contact", title: "Contact", component: <Contact /> },
  { id: "News", title: "News", component: <News /> },
];

const App = () => {
  return (
<Router>
      <div className="app">
        <div className="sidebar">
          <Sidebar sections={sections} />
        </div>
        <div className="content">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className={section.id}>
              {section.component}
            </div>
          ))}
        </div>
      </div>
      
    </Router>
  );
};

export default App;