let parsedData = [];

// Fetch and parse the CSV
fetch('../taxonomy.csv')
  .then(response => response.text())
  .then(csvData => {
    const parsed = Papa.parse(csvData, { header: true }).data;

    // Store the data globally for later use
    parsedData = parsed;

    // Extract comNames
    const comNames = parsed.map(row => row.comName).filter(Boolean);
    const distinctComNames = new Set(comNames);

    // Populate the dropdown
    const speciesSelect = document.getElementById('species-select');
    distinctComNames.forEach(speciesName => {
      const option = document.createElement('option');
      option.value = speciesName;
      option.textContent = speciesName;
      speciesSelect.appendChild(option);
    });

    // Count distinct species
    const count = distinctComNames.size;
    document.getElementById('stats-output').textContent = 
      `There are ${count} distinct comNames in the taxonomy file.`;
  })
  .catch(error => {
    console.error('Error fetching the CSV:', error);
    document.getElementById('stats-output').textContent = 
      'Error loading data. Check console for details.';
  });

// Add an event listener to detect species selection changes
document.getElementById('species-select').addEventListener('change', function() {
  const selectedSpecies = this.value;

  // Clear taxonomy info if no species is selected
  if (!selectedSpecies) {
    document.querySelector('.info-box').innerHTML = `
      <h3>Taxonomy</h3>
      <p>Please select a species.</p>
    `;
    return;
  }

  // Filter the CSV data for the selected species
  const speciesData = parsedData.filter(d => d.comName === selectedSpecies);

  // Assume we only need the first match (or that comName is unique)
  if (speciesData.length > 0) {
    const info = speciesData[0];
    const sciName = info.sciName || "N/A";
    const familySciName = info.familySciName || "N/A";
    const familyComName = info.familyComName || "N/A";
    const order = info.order || "N/A";

    document.querySelector('.info-box').innerHTML = `
      <h3>Taxonomy</h3>
      <p><strong>Scientific Name:</strong> ${sciName}</p>
      <p><strong>Family (Scientific):</strong> ${familySciName}</p>
      <p><strong>Family (Common Name):</strong> ${familyComName}</p>
      <p><strong>Order:</strong> ${order}</p>
    `;
  } else {
    document.querySelector('.info-box').innerHTML = `
      <h3>Taxonomy</h3>
      <p>No data found for this species.</p>
    `;
  }
});
