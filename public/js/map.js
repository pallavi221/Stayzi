mapboxgl.accessToken = mapToken;  // ✅ comes from EJS (in show.ejs)

const [lng, lat] = listing.geometry.coordinates;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [lng, lat],
  zoom: 9
});

new mapboxgl.Marker({ color: 'green' })
  .setLngLat([lng, lat])
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h4>${listing.location}</h4><p>Exact Location provided after booking!</p>`)
  )
  .addTo(map);


