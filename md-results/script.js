document.addEventListener('DOMContentLoaded', function() {
    const csvData = `jurisdiction,harris,trump,oliver,stein,kennedy,others,total
Allegany,9231,22141,130,136,363,136,32137
Anne Arundel,171945,128892,2141,2429,3375,2790,311572
Baltimore City,195109,27984,892,3222,1875,1672,230754
Baltimore County,249958,149560,2240,4195,3858,3104,412915
Calvert,23438,29361,297,232,554,309,54191
Caroline,4860,11053,84,99,180,54,16330
Carroll,36867,62273,845,629,1182,855,102651
Cecil,17628,33871,291,286,536,219,52831
Charles,63454,26145,334,828,889,447,92097
Dorchester,6954,9390,57,138,191,42,16772
Frederick,82409,68753,970,1378,1494,1110,156114
Garrett,3456,11983,75,48,223,53,15838
Harford,62453,83050,1023,935,1559,1070,150090
Howard,124764,49425,1246,3341,1712,1803,182291
Kent,5251,5561,60,82,114,60,11128
Montgomery,386581,112637,2416,8009,4276,5302,519221
Prince George's,347038,45008,1038,5369,3428,2128,404009
Queen Anne's,11273,20200,174,153,336,211,32347
Saint Mary's,23531,33582,409,352,669,411,58954
Somerset,4054,5805,32,85,114,47,10137
Talbot,11119,11125,109,120,194,163,22830
Washington,27260,44054,363,513,811,331,73332
Wicomico,21513,24065,205,371,544,214,46912
Worcester,12431,19632,139,184,342,153,32881`;

    const statewideTableBody = document.getElementById('statewide-table-body');
    const countySelect = document.getElementById('county-select');
    const countyTableBody = document.getElementById('county-table-body');
    const statewideChartCanvas = document.getElementById('statewide-chart').getContext('2d'); // Get chart context
    const countyChartCanvas = document.getElementById('county-chart').getContext('2d'); // Get chart context

    let statewideChart = null;
    let countyChart = null;

    // Function to parse CSV data
    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const entry = {};
            for (let j = 0; j < headers.length; j++) {
                entry[headers[j]] = values[j];
            }
            data.push(entry);
        }
        return data;
    }

    const data = parseCSV(csvData);

    // Function to capitalize the first letter of each word
    function toTitleCase(str) {
        return str.toLowerCase().split(' ').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }

    // Calculate statewide totals
    function calculateStatewideTotals(data) {
        const candidates = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];
        const statewideTotals = {};

        candidates.forEach(candidate => {
            statewideTotals[candidate] = data.reduce((sum, row) => sum + parseInt(row[candidate]), 0);
        });

        const totalVotes = data.reduce((sum, row) => sum + parseInt(row['total']), 0);

        return { totals: statewideTotals, totalVotes: totalVotes };
    }

    const statewideResults = calculateStatewideTotals(data);
    const statewideTotals = statewideResults.totals;
    const totalVotes = statewideResults.totalVotes;

    const candidateDisplayNames = {
        harris: 'Harris',
        trump: 'Trump',
        oliver: 'Oliver',
        stein: 'Stein',
        kennedy: 'Kennedy',
        others: 'Others'
    };

    // Display statewide results
    function displayStatewideResults(totals, totalVotes) {
        statewideTableBody.innerHTML = ''; // Clear existing table rows

        const candidateLabels = [];
        const candidateVoteCounts = [];

        for (const candidate in totals) {
            const votes = totals[candidate];
            const percentage = ((votes / totalVotes) * 100).toFixed(2);
            const candidateName = candidateDisplayNames[candidate]; // Get formatted name

            const row = document.createElement('tr');
            row.innerHTML = `<td>${toTitleCase(candidateName)}</td><td>${votes}</td><td>${percentage}%</td>`;
            statewideTableBody.appendChild(row);

            candidateLabels.push(toTitleCase(candidateName));
            candidateVoteCounts.push(votes);
        }
        // Destroy existing chart if it exists
        if (statewideChart) {
            statewideChart.destroy();
        }
        // Create chart
        statewideChart = new Chart(statewideChartCanvas, {
            type: 'bar',
            data: {
                labels: candidateLabels,
                datasets: [{
                    label: 'Votes', // Removed label from dataset
                    data: candidateVoteCounts,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',   // Blue with slight transparency
                        'rgba(255, 99, 132, 0.8)',    // Red with slight transparency
                        'rgba(255, 206, 86, 0.8)',    // Yellow with slight transparency
                        'rgba(75, 192, 192, 0.8)',    // Green with slight transparency
                        'rgba(153, 102, 255, 0.8)',   // Purple with slight transparency
                        'rgba(255, 159, 64, 0.8)'     // Orange with slight transparency
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',     // Solid blue
                        'rgba(255, 99, 132, 1)',      // Solid red
                        'rgba(255, 206, 86, 1)',      // Solid yellow
                        'rgba(75, 192, 192, 1)',      // Solid green
                        'rgba(153, 102, 255, 1)',     // Solid purple
                        'rgba(255, 159, 64, 1)'       // Solid orange
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 10,
                        bottom: 10
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend (since we have a title)
                    },
                    title: {
                        display: true,
                        text: 'Statewide Vote Counts',
                        font: {
                            size: 16   // Adjust font size
                        }
                    }
                }
            }
        });
    }

    displayStatewideResults(statewideTotals, totalVotes);

    // Populate county dropdown
    function populateCountyDropdown(data) {
        data.forEach(row => {
            const option = document.createElement('option');
            option.value = row.jurisdiction;
            option.textContent = row.jurisdiction;
            countySelect.appendChild(option);
        });
    }

    populateCountyDropdown(data);

    // Handle county selection
    countySelect.addEventListener('change', function() {
        const selectedCounty = countySelect.value;
        displayCountyResults(selectedCounty, data);
    });

    // Display county results
    function displayCountyResults(county, data) {
        countyTableBody.innerHTML = ''; // Clear previous results
        if (!county) return;

        const countyData = data.find(row => row.jurisdiction === county);
        if (!countyData) return;

        const candidates = ['harris', 'trump', 'oliver', 'stein', 'kennedy', 'others'];

        const total = parseInt(countyData.total);
        const candidateLabels = [];
        const candidatePercentages = [];
        for (const candidate in candidateDisplayNames) {
            const votes = parseInt(countyData[candidate]);
            const percentage = ((votes / total) * 100).toFixed(2);

            const row = document.createElement('tr');
            row.innerHTML = `<td>${toTitleCase(candidateDisplayNames[candidate])}</td><td>${percentage}%</td>`;
            countyTableBody.appendChild(row);

            candidateLabels.push(toTitleCase(candidateDisplayNames[candidate]));
            candidatePercentages.push(percentage);
        }
        // Destroy existing chart if it exists
        if (countyChart) {
            countyChart.destroy();
        }
        // Create county chart
        countyChart = new Chart(countyChartCanvas, {
            type: 'bar',
            data: {
                labels: candidateLabels,
                datasets: [{
                    label: 'Percentage', // Removed label from dataset
                    data: candidatePercentages,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',   // Blue with slight transparency
                        'rgba(255, 99, 132, 0.8)',    // Red with slight transparency
                        'rgba(255, 206, 86, 0.8)',    // Yellow with slight transparency
                        'rgba(75, 192, 192, 0.8)',    // Green with slight transparency
                        'rgba(153, 102, 255, 0.8)',   // Purple with slight transparency
                        'rgba(255, 159, 64, 0.8)'     // Orange with slight transparency
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',     // Solid blue
                        'rgba(255, 99, 132, 1)',      // Solid red
                        'rgba(255, 206, 86, 1)',      // Solid yellow
                        'rgba(75, 192, 192, 1)',      // Solid green
                        'rgba(153, 102, 255, 1)',     // Solid purple
                        'rgba(255, 159, 64, 1)'       // Solid orange
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 10,
                        bottom: 10
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false  // Hide legend.
                    },
                    title: {
                        display: true,
                        text: county + ' Vote Percentages',
                        font: {
                            size: 16   // Adjust font size
                        }
                    }
                }
            }
        });
    }
});