import React, { useState, useEffect } from "react";
import "./Notifications.css"; // Import the CSS file
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;

const ViewProfile = () => {
  const [profile, setProfile] = useState({});
  const [basicDetails, setBasicDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const userId = localStorage.getItem("nurse_id"); // Get logged-in nurse ID

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Formats as DD/MM/YYYY
  };
  
  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }
  
    fetch(`${BACKEND_URL}/api/notifications/users/profile/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setBasicDetails(data.profile);
        } else {
          console.error("Profile data is missing:", data);
        }
      })
      .catch((error) => console.error("Error fetching profile:", error.message));
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails({ ...basicDetails, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/users/update-basic-details/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(basicDetails),
      });

      if (response.ok) {
        alert("Details updated successfully!");
        setIsEditing(false);
      } else {
        alert("Failed to update details.");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      alert("An error occurred while updating details.");
    }
  };

  return (
    <div className="view-profile-container">
      <header className="vp-header">
      </header>

      <main className="vp-main">
        {/* Profile Information Section */}
        <section className="profile-section">
          <h2>Profile Information</h2>
          <div className="profile-details">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Department:</strong> {profile.dept || "N/A"}</p>
            <p><strong>Gender:</strong> {profile.gender || "N/A"}</p>
          </div>
        </section>

        {/* Basic Details Section */}
        <section className="basic-details-section">
        {!isEditing && (
          <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
        )}

          <h2>Basic Details</h2>
          <div className="basic-details">
            {isEditing ? (
              <>
                <div>
                  <label>House Name:</label>
                  <input
                    type="text"
                    name="house_name"
                    value={basicDetails.house_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>City:</label>
                  <input
                    type="text"
                    name="city"
                    value={basicDetails.city || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>District:</label>
                  <input
                    type="text"
                    name="district"
                    value={basicDetails.district || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>State:</label>
                  <input
                    type="text"
                    name="state"
                    value={basicDetails.state || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Pincode:</label>
                  <input
                    type="text"
                    name="pincode"
                    value={basicDetails.pincode || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Phone:</label>
                  <input
                    type="text"
                    name="phone"
                    value={basicDetails.phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Birth Date:</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={basicDetails.birth_date || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Experience (Years):</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={basicDetails.experience_years || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="button-top-right">
                  <button onClick={handleUpdate}>Save</button>
                </div>
                <div className="button-bottom-right">
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </>
           ) : (
              <>
                <p><strong>House Name:</strong> {basicDetails.house_name || "N/A"}</p>
                <p><strong>City:</strong> {basicDetails.city || "N/A"}</p>
                <p><strong>District:</strong> {basicDetails.district || "N/A"}</p>
                <p><strong>State:</strong> {basicDetails.state || "N/A"}</p>
                <p><strong>Pincode:</strong> {basicDetails.pincode || "N/A"}</p>
                <p><strong>Phone:</strong> {basicDetails.phone || "N/A"}</p>
                <p><strong>Birth Date:</strong> {formatDate(profile.birth_date)}</p>
                <p><strong>Experience (Years):</strong> {basicDetails.experience_years || "N/A"}</p>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ViewProfile;
