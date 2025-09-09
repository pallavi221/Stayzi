// Make sure dotenv is loaded if using Node
if (typeof window === "undefined") {
  require('dotenv').config();
}

// Get the token from environment variables
const mapToken = process.env.MAP_TOKEN;

// Only run this in the browser
if (typeof window !== "undefined") {
  mapboxgl.accessToken = mapToken;

  // Extract lng and lat safely
  const [lng, lat] = listing.geometry.coordinates;

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lng, lat], // ✅ ensure [lng, lat]
    zoom: 9
  });

  const marker = new mapboxgl.Marker({ color: 'green' })
    .setLngLat([lng, lat]) // ✅ ensure [lng, lat]
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${listing.location}</h4><p>Exact Location provided after booking!</p>`)
        .setMaxWidth("300px")
    )
    .addTo(map);
}

