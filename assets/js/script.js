// Constants for API and other configurations
const apiKey = "2999a88f8b9d706a8cbb8519dffa063b"; // Replace with your OpenWeatherMap API key
const countryCode = "US"; // Replace with the desired country code

// Select elements for easy access
const searchInput = document.getElementById("myInput");
const historyContainer = $(".history");
const subtitle = $(".subtitle");
const fiveDayContainer = $(".five-day");
const cityInfoContainer = $(".city");

function addResult() {
    const inputCity = document.getElementById("myInput").value;
    const historyList = getInfo();
    
    // Check if the inputCity is not in historyList
    if (!historyList.includes(inputCity)) {
        const searchCity = $("<div>")
            .attr('id', inputCity)
            .text(inputCity)
            .addClass("h4");

        $(".history").append(searchCity);
    }
    
    // Show the subtitle
    $(".subtitle").css("display", "inline");
    
    // Call the addInfo function with inputCity
    addInfo(inputCity);
}

// Event listeners
historyContainer.on('click', function (event) {
    event.preventDefault();
    subtitle.css("display", "inline");
    myInput.value = event.target.id;
    getResult();
});

document.getElementById("searchBtn").addEventListener("click", function () {
    addResult();
    getResult();
});

// Main function to fetch and display weather data
function getResult() {
    // Clear previous weather and forecast data
    fiveDayContainer.empty();
    cityInfoContainer.empty();

    // Get the city input from the user
    const inputCity = searchInput.value;

    // Construct the URL for the Geo API
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${inputCity},${countryCode}&limit=5&appid=${apiKey}`;

    // Fetch geographic data
    fetch(geoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch geographic data. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Geo data:', data); // Log the geo data for inspection

            // Check if the response contains the expected data structure
            if (Array.isArray(data) && data.length > 0) {
                const geoLon = data[0].lon;
                const geoLat = data[0].lat;

                // Construct the URL for the Weather API
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${geoLat}&lon=${geoLon}&appid=${apiKey}`;

                // Fetch weather data
                fetch(weatherUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Weather data:', data); // Log the weather data for inspection

                        // Display current weather data
                        displayCurrentWeather(data, inputCity);
                        console.log(data)
                        // Display 5-day forecast
                        // for (let i = 1; i < 6; i++) {
                        //     // Adjust this based on the actual structure of the data
                        //     // displayDailyForecast(data.list[i * 8], i);
                        // }
                    })
                    .catch(weatherError => {
                        console.error("Error fetching weather data:", weatherError);
                    });
            } else {
                console.error("No valid data received from the Geo API");
            }
        })
        .catch(geoError => {
            console.error("Error fetching geographic data:", geoError);
        });
}

function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9/5 + 32).toFixed(2);
}

// Display current weather data
function displayCurrentWeather(data, inputCity) {
    // Check if 'data' contains the necessary properties
    if (data && (data.main || data.temp) && data.weather && (data.wind || data.wind_speed) && data.dt) {
        const cityName = inputCity;
        const date = new Date(data.dt * 1000);

        const cityNameElement = $("<h>").addClass("h3").text(cityName);
        const dateTimeElement = $("<div>").text(`(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`);
        const iconElement = $("<img>").addClass("icon").attr('src', `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`);
        const tempElement = $("<div>").text(`Temperature: ${kelvinToFahrenheit(data.main.temp)} F`);
        const humidityElement = $("<div>").text(`Humidity: ${data.main.humidity} %`);
        const windElement = $("<div>").text(`Wind Speed: ${data.wind ? data.wind.speed : data.wind_speed} MPH`);

        cityInfoContainer.addClass("list-group");
        cityInfoContainer.append(cityNameElement, dateTimeElement, iconElement, tempElement, humidityElement, windElement);
    } else {
        console.error("Invalid or missing data for current weather");
    }
}

// Display a single day's forecast
function displayDailyForecast(dailyData, index) {
    const forecastDay = new Date(dailyData.dt * 1000);
    const blueContainer = $("<div>").addClass("weather-card");
    const futureDate = $("<h>").text(`${forecastDay.getMonth() + 1}/${forecastDay.getDate()}/${forecastDay.getFullYear()}`);
    const futureIcon = $("<img>").attr('src', `https://openweathermap.org/img/wn/${dailyData.weather[0].icon}.png`);
    const futureTemp = $("<div>").text(`Temperature: ${dailyData.temp.day} F`);
    const futureWind = $("<div>").text(`Wind: ${dailyData.wind_speed} MPH`);
    const futureHumidity = $("<div>").text(`Humidity: ${dailyData.humidity} %`);

    blueContainer.append(futureDate, futureIcon, futureTemp, futureWind, futureHumidity);
    fiveDayContainer.append(blueContainer);
}

// Get local storage info
function getInfo() {
    const currentList = localStorage.getItem("city");
    return currentList ? JSON.parse(currentList) : [];
}

// Add info to local storage
function addInfo(cityName) {
    const addedList = getInfo();
    if (!addedList.includes(cityName)) {
        addedList.push(cityName);
        localStorage.setItem("city", JSON.stringify(addedList));
    }
}

// Render search history
function renderInfo() {
    const historyList = getInfo();
    historyList.forEach(cityName => {
        const searchCity = $("<div>").attr('id', cityName).text(cityName).addClass("h4");
        historyContainer.append(searchCity);
    });
}

// Initial render of search history
renderInfo();
