import "./App.css";
import SidebarNavbar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/UserPages/Homepage";
import About from "./Pages/UserPages/Homelogin";
import Login from "./Pages/Login";
import Home2 from "./Pages/Login";
import Approval from "./Pages/AdminPages/Approval";
function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Sidebar layout */}
        <Route element={<SidebarNavbar />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/Home" element={<Home2 />} />
          <Route path="/Approval" element={<Approval />} />
          {/* Add more nested routes here */}
        </Route>

        {/* Route without sidebar */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
