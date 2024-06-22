//Initiates variables
const apiKey = "8ae9c405a95064823cf40a9316d70f63";
//Retrieve locations from localStorage or initialize as empty array
let locList = JSON.parse(localStorage.getItem("locations")) || [];
//Select the search form element
const formEl = $("#searchForm");
//Select the city-state element
const cityStateEL = $("#city-state");
//Select the cities list element
const citiesListEl = $("#cities-list");

//Function to print cities under the search form
function printCities(locationEntered) {
  //Extract the city name from the location entered
  const commaIndex = locationEntered.indexOf(",");
  const displayLocation =
    commaIndex !== -1
      ? locationEntered.substring(0, commaIndex)
      : locationEntered;

  //Create a list item element to display the city
  const listEl = $("<li>");
  listEl.addClass("list-group-item").text(displayLocation);

  //Add click event listener to the list item
  listEl.on("click", function () {
    //Find the location in the locList array based on the displayed city name
    const locationToFetch = locList.find(
      (loc) => loc.locationEntered.split(",")[0] === displayLocation
    );

    //If the location is found, fetch current weather and 5-day forecast
    if (locationToFetch) {
      fetchCurrentWeather(locationToFetch.latitude, locationToFetch.longitude);
      fetch5DayForecast(locationToFetch.latitude, locationToFetch.longitude);
    }
  });

  //Append the list item to the cities list element
  listEl.appendTo(citiesListEl);
}

// Function to render the current weather data to a card
function generateCurrentWeather(data) {
  //Select the element where the current weather card will be displayed
  const cardToday = document.querySelector("#currentWeatherCard");
  if (cardToday) {
    cardToday.innerHTML = "";

    //Create elements to display current weather information
    const card = document.createElement("div");
    card.classList.add("weather-card");

    //Display city name and current date
    const cityName = document.createElement("h2");
    const currentDate = new Date(data.dt * 1000).toLocaleDateString();
    cityName.textContent = `${data.name} (${currentDate})`;

    //Display weather icon
    const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    const weatherIcon = document.createElement("img");
    weatherIcon.src = iconUrl;
    weatherIcon.classList.add("weather-icon");

    //Display temperature in Fahrenheit
    const temperatureF = Math.round(((data.main.temp - 273.15) * 9) / 5 + 32);
    const temperature = document.createElement("p");
    temperature.textContent = `Temp: ${temperatureF} °F`;

    //Display wind speed in MPH
    const windSpeedMPH = Math.round(data.wind.speed * 2.237);
    const windSpeed = document.createElement("p");
    windSpeed.textContent = `Wind: ${windSpeedMPH} MPH`;

    //Display humidity
    const humidity = document.createElement("p");
    humidity.textContent = `Humidity: ${data.main.humidity}%`;

    //Append weather information elements to the card
    card.appendChild(cityName);
    card.appendChild(weatherIcon);
    card.appendChild(temperature);
    card.appendChild(windSpeed);
    card.appendChild(humidity);

    //Append the card to the current weather card elemen
    cardToday.appendChild(card);
  } else {
    console.error("Element not found");
  }
}

