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
import HomepageHot from "./Pages/UserPages/HomepageHot";
import HomepageElectric from "./Pages/UserPages/HomepageElectric";
import HomepageNormal from "./Pages/UserPages/HomepageNormal";
import PermitDetails from "./Pages/UserPages/PermitDetails";
import SuperUserPage from "./Pages/UserPages/SuperUserPage";
import MasterData from "./Pages/UserPages/MasterData";
import CompanyMaster from "./Pages/UserPages/CompanyMaster";
import UserMaster from "./Pages/UserPages/UserMaster";
import DepartmentMaster from "./Pages/UserPages/DepartmentMaster";
import WorkLocationMaster from "./Pages/UserPages/WorkLocationMaster";
import AlarmPointMaster from "./Pages/UserPages/AlarmPointMaster";
import DesignationMaster from "./Pages/UserPages/DesignationMaster";
import LocationMaster from "./Pages/UserPages/LocationMaster";


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
            <Route path="/approval/:id" element={<ProtectedRoute><PermitDetails /></ProtectedRoute>} />
            {/* <Route path="/approval/:id" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
            <Route path="/approval2/:id" element={<ProtectedRoute><HeightWorkPermit2 /></ProtectedRoute>} />
            <Route path="/approval3/:id" element={<ProtectedRoute><HeightWorkPermit3 /></ProtectedRoute>} />
            <Route path="/login/requestuser" element={<ProtectedRoute><MyRequests/></ProtectedRoute>} />
            <Route path="/login/superuser" element={<ProtectedRoute><SuperUserPage/></ProtectedRoute>} />
            <Route path="/super/master-data" element={<ProtectedRoute><MasterData/></ProtectedRoute>} />
            <Route path="/login/option" element={<ProtectedRoute><PermitOptions/></ProtectedRoute>} />
            <Route path="/login/requestadmin" element={<ProtectedRoute><MyRequests2 /></ProtectedRoute>} />
            <Route path="/login/requestsuperadmin/:userId" element={<ProtectedRoute><MyRequests3 /></ProtectedRoute>} />
            <Route path="/login/requestsuperadmin/" element={<ProtectedRoute><MyRequests3 /></ProtectedRoute>} />
            <Route path="/homepagehot" element={<ProtectedRoute><HomepageHot /></ProtectedRoute>} />
            <Route path="/homepageelectric" element={<ProtectedRoute><HomepageElectric /></ProtectedRoute>} />
            <Route path="/homepagenormal" element={<ProtectedRoute><HomepageNormal /></ProtectedRoute>} />
            <Route path="/super/companymaster" element={<ProtectedRoute><CompanyMaster /></ProtectedRoute>} />
            <Route path="/super/usermaster" element={<ProtectedRoute><UserMaster /></ProtectedRoute>} />
            <Route path="/super/departmentmaster" element={<ProtectedRoute><DepartmentMaster /></ProtectedRoute>} />
            <Route path="/super/worklocationmaster" element={<ProtectedRoute><WorkLocationMaster /></ProtectedRoute>} />
            <Route path="/super/alarmpointmaster" element={<ProtectedRoute><AlarmPointMaster /></ProtectedRoute>} />
            <Route path="/super/designationmaster" element={<ProtectedRoute><DesignationMaster /></ProtectedRoute>} />
            <Route path="/super/locationmaster" element={<ProtectedRoute><LocationMaster /></ProtectedRoute>} />


          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;