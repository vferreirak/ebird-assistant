let parsedData = [];
let hotspotsData = [];

// Fetch and parse the taxonomy CSV
fetch('./taxonomy.csv')
  .then(response => response.text())
  .then(csvData => {
    const parsed = Papa.parse(csvData, { header: true }).data;
    parsedData = parsed;

    const comNames = parsed.map(row => row.comName).filter(Boolean);
    const distinctComNames = new Set(comNames);

    const speciesSelect = document.getElementById('species-select');
    distinctComNames.forEach(speciesName => {
      const option = document.createElement('option');
      option.value = speciesName;
      option.textContent = speciesName;
      speciesSelect.appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching the taxonomy CSV:', error));

// Fetch and parse the hotspots CSV
fetch('./best_months_hotspots.csv')
  .then(response => response.text())
  .then(csvData => {
    const parsed = Papa.parse(csvData, { header: true }).data;
    hotspotsData = parsed;
    console.log('Hotspots data loaded:', hotspotsData);  // Verifique se os dados foram carregados corretamente

    // Trigger the update of hotspots after loading the data
    updateHotspots();
  })
  .catch(error => console.error('Error fetching the Hotspots CSV:', error));

// Function to update hotspots when species or month is selected
function updateHotspots() {
  const selectedSpecies = document.getElementById('species-select').value;
  const selectedMonth = document.getElementById('month-select').value;
  const hotspotList = document.getElementById('hotspots-list');

  hotspotList.innerHTML = ''; // Clear previous hotspots

  if (!selectedSpecies || !selectedMonth) {
    console.log('Species or Month is not selected.');  // Log for debugging
    return; // Return if either species or month is not selected
  }

  // Filter hotspots data based on the selected species and month
  const speciesHotspots = hotspotsData.filter(d =>
    d.comName === selectedSpecies && d.Month === selectedMonth
  );

  console.log('Filtered Hotspots:', speciesHotspots);  // Verifique os hotspots filtrados

  // Display hotspots for the selected species and month
  if (speciesHotspots.length > 0) {
    speciesHotspots.forEach(hotspot => {
      const hotspotItem = document.createElement('li');
      hotspotItem.innerHTML = `
        <strong>Hotspot:</strong> ${hotspot.locality}
        <strong>Adjusted Frequency:</strong> ${hotspot.adjusted_frequency}
      `;
      hotspotList.appendChild(hotspotItem);
    });
  } else {
    const noHotspotsMessage = document.createElement('li');
    noHotspotsMessage.textContent = 'No hotspots found for this species in the selected month.';
    hotspotList.appendChild(noHotspotsMessage);
  }
}

// Add event listener to the species select dropdown
document.getElementById('species-select').addEventListener('change', function() {
  const selectedSpecies = this.value;
  const infoBox = document.querySelector('.info-box');

  if (!selectedSpecies) {
    infoBox.innerHTML = `<h3>Taxonomy</h3><p>Please select a species.</p>`;
    return;
  }

  const speciesData = parsedData.filter(d => d.comName === selectedSpecies);
  if (speciesData.length > 0) {
    const info = speciesData[0];
    const sciName = info.sciName || "N/A";
    const familySciName = info.familySciName || "N/A";
    const familyComName = info.familyComName || "N/A";
    const order = info.order || "N/A";

    infoBox.innerHTML = ` 
      <h3>Taxonomy</h3>
      <p><strong>Scientific Name:</strong> ${sciName}</p>
      <p><strong>Family (Scientific):</strong> ${familySciName}</p>
      <p><strong>Family (Common Name):</strong> ${familyComName}</p>
      <p><strong>Order:</strong> ${order}</p>
    `;

    const birdImage = document.getElementById('bird-image');
    birdImage.src = info.birdPhotoUrl || "default-photo.jpg"; // Substitua com a URL da foto real
  }

  // After species is selected, update the hotspots
  updateHotspots();
});

// Add event listener to the month select dropdown
document.getElementById('month-select').addEventListener('change', function() {
  updateHotspots();
});