//Function to generate cards for 5-Day forecast
function generate5DayForecast(weatherData) {
  //Create an article element for the 5-day forecast card
  const weatherCard = $("<article>");
  //Add a class to the card for styling
  weatherCard.addClass("futureWeatherCards-item");

  //Extract and format date information
  const date = new Date(weatherData.dt * 1000);
  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  //Get the icon URL for the weather condition
  const iconUrl = `https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;

  //Calculate temperature in Fahrenheit
  const temperatureF = Math.round(
    ((weatherData.main.temp - 273.15) * 9) / 5 + 32
  );

  //Convert wind speed from m/s to mph
  const windSpeedMPH = Math.round(weatherData.wind.speed * 2.237);

  //Get humidity percentage
  const humidity = weatherData.main.humidity;

  //Create elements to display 5-day forecast information
  const dateEl = $("<h3>").text(formattedDate);
  const iconEl = $("<img>").attr("src", iconUrl).addClass("weather-icon");
  const tempEl = $("<p>").text("Temp: " + temperatureF + " °F");
  const windEl = $("<p>").text("Wind: " + windSpeedMPH + " MPH");
  const humidityEl = $("<p>").text("Humidity: " + humidity + "%");

  //Append forecast information elements to the weather card
  weatherCard.append(dateEl, iconEl, tempEl, windEl, humidityEl);

  //Append the weather card to the container for 5-day forecast cards
  $(".card-future").append(weatherCard);
}

//Function to handle city/location search
function handleSearch(event) {
  //Prevent the default form submission behavior
  event.preventDefault();

  //Get the location entered by the user and capitalize the first letter
  const locationEntered =
    cityStateEL.val().charAt(0).toUpperCase() + cityStateEL.val().slice(1);

  //If no location entered, do nothing
  if (locationEntered === "") {
    return;
  }

  //Fetch the coordinates for the entered location
  fetchCoordinates(locationEntered);

  //Create an object to store the location details
  const locations = {
    locationEntered: locationEntered,
    latitude: null,
    longitude: null,
  };

  //Check if the location already exists in the locList array
  const existingLocationIndex = locList.findIndex(
    (location) => location.locationEntered === locations.locationEntered
  );

  //Update the location if it already exists, otherwise add it to the list
  if (existingLocationIndex !== -1) {
    locList[existingLocationIndex] = locations;
  } else {
    locList.push(locations);
  }

  //Save the updated locList to localStorage
  localStorage.setItem("locations", JSON.stringify(locList));

  //Display the city under the search form
  printCities(locationEntered);

  //Clear the input field after search
  $('input[type="text"]').val("");
}

//Function to fetch coordinates (latitude and longitude) for a given location
function fetchCoordinates(location) {
  //Construct the API URL to fetch coordinates for the location
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}&lang=en`;

  //Fetch the coordinates from the API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      //Check if data is returned for the location
      if (data.length > 0) {
        //Extract latitude and longitude from the API response
        const latitude = data[0].lat;
        const longitude = data[0].lon;

        //Find the location in locList array based on the location name
        const locationToUpdate = locList.find(
          (loc) => loc.locationEntered === location
        );

        //Update the latitude and longitude for the location
        if (locationToUpdate) {
          locationToUpdate.latitude = latitude;
          locationToUpdate.longitude = longitude;

          //Update locList in localStorage with the new coordinates
          localStorage.setItem("locations", JSON.stringify(locList));

          //Fetch current weather and 5-day forecast using the new coordinates
          fetchCurrentWeather(latitude, longitude);
          fetch5DayForecast(latitude, longitude);
        }
      } else {
        console.error("Location not found");
      }
    })
    .catch((error) => console.error("Error fetching coordinates:", error));
}

//Function to fetch current weather data using latitude and longitude
function fetchCurrentWeather(latitude, longitude) {
  //Construct the API URL to fetch current weather data for the given latitude and longitude
  const apiURL2 = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=en`;

  //Fetch the current weather data from the API
  fetch(apiURL2)
    .then((response) => response.json())
    .then((data) => {
      //Call the function to generate and display the current weather information
      generateCurrentWeather(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

//Function to fetch 5-day forecast data using latitude and longitude
function fetch5DayForecast(latitude, longitude) {
  //Construct the API URL to fetch 5-day forecast data for the given latitude and longitude
  const apiURL3 = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=en`;

  //Fetch the 5-day forecast data from the API
  fetch(apiURL3)
    .then((response) => response.json())
    .then((data) => {
      //Clear the container for 5-day forecast cards
      $(".card-future").empty();

      //Filter the forecast data to get only the data for 12:00 PM each day
      const filteredData = data.list.filter((item) =>
        item.dt_txt.endsWith("12:00:00")
      );

      //Generate and display 5-day forecast cards for each filtered data item
      filteredData.forEach((item) => {
        generate5DayForecast(item);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

formEl.on("submit", handleSearch);

// Load initial cities from localStorage
locList.forEach((location) => printCities(location.locationEntered));