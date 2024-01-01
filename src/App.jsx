import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Bar";
import Home from "./Components/Home/Home";
import About from "./Components/About/About";
import Services from "./Pages/Services";
import Portfolio from "./Pages/Portfolio";
import News from "./Pages/News";
import Contact from "./Pages/Contact";
const sections = [
  { id: "home", title: "Home", component: <Home /> },
  { id: "about", title: "About", component: <About /> },
  { id: "services", title: "Services", component: <Services /> },
  { id: "portfolio", title: "Portfolio", component: <Portfolio /> },
  { id: "contact", title: "Contact", component: <Contact /> },
  { id: "news", title: "News", component: <News /> },
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