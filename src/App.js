import "./App.css";
import SidebarNavbar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/UserPages/Homepage";
import About from "./Pages/UserPages/Aboutpage";

import Login from "./Pages/Login";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* All routes with Sidebar */}
          <Route element={<SidebarNavbar />}>
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/about" element={<About />} />
              {/* Add more protected routes here */}
            </Route>
            {/* Public route with sidebar */}
            <Route path="/" element={<Home />} />
          </Route>
          {/* Public route without sidebar */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
