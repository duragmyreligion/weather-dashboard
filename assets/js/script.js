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
            // Check if the response contains the expected data structure
            if (Array.isArray(data) && data.length > 0) {
                const geoLon = data[0].lon;
                const geoLat = data[0].lat;

                // Construct the URL for the Weather API
                const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${geoLat}&lon=${geoLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;

                // Fetch weather data
                fetch(weatherUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Display current weather data
                        displayCurrentWeather(data, inputCity);

                        // Display 5-day forecast
                        for (let i = 1; i < 6; i++) {
                            displayDailyForecast(data.daily[i], i);
                        }
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

// Display current weather data
function displayCurrentWeather(data, inputCity) {
    // Check if 'data' contains the necessary properties
    if (data && data.current && data.current.dt) {
        const current = data.current;
        const cityName = inputCity;
        const date = new Date(current.dt * 1000);

        const cityNameElement = $("<h>").addClass("h3").text(cityName);
        const dateTimeElement = $("<div>").text(`(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`);
        const iconElement = $("<img>").addClass("icon").attr('src', `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`);
        const tempElement = $("<div>").text(`Temperature: ${current.temp} F`);
        const humidityElement = $("<div>").text(`Humidity: ${current.humidity} %`);
        const windElement = $("<div>").text(`Wind Speed: ${current.wind_speed} MPH`);
        const uvIndexElement = $("<div>").addClass("d-flex").text("UV Index: ");
        const uvi = current.uvi;

        uvIndexElement.append(uviColorIndicator(uvi));
        uvIndexElement.append(uvi);

        cityInfoContainer.addClass("list-group");
        cityInfoContainer.append(cityNameElement, dateTimeElement, iconElement, tempElement, humidityElement, windElement, uvIndexElement);
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
