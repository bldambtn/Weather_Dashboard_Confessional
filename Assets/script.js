const apiKey = "8ae9c405a95064823cf40a9316d70f63";
let locList = JSON.parse(localStorage.getItem("locations")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
const formEl = $("#searchForm");
const cityStateEL = $("#city-state");
const citiesListEl = $("#cities-list");

//Fuction to generate a unique ID for each location searched
function generateLocationID() {
  //Get the current timestamp
  const timestamp = new Date().getTime();

  // Increment the task ID counter
  nextId++;

  // Save the updated task ID counter to localStorage
  localStorage.setItem("nextId", JSON.stringify(nextId));

  // Return the task ID as a string
  return "location-" + timestamp + "-" + nextId;
}

// Function to print cities under the search form
function printCities(locationEntered) {

  // Create a list element
  const listEl = $("<li>");
  // Add class and set text content to the list element
  listEl.addClass("list-group-item").text(locationEntered);
  // Append the searched city to the list element
  listEl.appendTo(citiesListEl);
}

//Function searching by City, State and saving to localStorage
function handleSearch(event) {
  // Prevent the default behavior
  event.preventDefault();

  // Prints the location entered to console
  console.log("Location Entered:", cityStateEL.val());

  // Gets Location Entered and Capitalizes the first letter
  const locationEntered =
    document.getElementById("city-state").value.charAt(0).toUpperCase() +
    document.getElementById("city-state").value.slice(1);

  // Fetch coordinates for the entered location
  fetchCoordinates(locationEntered);

  // Checks for empty input
  if (locationEntered === "") {
    // Prevent form submission
    event.preventDefault();
  } else {
    const locations = {
      id: generateLocationID(),
      locationEntered: locationEntered,
      latitude: null,
      longitude: null,
    };

    // Check if the location with the same ID already exists in taskList
    const existingLocationID = locList.findIndex(
      (location) => location.id === locations.id
    );

    if (existingLocationID !== -1) {
      // Update the existing task if found
      locList[existingLocationID] = locations;
    } else {
      // Add the new task to taskList
      locList.push(locations);
    }

    // Save the updated task list to localStorage
    localStorage.setItem("locations", JSON.stringify(locList));

    printCities(locationEntered);

    // Clear input fields
    $('input[type="text"]').val("");
  }
}

// Function to fetch latitude and longitude using a server-side API
function fetchCoordinates(location) {
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const latitude = data[0].lat;
        const longitude = data[0].lon;

        // Find the location object in the locList array based on the locationEntered value
        const locationToUpdate = locList.find(loc => loc.locationEntered === location);

        if (locationToUpdate) {
          // Update the location object with latitude and longitude
          locationToUpdate.latitude = latitude;
          locationToUpdate.longitude = longitude;

          // Save the updated task list to localStorage
          localStorage.setItem("locations", JSON.stringify(locList));
        }
      } else {
        console.error("Location not found");
      }
    })
    .catch(error => console.error("Error fetching coordinates:", error));
}

// Submit event on the form
formEl.on("submit", handleSearch);