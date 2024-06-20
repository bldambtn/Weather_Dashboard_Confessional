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
  // Extract the substring before the comma
  const commaIndex = locationEntered.indexOf(",");
  const displayLocation =
    commaIndex !== -1
      ? locationEntered.substring(0, commaIndex)
      : locationEntered;

  // Create a list element
  const listEl = $("<li>");
  // Add class and set text content to the list element with the modified display location
  listEl.addClass("list-group-item").text(displayLocation);
  // Append the searched city to the list element
  listEl.appendTo(citiesListEl);
}

// Function to render the current weather data to a card
function generateCurrentWeather(data) {
  // Clear existing content in the currentWeatherCards section
  const cardToday = document.querySelector("#currentWeatherCard");
  cardToday.innerHTML = "";

  // Create HTML elements for the card
  const card = document.createElement("div");
  card.classList.add("weather-card");

  const cityName = document.createElement("h2");
  const currentDate = new Date(data.dt * 1000).toLocaleDateString();
  cityName.textContent = `${data.name} (${currentDate})`;

  const temperature = document.createElement("p");
  temperature.textContent = `Temperature: ${data.main.temp} K`;

  const windSpeed = document.createElement("p");
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  const humidity = document.createElement("p");
  humidity.textContent = `Humidity: ${data.main.humidity}%`;

  // Append elements to the card
  card.appendChild(cityName);
  card.appendChild(temperature);
  card.appendChild(windSpeed);
  card.appendChild(humidity);

  // Append the card to the currentWeatherCards section
  cardToday.appendChild(card);
}

function generate5DayForecast(weatherData) {
  // Create the card element as an article
  const weatherCard = $("<article>");

  weatherCard.addClass("futureWeatherCards-item");
  // Extract necessary information from the weather data
  const date = new Date(weatherData.dt * 1000); // Convert timestamp to date
  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  const iconUrl = `https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
  const temperatureF = Math.round(
    ((weatherData.main.temp - 273.15) * 9) / 5 + 32
  ); // Convert temperature to Fahrenheit
  const windSpeed = weatherData.wind.speed;
  const humidity = weatherData.main.humidity;

  // Create elements for displaying weather information
  const dateEl = $("<h3>").text(formattedDate);
  const iconEl = $("<img>").attr("src", iconUrl).addClass("weather-icon");
  const tempEl = $("<p>").text("Temperature: " + temperatureF + " °F");
  const windEl = $("<p>").text("Wind Speed: " + windSpeed + " MPH");
  const humidityEl = $("<p>").text("Humidity: " + humidity + "%");

  // Append weather information elements to the card
  weatherCard.append(dateEl, iconEl, tempEl, windEl, humidityEl);

  // Append the card to the weather cards list element
  $(".card-future").append(weatherCard);
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

// Function to fetch latitude and longitude using Open Weather's Geocoding API
function fetchCoordinates(location) {
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const latitude = data[0].lat;
        const longitude = data[0].lon;

        // Find the location object in the locList array based on the locationEntered value
        const locationToUpdate = locList.find(
          (loc) => loc.locationEntered === location
        );

        if (locationToUpdate) {
          // Update the location object with latitude and longitude
          locationToUpdate.latitude = latitude;
          locationToUpdate.longitude = longitude;

          // Save the updated task list to localStorage
          localStorage.setItem("locations", JSON.stringify(locList));
          // Trigger the fetch5DayForecast function with the latitude and longitude
          fetch5DayForecast(latitude, longitude);
          fetchCurrentWeather(latitude, longitude);
        }
      } else {
        console.error("Location not found");
      }
    })
    .catch((error) => console.error("Error fetching coordinates:", error));
}

// Function to fetch the current weather forecast using the One Call API
function fetchCurrentWeather(latitude, longitude) {
  const apiURL2 = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

  fetch(apiURL2)
    .then((response) => response.json())
    .then((data) => {
      console.log("Current Weather Data:", data); // Log the data received
      generateCurrentWeather(data); // Call the function to render the weather data to a card
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function fetch5DayForecast(latitude, longitude) {
  const apiURL3 = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

  fetch(apiURL3)
    .then((response) => response.json())
    .then((data) => {
      // Clear the existing future weather cards
      $(".card-future").empty();

      // Filter the responses to only show those with dt_txt at 12:00:00
      const filteredData = data.list.filter((item) =>
        item.dt_txt.endsWith("12:00:00")
      );

      // Loop through the filtered data and generate weather cards for each day
      filteredData.forEach((item) => {
        generate5DayForecast(item); // Call generate5DayForecast function with each day's forecast data
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Submit event on the form
formEl.on("submit", handleSearch);
