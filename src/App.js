import "./App.css";
import SidebarNavbar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/UserPages/Homepage";
import About from "./Pages/UserPages/Homelogin";
import Login from "./Pages/Login";
import Home2 from "./Pages/Login";
import HeightWorkPermit2 from "./Pages/UserPages/Homepage3";
import Approval from "./Pages/AdminPages/Approval";
import ProtectedRoute from "./ProtectedRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeightWorkPermit3 from "./Pages/UserPages/Homepage4";
import MyRequests from "./Pages/AdminPages/Approval";
import MyRequests2 from "./Pages/AdminPages/Myrequest2";
import MyRequests3 from "./Pages/AdminPages/Myrequest3";
import PermitOptions from "./Pages/UserPages/Option";
import ViewPermit from "./Pages/UserPages/ViewPermit";
import { AuthProvider } from "./AuthContext"; // Make sure this import exists

function App() {
  return (
    <AuthProvider>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      <Router>
        <Routes>
          {/* Login routes WITHOUT sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          
          {/* Routes WITH Sidebar layout */}
          <Route element={<SidebarNavbar />}>
            <Route path="/about/:userId" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/ViewPermit/:id" element={<ProtectedRoute><ViewPermit /></ProtectedRoute>} />
            <Route path="/Home" element={<ProtectedRoute><Home2 /></ProtectedRoute>} />
            <Route path="/Approval" element={<ProtectedRoute><Approval /></ProtectedRoute>} />
            <Route path="/approval/:id" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/approval2/:id" element={<ProtectedRoute><HeightWorkPermit2 /></ProtectedRoute>} />
            <Route path="/approval3/:id" element={<ProtectedRoute><HeightWorkPermit3 /></ProtectedRoute>} />
            <Route path="/login/requestuser" element={<ProtectedRoute><MyRequests/></ProtectedRoute>} />
            <Route path="/login/option" element={<ProtectedRoute><PermitOptions/></ProtectedRoute>} />
            <Route path="/login/requestadmin" element={<ProtectedRoute><MyRequests2 /></ProtectedRoute>} />
            <Route path="/login/requestsuperadmin/:userId" element={<ProtectedRoute><MyRequests3 /></ProtectedRoute>} />
            <Route path="/login/requestsuperadmin/" element={<ProtectedRoute><MyRequests3 /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;