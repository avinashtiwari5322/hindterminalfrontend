import "./App.css";
import SidebarNavbar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/UserPages/Homepage";
import About from "./Pages/UserPages/Aboutpage";

function App() {
  return (
    <Router>
      <SidebarNavbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* Add more routes here */}
        </Routes>
      </SidebarNavbar>
    </Router>
  );
}

export default App;
