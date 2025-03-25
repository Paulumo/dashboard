const displayTime = document.querySelector(".display-time");
// Get DOM elements
const flightTableBody = document.getElementById('flights-table-body');
const flightListEdit = document.getElementById('flight-edit-list');
const aircraftStatusSelect = document.getElementById('aircraft-status-select');
const crewBtns = document.querySelectorAll('.crew-btn');
const pilotsDisplay = document.getElementById('pilots-on-duty');
const hoistDisplay = document.getElementById('hoist-on-duty');

// Global variables
let flights = [];
let currentEditingFlightIndex = -1;

// Add this function near the top of your file, after your variable declarations
function createModalContainer() {
  // Check if container already exists
  if (document.getElementById('custom-modal-container')) {
    return;
  }
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'custom-modal-container';
  document.body.appendChild(modalContainer);
}

// Add these utility functions for modern UI notifications
function showConfirmDialog(message, onConfirm, onCancel) {
  createModalContainer();
  const container = document.getElementById('custom-modal-container');
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'custom-modal confirm-modal';
  
  // Add animation class
  modal.classList.add('modal-animate');
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Confirm Action</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-cancel">Cancel</button>
        <button class="btn btn-confirm">Confirm</button>
      </div>
    </div>
  `;
  
  container.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.modal-close').addEventListener('click', () => {
    closeModal(modal);
    if (onCancel) onCancel();
  });
  
  modal.querySelector('.btn-cancel').addEventListener('click', () => {
    closeModal(modal);
    if (onCancel) onCancel();
  });
  
  modal.querySelector('.btn-confirm').addEventListener('click', () => {
    closeModal(modal);
    if (onConfirm) onConfirm();
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
      if (onCancel) onCancel();
    }
  });
}

function showErrorDialog(message) {
  createModalContainer();
  const container = document.getElementById('custom-modal-container');
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'custom-modal error-modal';
  
  // Add animation class
  modal.classList.add('modal-animate');
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header error-header">
        <h3>Error</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="error-message">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ok">OK</button>
      </div>
    </div>
  `;
  
  container.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.modal-close').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('.btn-ok').addEventListener('click', () => {
    closeModal(modal);
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
}

function showSuccessDialog(message) {
  createModalContainer();
  const container = document.getElementById('custom-modal-container');
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'custom-modal success-modal';
  
  // Add animation class
  modal.classList.add('modal-animate');
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header success-header">
        <h3>Success</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="success-message">
          ${message}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ok">OK</button>
      </div>
    </div>
  `;
  
  container.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.modal-close').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('.btn-ok').addEventListener('click', () => {
    closeModal(modal);
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
  
  // Auto-close success message after 3 seconds
  setTimeout(() => {
    if (document.body.contains(modal)) {
      closeModal(modal);
    }
  }, 3000);
}

function closeModal(modal) {
  // Add closing animation
  modal.classList.add('modal-closing');
  
  // Remove after animation completes
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 300);
}

// Time
function showTime() {
  let time = new Date();
  displayTime.innerText = time.toLocaleTimeString("en-US", { hour12: false });
  setTimeout(showTime, 1000);
}

showTime();

// Date
function updateDate() {
  let today = new Date();

  // return number
  let dayName = today.getDay(),
    dayNum = today.getDate(),
    month = today.getMonth(),
    year = today.getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // value -> ID of the html element
  const IDCollection = ["day", "daynum", "month", "year"];
  // return value array with number as a index
  const val = [dayWeek[dayName], dayNum, months[month], year];
  for (let i = 0; i < IDCollection.length; i++) {
    document.getElementById(IDCollection[i]).firstChild.nodeValue = val[i];
  }
}

updateDate();

// Update flight table display - Consolidated version of all updateFlightTable functions
function updateFlightTable() {
  // Clear existing table
  flightTableBody.innerHTML = '';
  flightListEdit.innerHTML = '';
  
  // Sort flights by date if available
  flights.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
  
  // Add flights to table
  flights.forEach((flight, index) => {
    // Skip any flights that don't have the required fields
    if (!flight.number) return;
    
    const row = document.createElement('tr');
    
    // Create cells for each property
    const numberCell = document.createElement('td');
    numberCell.textContent = flight.number;
    
    const customerCell = document.createElement('td');
    customerCell.textContent = flight.customer || '';
    
    const destinationCell = document.createElement('td');
    destinationCell.textContent = flight.destination || '';
    
    // Add date cell
    const dateCell = document.createElement('td');
    dateCell.textContent = flight.date || 'N/A';
    
    const timeCell = document.createElement('td');
    timeCell.textContent = flight.time || '';
    
    const statusCell = document.createElement('td');
    statusCell.textContent = flight.status || 'ON-TIME';
    
    // Add status class for styling
    const statusClass = (flight.status || 'on-time').toLowerCase().replace(/\s+/g, '-');
    statusCell.classList.add(`status-${statusClass}`);
    
    // Append cells to row
    row.appendChild(numberCell);
    row.appendChild(customerCell);
    row.appendChild(destinationCell);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(statusCell);
    
    // Add row to table
    flightTableBody.appendChild(row);
    
    // Add to edit dropdown
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${flight.number} - ${flight.destination || ''}`;
    flightListEdit.appendChild(option);
  });
}

