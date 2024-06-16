//API Key: 8ae9c405a95064823cf40a9316d70f63
let locList = JSON.parse(localStorage.getItem("locations")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
const formEl = $("#searchForm");
const cityStateEL = $('input[name="city-state"]');

//Fuction to generate a unique location ID
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

//Function searching by City, State and saving to localStorage
function handleSearch(event) {
  // Prevent the default behavior
  event.preventDefault();

  // Prints the location entered to console
  console.log("Location Entered:", cityStateEL.val());

  const locationEntered = document.getElementById("city-state").value;

  if (locationEntered === "") {
    // Prevent form submission
    event.preventDefault();
  } else {
    const locations = {
      id: generateLocationID(),
      locationEntered: locationEntered,
    };

    // Check if the task with the same ID already exists in taskList
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

    // Clear input fields
    $('input[type="text"]').val("");
  }
}

// Submit event on the form
formEl.on("submit", handleSearch);
