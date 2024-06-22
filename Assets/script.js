const apiKey = "8ae9c405a95064823cf40a9316d70f63";
let locList = JSON.parse(localStorage.getItem("locations")) || [];
const formEl = $("#searchForm");
const cityStateEL = $("#city-state");
const citiesListEl = $("#cities-list");

// Function to print cities under the search form
function printCities(locationEntered) {
  const commaIndex = locationEntered.indexOf(",");
  const displayLocation =
    commaIndex !== -1
      ? locationEntered.substring(0, commaIndex)
      : locationEntered;

  const listEl = $("<li>");
  listEl.addClass("list-group-item").text(displayLocation);

  // Add click event listener to the list item
  listEl.on("click", function () {
    const locationToFetch = locList.find(
      (loc) => loc.locationEntered.split(",")[0] === displayLocation
    );

    if (locationToFetch) {
      fetchCurrentWeather(locationToFetch.latitude, locationToFetch.longitude);
      fetch5DayForecast(locationToFetch.latitude, locationToFetch.longitude);
    }
  });

  listEl.appendTo(citiesListEl);
}

// Function to render the current weather data to a card
function generateCurrentWeather(data) {
  const cardToday = document.querySelector("#currentWeatherCard");
  cardToday.innerHTML = "";

  const card = document.createElement("div");
  card.classList.add("weather-card");

  const cityName = document.createElement("h2");
  const currentDate = new Date(data.dt * 1000).toLocaleDateString();
  cityName.textContent = `${data.name} (${currentDate})`;

  const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  const weatherIcon = document.createElement("img");
  weatherIcon.src = iconUrl;
  weatherIcon.classList.add("weather-icon");

  const temperatureF = Math.round(((data.main.temp - 273.15) * 9) / 5 + 32);
  const temperature = document.createElement("p");
  temperature.textContent = `Temp: ${temperatureF} °F`;

  const windSpeedMPH = Math.round(data.wind.speed * 2.237); // Conversion from m/s to mph
  const windSpeed = document.createElement("p");
  windSpeed.textContent = `Wind: ${windSpeedMPH} MPH`;

  const humidity = document.createElement("p");
  humidity.textContent = `Humidity: ${data.main.humidity}%`;

  card.appendChild(cityName);
  card.appendChild(weatherIcon); // Append the weather icon below the header
  card.appendChild(temperature); // Append the temperature below the weather icon
  card.appendChild(windSpeed);
  card.appendChild(humidity);

  cardToday.appendChild(card);
}

function generate5DayForecast(weatherData) {
  const weatherCard = $("<article>");
  weatherCard.addClass("futureWeatherCards-item");

  const date = new Date(weatherData.dt * 1000);
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  const iconUrl = `https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
  const temperatureF = Math.round(((weatherData.main.temp - 273.15) * 9) / 5 + 32);
  const windSpeed = weatherData.wind.speed;
  const humidity = weatherData.main.humidity;

  const dateEl = $("<h3>").text(formattedDate);
  const iconEl = $("<img>").attr("src", iconUrl).addClass("weather-icon");
  const tempEl = $("<p>").text("Temp: " + temperatureF + " °F");
  const windEl = $("<p>").text("Wind: " + windSpeed + " MPH");
  const humidityEl = $("<p>").text("Humidity: " + humidity + "%");

  weatherCard.append(dateEl, iconEl, tempEl, windEl, humidityEl);
  $(".card-future").append(weatherCard);
}

function handleSearch(event) {
  event.preventDefault();
  const locationEntered =
    cityStateEL.val().charAt(0).toUpperCase() +
    cityStateEL.val().slice(1);

  if (locationEntered === "") {
    return;
  }

  fetchCoordinates(locationEntered);

  const locations = {
    locationEntered: locationEntered,
    latitude: null,
    longitude: null,
  };

  const existingLocationIndex = locList.findIndex(
    (location) => location.locationEntered === locations.locationEntered
  );

  if (existingLocationIndex !== -1) {
    locList[existingLocationIndex] = locations;
  } else {
    locList.push(locations);
  }

  localStorage.setItem("locations", JSON.stringify(locList));
  printCities(locationEntered);
  $('input[type="text"]').val("");
}

function fetchCoordinates(location) {
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}&lang=en`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const latitude = data[0].lat;
        const longitude = data[0].lon;

        const locationToUpdate = locList.find(
          (loc) => loc.locationEntered === location
        );

        if (locationToUpdate) {
          locationToUpdate.latitude = latitude;
          locationToUpdate.longitude = longitude;

          localStorage.setItem("locations", JSON.stringify(locList));
          fetchCurrentWeather(latitude, longitude);
          fetch5DayForecast(latitude, longitude);
        }
      } else {
        console.error("Location not found");
      }
    })
    .catch((error) => console.error("Error fetching coordinates:", error));
}

function fetchCurrentWeather(latitude, longitude) {
  const apiURL2 = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=en`;

  fetch(apiURL2)
    .then((response) => response.json())
    .then((data) => {
      generateCurrentWeather(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function fetch5DayForecast(latitude, longitude) {
  const apiURL3 = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=en`;

  fetch(apiURL3)
    .then((response) => response.json())
    .then((data) => {
      $(".card-future").empty();
      const filteredData = data.list.filter((item) =>
        item.dt_txt.endsWith("12:00:00")
      );

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