// Update crew display
function updateCrewDisplay() {
  let pilotsOnDuty = [];
  let hoistOnDuty = [];
  
  crewBtns.forEach(btn => {
    if (!btn.classList.contains('off-duty')) {
      if (btn.dataset.role === 'pilots') {
        pilotsOnDuty.push(btn.dataset.crew);
      } else if (btn.dataset.role === 'hoist') {
        hoistOnDuty.push(btn.dataset.crew);
      }
    }
  });
  
  pilotsDisplay.textContent = pilotsOnDuty.join(', ') || 'None';
  hoistDisplay.textContent = hoistOnDuty.join(', ') || 'None';
}

// Firebase database reference - using the exposed global object
function setupFirebaseReferences() {
  // Check if Firebase is available globally
  if (!window.firebaseDB) {
    console.error('Firebase not initialized. Make sure Firebase scripts are loaded properly.');
    return null;
  }
  
  try {
    const { database, ref, set, onValue } = window.firebaseDB;
    
    // Validate required Firebase methods
    if (!database || !ref || !set || !onValue) {
      console.error('Firebase methods missing from window.firebaseDB');
      return null;
    }
    
    // Create references
    const flightsRef = ref(database, 'flights');
    const crewRef = ref(database, 'crew');
    const statusRef = ref(database, 'aircraftStatus');
    
    return { database, ref, set, onValue, flightsRef, crewRef, statusRef };
  } catch (error) {
    console.error('Error setting up Firebase references:', error);
    return null;
  }
}

// Function to fetch and display METAR data
function fetchMetarData() {
  var myHeaders = new Headers();
  myHeaders.append("X-API-Key", "51a29ff98f7c4a6abfcec8586289d785");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const metarDataElement = document.getElementById('metar-data');
  metarDataElement.innerHTML = 'Loading METAR data...';

  fetch("https://api.checkwx.com/metar/RCMQ/decoded", requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      if (result && result.data && result.data.length > 0) {
        const metar = result.data[0];
        const metarText = metar.raw_text.replace("RCMQ", "");
        
        // Format the METAR data for display
        let html = `
          <div class="metar-info">
            <p><a href="https://metar-taf.com/RCMQ" id="METAR-RCMQ" style="text-decoration: none;">RCMQ</a>${metarText || 'N/A'}</p><br><br>
          </div>
        `;
        
        metarDataElement.innerHTML = html;
        
        // Apply color to flight category based on value
        const flightCategory = document.querySelector('.flight-category');
        if (flightCategory) {
          if (metar.flight_category === 'VFR') {
            flightCategory.style.color = '#4CAF50'; // Green
          } else if (metar.flight_category === 'MVFR') {
            flightCategory.style.color = '#2196F3'; // Blue
          } else if (metar.flight_category === 'IFR') {
            flightCategory.style.color = '#FFA500'; // Orange
          } else if (metar.flight_category === 'LIFR') {
            flightCategory.style.color = '#F44336'; // Red
          }
        }
      } else {
        metarDataElement.innerHTML = 'No METAR data available';
        console.warn('No METAR data found in response:', result);
      }
    })
    .catch(error => {
      console.error('Error fetching METAR data:', error);
      metarDataElement.innerHTML = `Error loading METAR data: ${error.message}`;
    });
}

