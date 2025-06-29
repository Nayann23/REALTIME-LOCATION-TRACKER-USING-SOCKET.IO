let socket = io();

// Check if geolocation is supported
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Send location with the socket ID
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

// Initialize the Leaflet map
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data © OpenStreetMap contributors",
}).addTo(map);

// Store the markers by socket ID
const markers = {};

// Listen for location updates from the server
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  if (!markers[id]) {
    // Create a new marker for a new user
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    // Update the existing marker position
    markers[id].setLatLng([latitude, longitude]);
  }

  // Optionally, you can center the map on the current user's location
  if (id === socket.id) {
    map.setView([latitude, longitude]);
  }
});

// Remove the marker when a user disconnects
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    // Remove the marker from the map
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
