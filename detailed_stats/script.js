let parsedData = [];
let bestMonthsData = [];

// Fetch and parse the taxonomy CSV
fetch('../taxonomy.csv')
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

    // Now load the best_months_hotspots CSV
    loadBestMonthsData();
  })
  .catch(error => {
    console.error('Error fetching taxonomy.csv:', error);
    document.getElementById('stats-output').textContent = 
      'Error loading taxonomy data. Check console for details.';
  });

function loadBestMonthsData() {
  fetch('../best_months_hotspots.csv')
    .then(response => response.text())
    .then(csvData => {
      const parsed = Papa.parse(csvData, { header: true }).data;

      // We expect these columns: comName, Month, locality, adjusted_frequency
      // Filter out empty rows if any
      bestMonthsData = parsed.filter(d => d.comName && d.Month && d.locality && d.adjusted_frequency);
    })
    .catch(error => {
      console.error('Error fetching best_months_hotspots.csv:', error);
      document.getElementById('stats-output').textContent = 
        'Error loading hotspots data. Check console for details.';
    });
}

// Listen for species changes
document.getElementById('species-select').addEventListener('change', function() {
  const selectedSpecies = this.value;

  // Update taxonomy box
  if (!selectedSpecies) {
    document.querySelector('.info-box').innerHTML = `
      <h3>Taxonomy</h3>
      <p>Please select a species.</p>
    `;
    document.getElementById('stats-output').textContent = '';
    return;
  }

  const speciesData = parsedData.filter(d => d.comName === selectedSpecies);
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

  // Update the Results box with data from best_months_hotspots.csv
  updateResults(selectedSpecies);
});

function updateResults(selectedSpecies) {
  // Filter bestMonthsData by the selected species
  const filtered = bestMonthsData.filter(d => d.comName === selectedSpecies);

  // Sort by Month, then by adjusted_frequency
  // If Month is a string like "January", map month names to a numeric index:
  const monthOrder = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  filtered.sort((a, b) => {
    const monthA = monthOrder.indexOf(a.Month) === -1 ? 999 : monthOrder.indexOf(a.Month);
    const monthB = monthOrder.indexOf(b.Month) === -1 ? 999 : monthOrder.indexOf(b.Month);

    if (monthA !== monthB) return monthA - monthB;
    // If months are the same, sort by frequency descending
    return parseFloat(b.adjusted_frequency) - parseFloat(a.adjusted_frequency);
  });

  const statsOutput = document.getElementById('stats-output');

  if (filtered.length === 0) {
    statsOutput.textContent = "No hotspot data available for this species.";
    return;
  }

  let html = `<table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="border-bottom:1px solid #ccc;">
        <th style="text-align:left;padding:5px;">Month</th>
        <th style="text-align:left;padding:5px;">Locality</th>
        <th style="text-align:left;padding:5px;">Adjusted Frequency</th>
      </tr>
    </thead>
    <tbody>`;

  filtered.forEach(row => {
    html += `<tr>
      <td style="padding:5px;">${row.Month}</td>
      <td style="padding:5px;">${row.locality}</td>
      <td style="padding:5px;">${row.adjusted_frequency}</td>
    </tr>`;
  });

  html += `</tbody></table>`;

  statsOutput.innerHTML = html;
}
