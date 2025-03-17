import { useEffect, useRef, useState } from "react";
import leaflet from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const mapRef = useRef();
  const [towers, setTowers] = useState([]);

  // Fetch towers from JSON Server
  const fetchTowers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/towers");
      setTowers(response.data);
    } catch (error) {
      console.error("Error fetching towers:", error);
    }
  };
  console.log(towers);
  // Add a new tower to JSON Server
  const addTower = async (latitude, longitude) => {
    const name = prompt("Enter tower name:");
    const details = prompt("Enter tower details:");
    if (name && details) {
      try {
        const response = await axios.post("http://localhost:3001/towers", {
          name,
          details,
          latitude,
          longitude,
        });
        setTowers((prevTowers) => [...prevTowers, response.data]);
      } catch (error) {
        console.error("Error adding tower:", error);
      }
    }
  };

  useEffect(() => {
    // Initialize the map
    mapRef.current = leaflet.map("map").setView([13.0835046, 80.2170575], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapRef.current);

    // Fetch existing towers
    fetchTowers();

    // Add click event to the map
    mapRef.current.on("click", (e) => {
      const { lat: latitude, lng: longitude } = e.latlng;
      addTower(latitude, longitude); // Add tower to JSON Server
    });
  }, []);

  useEffect(() => {
    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof leaflet.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add markers for each tower
    towers.forEach(({ name, details, latitude, longitude }) => {
      leaflet
        .marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(`<b>${name}</b><br>${details}`);
    });
  }, [towers]);

  return <div id="map"></div>;
}
