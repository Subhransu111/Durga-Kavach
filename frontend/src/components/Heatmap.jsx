import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const Heatmap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Only initialize the map if it hasn't been initialized yet
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([20.8382426, 85.0973949], 6); // Center the map on Odisha

      // Add a base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Fetch data and add heatmap
      fetch('http://localhost:5001/data')
        .then(response => response.json())
        .then(data => {
          const maxIntensity = Math.max(...data.map(item => item.Intensity));
          const heatData = data.map(item => [
            parseFloat(item.Latitude),
            parseFloat(item.Longitude),
            item.Intensity / maxIntensity
          ]);

          L.heatLayer(heatData, {
            radius: 25,
            minOpacity: 0.4,
            gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'red' }
          }).addTo(mapRef.current);
        })
        .catch(error => console.error('Error fetching data:', error));
    }

    // Cleanup function to remove the map if the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100vw' }}></div>;
};

export default Heatmap;