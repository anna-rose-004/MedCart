import React from "react";

const Unauthorized = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Unauthorized Access</h1>
      <p>You don’t have permission to view this page.</p>
      <a href="/login">Go back to Login</a>
    </div>
  );
};

export default Unauthorized;
