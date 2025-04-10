import {Navigate} from "react-router-dom";

const ProtectedRoute = ({element, allowedRoles})=>{
  const token=localStorage.getItem("token");
  const role = localStorage.getItem("role") ? localStorage.getItem("role").toLowerCase() : null;

  if(!token){
    return <Navigate to="/login" />;
  }
  if(!role || !allowedRoles.map(r => r.toLowerCase()).includes(role)){
    console.warn(`Access denied. User role: ${role}, Allowed roles: ${allowedRoles}`);
    return <Navigate to="/unauthorized" />;
  }
  return element;
};

export default ProtectedRoute;
