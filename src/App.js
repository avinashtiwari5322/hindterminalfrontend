import "./App.css";
import SidebarNavbar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/UserPages/Homepage";
import About from "./Pages/UserPages/Aboutpage";
import Login from './Pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Sidebar layout */}
        <Route element={<SidebarNavbar />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* Add more nested routes here */}
        </Route>

        {/* Route without sidebar */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
