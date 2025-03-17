import { useState } from "react";
import axios from "axios";

const TowerForm = () => {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setError("");
        },
        (err) => {
          setError("Error getting location: " + err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !details || !latitude || !longitude) {
      alert("Please fill all fields and get your location.");
      return;
    }

    const towerData = {
      name,
      details,
      latitude,
      longitude,
    };

    try {
      await axios.post("http://localhost:3001/towers", towerData);
      alert("Tower added successfully!");
      setName("");
      setDetails("");
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      console.error("Error submitting tower:", error);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="tower-form">
        <div className="form-group">
          <label>Tower Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Tower Details:</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Location (Latitude, Longitude):</label>
          <input
            type="text"
            value={latitude && longitude ? `${latitude}, ${longitude}` : ""}
            readOnly
            className="form-input"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="location-button"
          >
            <i className="fas fa-location-arrow"></i> Get My Location
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default TowerForm;
