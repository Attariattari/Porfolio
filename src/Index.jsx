import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import Showfulldetails from "./Components/Services/Showfulldetails";

function Index() {

  return (
    <div className="index bg-gray-50">
          <BrowserRouter>
            <Routes>
    
         <Route path="/fullinfo" element={<Showfulldetails/>}/>
            </Routes>
          </BrowserRouter>
    </div>
  );
}

export default Index;
