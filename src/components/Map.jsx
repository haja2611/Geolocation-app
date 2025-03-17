import { useEffect, useRef, useState } from "react";
import leaflet from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete leaflet.Icon.Default.prototype._getIconUrl;

leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  // useEffect(() => {
  //   fetchTowers();
  // }, [addTower]);

  useEffect(() => {
    // Clear existing layers (markers and polylines)
    mapRef.current.eachLayer((layer) => {
      if (
        layer instanceof leaflet.Marker ||
        layer instanceof leaflet.Polyline
      ) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add markers for each tower
    towers.forEach(({ id, name, details, latitude, longitude }) => {
      const marker = leaflet
        .marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(
          `<b>${name}</b><br>${details}<br><button onclick="window.deleteTower('${id}')">Delete</button>`
        );

      // Add a custom property to the marker to store its ID
      marker.towerId = id;
    });

    // Add polylines to connect all towers
    if (towers.length > 1) {
      const latLngs = towers.map(({ latitude, longitude }) => [
        latitude,
        longitude,
      ]);
      leaflet.polyline(latLngs, { color: "blue" }).addTo(mapRef.current);
    }
  }, [towers]);

  // Expose the deleteTower function to the global scope
  useEffect(() => {
    // Delete a tower from JSON Server
    const deleteTower = async (id) => {
      try {
        await axios.delete(`http://localhost:3001/towers/${id}`);
        setTowers((prevTowers) =>
          prevTowers.filter((tower) => tower.id !== id)
        );
      } catch (error) {
        console.error("Error deleting tower:", error);
      }
    };
    window.deleteTower = deleteTower;
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
}