// Update the initDashboard function
function initDashboard() {
  const firebase = setupFirebaseReferences();
  if (!firebase) {
    console.error('Firebase initialization failed. Dashboard functionality will be limited.');
    return;
  }
  
  // Fetch METAR data when dashboard initializes
  fetchMetarData();
  
  // Store the interval ID so it can be cleared if needed
  const metarRefreshInterval = setInterval(fetchMetarData, 30 * 60 * 1000);
  
  // Toggle admin UI when clicking the helicopter section
  const adminUI = document.querySelector('.admin-ui');
  const helicopterSection = document.querySelector('.helicopter-section');
  
  // Add click event to the entire helicopter section
  helicopterSection.addEventListener('click', () => {
    adminUI.classList.toggle('active');
  });
  
  // Get references to flight edit form elements
  const flightEditForm = document.getElementById('flight-edit-form');
  const editFlightBtn = document.getElementById('edit-flight-btn');
  const saveEditFlightBtn = document.getElementById('save-edit-flight-btn');
  const cancelEditFlightBtn = document.getElementById('cancel-edit-flight-btn');
  const editFlightNumber = document.getElementById('edit-flight-number');
  const editCustomer = document.getElementById('edit-customer');
  const editDestination = document.getElementById('edit-destination');
  const editFlightTime = document.getElementById('edit-flight-time');
  const editFlightStatus = document.getElementById('edit-flight-status');
  
  // Get references to status notes elements
  const customStatusNotes = document.getElementById('custom-status-notes');
  const updateStatusNotesBtn = document.getElementById('update-status-notes-btn');
  const notesContainer = document.getElementById('notes-container');
  
  // Listen for flight changes
  firebase.onValue(firebase.flightsRef, (snapshot) => {
    const flightData = snapshot.val();
    if (flightData) {
      // Filter out any invalid entries (like those with only a date)
      flights = Array.isArray(flightData) ? flightData.filter(flight => flight && flight.number) : [];
      updateFlightTable();
    } else {
      // Initialize with empty array if no data
      flights = [];
      updateFlightTable();
    }
  });
  
  // Listen for crew changes
  firebase.onValue(firebase.crewRef, (snapshot) => {
    const crewData = snapshot.val();
    if (crewData) {
      // Update crew button states
      crewBtns.forEach(btn => {
        const crewMember = crewData[btn.dataset.crew];
        if (crewMember) {
          if (crewMember.onDuty) {
            btn.classList.remove('off-duty');
            btn.style.backgroundColor = 'green';
          } else {
            btn.classList.add('off-duty');
            btn.style.backgroundColor = 'red';
          }
        }
      });
      updateCrewDisplay();
    }
  });

  // Add flight button event listener with validation
  document.getElementById('add-flight-btn').addEventListener('click', () => {
    if (flights.length >= 7) {
      showErrorDialog('Maximum 7 flights reached');
      return;
    }

    // Get all values first
    const flightNumber = document.getElementById('flight-number').value.trim();
    const customer = document.getElementById('customer').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const flightDate = document.getElementById('flight-date').value;
    const flightTime = document.getElementById('flight-time').value;
    const flightStatus = document.getElementById('flight-status').value;
    
    // Validation
    const errors = [];
    if (!flightNumber) errors.push('Flight number is required');
    if (!destination) errors.push('Destination is required');
    if (!flightTime) errors.push('Flight time is required');
    
    if (errors.length > 0) {
      showErrorDialog('Please correct the following errors:\n' + errors.join('\n'));
      return;
    }

    // Create a complete flight object with all fields
    const flight = {
      number: flightNumber,
      customer: customer,
      destination: destination,
      date: flightDate,
      time: flightTime,
      status: flightStatus
    };

    // Add to the flights array
    flights.push(flight);
    
    // Save flights to Firebase
    firebase.set(firebase.flightsRef, flights);
    
    // Update the display
    updateFlightTable();
    
    // Clear inputs after adding
    document.getElementById('flight-number').value = '';
    document.getElementById('customer').value = '';
    document.getElementById('destination').value = '';
    document.getElementById('flight-date').value = '';
    document.getElementById('flight-time').value = '';
    
    // Add success message
    showSuccessDialog('Flight added successfully');
  });
  
  // Cancel flight edit
  cancelEditFlightBtn.addEventListener('click', () => {
    flightEditForm.classList.remove('active');
    currentEditingFlightIndex = -1;
  });
  
  // Remove flight button with confirmation
  document.getElementById('remove-flight-btn').addEventListener('click', () => {
    const selectedIndex = flightListEdit.value;
    if (selectedIndex !== undefined && flights.length > 0) {
      // Replace this confirm dialog
      showConfirmDialog(`Are you sure you want to remove flight ${flights[selectedIndex].number}?`, 
        // onConfirm callback
        () => {
          flights.splice(selectedIndex, 1);
          
          // Save updated flights to Firebase
          firebase.set(firebase.flightsRef, flights);
          
          updateFlightTable();
          showSuccessDialog('Flight removed successfully');
        }
      );
    } else {
      showErrorDialog('Please select a flight to remove');
    }
  });
  
  // Helicopter Dashboard Integration
  const statusHeader = document.getElementById('status-header');
  const statusText = document.getElementById('status-text');
  
  // Map status colors to class names and text
  const statusMap = {
    '#4CAF50': { class: 'serviceable', text: 'SERVICEABLE', notes: 'Ready for operations' },
    '#10b981': { class: 'serviceable', text: 'SERVICEABLE', notes: 'Ready for operations' },
    '#f9d71c': { class: 'maintenance', text: 'IN MAINTENANCE', notes: 'Scheduled maintenance in progress' },
    '#f59e0b': { class: 'maintenance', text: 'IN MAINTENANCE', notes: 'Scheduled maintenance in progress' },
    '#f44336': { class: 'aog', text: 'AIRCRAFT ON GROUND', notes: 'Aircraft is grounded due to technical issues' },
    '#ef4444': { class: 'aog', text: 'AIRCRAFT ON GROUND', notes: 'Aircraft is grounded due to technical issues' }
  };

  // Function to update helicopter status display
  function updateHelicopterStatus(color, customNotes = null) {
    // Remove all status classes
    statusHeader.classList.remove('serviceable', 'maintenance', 'aog');
    notesContainer.classList.remove('serviceable-notes', 'maintenance-notes', 'aog-notes');
    
    // Get status info from map or use default
    const status = statusMap[color] || statusMap['#4CAF50']; // Default to serviceable
    
    // Update elements
    statusHeader.classList.add(status.class);
    statusText.textContent = status.text;
    notesContainer.classList.add(`${status.class}-notes`);
    
    // Use custom notes if provided, otherwise use default
    notesContainer.textContent = customNotes || status.notes;
  }
  
  // Listen for aircraft status changes
  firebase.onValue(firebase.statusRef, (snapshot) => {
    const status = snapshot.val();
    if (status) {
      updateHelicopterStatus(status.color, status.customNotes);
      
      // Populate custom notes field in admin UI if it exists
      if (status.customNotes && customStatusNotes) {
        customStatusNotes.value = status.customNotes;
      }
      
      // For backward compatibility with existing code
      if (status.color) {
        aircraftStatusSelect.value = status.color;
      }
    }
  });
  
  // Update aircraft status
  aircraftStatusSelect.addEventListener('change', (e) => {
    const statusColor = e.target.value;
    const currentCustomNotes = customStatusNotes.value;
    
    // Update the dashboard
    updateHelicopterStatus(statusColor, currentCustomNotes);
    
    // Save status to Firebase
    firebase.set(firebase.statusRef, {
      color: statusColor,
      customNotes: currentCustomNotes
    });
  });
  
  // Update status notes button
  updateStatusNotesBtn.addEventListener('click', () => {
    const statusColor = aircraftStatusSelect.value;
    const newNotes = customStatusNotes.value.trim();
    
    // Update the dashboard
    updateHelicopterStatus(statusColor, newNotes);
    
    // Save to Firebase
    firebase.set(firebase.statusRef, {
      color: statusColor,
      customNotes: newNotes
    });
  });
  
  // Initialize helicopter details in Firebase if not already present
  const helicopterDetailsRef = firebase.ref(firebase.database, 'helicopterDetails');
  firebase.onValue(helicopterDetailsRef, (snapshot) => {
    const details = snapshot.val();
    if (!details) {
      // Set initial values if not present
      firebase.set(helicopterDetailsRef, {
        model: 'AW169',
        location: 'RCMQ',
        flightHours: 114.68,
        hoistCycles: 482, 
        lastMaintenance: '2025-02-10',
        nextMaintenance: '2025-04-12'
      });
    } else {
      // Update the UI with the values from Firebase
      document.getElementById('helicopter-location').textContent = details.location || 'RCMQ';
      document.getElementById('flight-hours').textContent = details.flightHours || '0';
      
      // Get hoist cycles element with consistent ID approach
      const hoistCyclesElement = document.getElementById('hoistcycles');
      if (hoistCyclesElement) {
        hoistCyclesElement.textContent = details.hoistCycles || '0';
      }
      
      document.getElementById('last-maintenance').textContent = details.lastMaintenance || 'N/A';
      document.getElementById('next-maintenance').textContent = details.nextMaintenance || 'N/A';
    }
  });
  
  // Update crew status event listeners
  crewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('off-duty');
      const isOffDuty = btn.classList.contains('off-duty');
      btn.style.backgroundColor = isOffDuty ? 'red' : 'green';
      
      // Save crew status to Firebase
      const crewData = {};
      crewBtns.forEach(crewBtn => {
        crewData[crewBtn.dataset.crew] = {
          onDuty: !crewBtn.classList.contains('off-duty'),
          role: crewBtn.dataset.role
        };
      });
      firebase.set(firebase.crewRef, crewData);
      
      updateCrewDisplay();
    });
  });
  
  // Prevent clicks within the admin UI from toggling the panel
  adminUI.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // Aircraft Data Form Elements
  const aircraftLocationInput = document.getElementById('aircraft-location-input');
  const aircraftFlightHours = document.getElementById('aircraft-flight-hours');
  const aircraftHoistCycles = document.getElementById('aircraft-hoist-cycles');
  const aircraftLastMaintenance = document.getElementById('aircraft-last-maintenance');
  const aircraftNextMaintenance = document.getElementById('aircraft-next-maintenance');
  const updateAircraftDataBtn = document.getElementById('update-aircraft-data-btn');
  
  // Load the current helicopter details into the form
  firebase.onValue(helicopterDetailsRef, (snapshot) => {
    const details = snapshot.val();
    if (details) {
      // Update the UI elements first
      document.getElementById('helicopter-location').textContent = details.location || 'RCMQ';
      document.getElementById('flight-hours').textContent = details.flightHours || '0';
      
      // Find the hoist cycles element (consistent ID)
      const hoistCyclesElement = document.getElementById('hoistcycles');
      if (hoistCyclesElement) {
        hoistCyclesElement.textContent = details.hoistCycles || '0';
      }
      
      document.getElementById('last-maintenance').textContent = details.lastMaintenance || 'N/A';
      document.getElementById('next-maintenance').textContent = details.nextMaintenance || 'N/A';
      
      // Then populate the form inputs
      aircraftLocationInput.value = details.location || '';
      aircraftFlightHours.value = details.flightHours || '';
      aircraftHoistCycles.value = details.hoistCycles || '';
      
      // Format date inputs (yyyy-MM-dd)
      if (details.lastMaintenance) {
        const lastDate = formatDateForInput(details.lastMaintenance);
        aircraftLastMaintenance.value = lastDate;
      }
      
      if (details.nextMaintenance) {
        const nextDate = formatDateForInput(details.nextMaintenance);
        aircraftNextMaintenance.value = nextDate;
      }
    }
  });
  
  // Helper function to format dates for input fields
  function formatDateForInput(dateStr) {
    // Handle different date formats
    let date;
    if (dateStr.includes('-') && dateStr.length >= 10) {
      // Already in YYYY-MM-DD format
      return dateStr.substring(0, 10);
    } else if (dateStr.includes('/')) {
      // In MM/DD/YYYY format
      const parts = dateStr.split('/');
      date = new Date(parts[2], parts[0] - 1, parts[1]);
    } else {
      // Try to parse as regular date
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      // Invalid date
      return '';
    }
    
    // Format as YYYY-MM-DD for input[type="date"]
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper function to format dates for display
  function formatDateForDisplay(dateStr) {
    if (!dateStr) return 'N/A';
    
    let date;
    if (dateStr.includes('-') && dateStr.length >= 10) {
      const parts = dateStr.split('-');
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      date = new Date(parts[2], parts[0] - 1, parts[1]);
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      // If it's not a valid date object, return the original string
      return dateStr;
    }
    
    // Format as YYYY-MM-DD for display
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Update aircraft data with validation
  updateAircraftDataBtn.addEventListener('click', () => {
    // Validate inputs
    const location = aircraftLocationInput.value.trim();
    const flightHours = parseFloat(aircraftFlightHours.value) || 0;
    const hoistCycles = parseInt(aircraftHoistCycles.value) || 0;
    const lastMaintenance = aircraftLastMaintenance.value;
    const nextMaintenance = aircraftNextMaintenance.value;
    
    // Simple validation
    const errors = [];
    if (!location) errors.push('Location is required');
    if (flightHours < 0) errors.push('Flight hours cannot be negative');
    if (hoistCycles < 0) errors.push('Hoist cycles cannot be negative');
    
    if (lastMaintenance && nextMaintenance) {
      const lastDate = new Date(lastMaintenance);
      const nextDate = new Date(nextMaintenance);
      if (nextDate < lastDate) {
        errors.push('Next maintenance date cannot be before last maintenance date');
      }
    }
    
    if (errors.length > 0) {
      showErrorDialog('Please correct the following errors:\n' + errors.join('\n'));
      return;
    }
    
    const updatedDetails = {
      model: 'AW169', // Fixed model
      location: location,
      flightHours: flightHours,
      hoistCycles: hoistCycles,
      lastMaintenance: formatDateForDisplay(lastMaintenance),
      nextMaintenance: formatDateForDisplay(nextMaintenance)
    };
    
    // Save to Firebase
    firebase.set(helicopterDetailsRef, updatedDetails);
    
    // Show confirmation
    showSuccessDialog('Aircraft data updated successfully!');
  });
  
  // Edit flight button
  editFlightBtn.addEventListener('click', () => {
    const selectedIndex = flightListEdit.value;
    if (selectedIndex !== undefined && flights.length > 0) {
      currentEditingFlightIndex = selectedIndex;
      const flight = flights[selectedIndex];
      
      // Populate edit form with flight data
      editFlightNumber.value = flight.number || '';
      editCustomer.value = flight.customer || '';
      editDestination.value = flight.destination || '';
      document.getElementById('edit-flight-date').value = flight.date || '';
      editFlightTime.value = flight.time || '';
      editFlightStatus.value = flight.status || 'ON-TIME';
      
      // Show edit form
      flightEditForm.classList.add('active');
    } else {
      showErrorDialog('Please select a flight to edit');
    }
  });
  
  // Save flight edit changes with validation
  saveEditFlightBtn.addEventListener('click', () => {
    if (currentEditingFlightIndex >= 0 && currentEditingFlightIndex < flights.length) {
      // Get edited values
      const flightNumber = editFlightNumber.value.trim();
      const destination = editDestination.value.trim();
      const flightTime = editFlightTime.value;
      
      // Validate inputs
      const errors = [];
      if (!flightNumber) errors.push('Flight number is required');
      if (!destination) errors.push('Destination is required');
      if (!flightTime) errors.push('Flight time is required');
      
      if (errors.length > 0) {
        showErrorDialog('Please correct the following errors:\n' + errors.join('\n'));
        return;
      }
      
      // Update flight data
      flights[currentEditingFlightIndex] = {
        number: flightNumber,
        customer: editCustomer.value.trim(),
        destination: destination,
        date: document.getElementById('edit-flight-date').value,
        time: flightTime,
        status: editFlightStatus.value
      };
      
      // Save to Firebase
      firebase.set(firebase.flightsRef, flights);
      
      // Update display
      updateFlightTable();
      
      // Hide edit form
      flightEditForm.classList.remove('active');
      currentEditingFlightIndex = -1;
      
      // Show success message
      showSuccessDialog('Flight updated successfully');
    }
  });
   // Flight tracking toggle functionality
   const toggleWindy = document.getElementById('toggle-windy');
   const toggleTracking = document.getElementById('toggle-tracking');
   const windyContainer = document.getElementById('windy-container');
   const trackingContainer = document.getElementById('tracking-container');
   const refreshTrackingBtn = document.getElementById('refresh-tracking');
   
   if (toggleWindy && toggleTracking) {
     // Set up toggle buttons
     toggleWindy.addEventListener('click', () => {
       toggleWindy.classList.add('active');
       toggleTracking.classList.remove('active');
       windyContainer.classList.add('active');
       trackingContainer.classList.remove('active');
       
       // Stop tracking when switching to windy view
       if (trackingInterval) {
         clearInterval(trackingInterval);
         trackingInterval = null;
       }
     });
     
     toggleTracking.addEventListener('click', () => {
       toggleWindy.classList.remove('active');
       toggleTracking.classList.add('active');
       windyContainer.classList.remove('active');
       trackingContainer.classList.add('active');
       
       // Fetch nearby aircraft data when tab is shown
       fetchNearbyAircraft();
       
       // Start tracking interval (1 second refresh)
       if (!trackingInterval) {
         trackingInterval = setInterval(fetchNearbyAircraft, 1000);
       }
     });
     
     // Set up refresh button
     if (refreshTrackingBtn) {
       refreshTrackingBtn.addEventListener('click', () => {
         fetchNearbyAircraft();
       });
     }
   }
   
   // Initial data fetch if tracking view is active on load
   if (trackingContainer && trackingContainer.classList.contains('active')) {
     fetchNearbyAircraft();
     
     // Start tracking interval
     if (!trackingInterval) {
       trackingInterval = setInterval(fetchNearbyAircraft, 1000);
     }
   }
}

// Make initDashboard available globally
window.initDashboard = initDashboard;