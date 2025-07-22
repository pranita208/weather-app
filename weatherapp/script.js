const apiKey = "dae7e3f37641163d476f8ad0972ae7ca";
const baseUrl = "https://api.openweathermap.org/data/2.5";

// DOM elements
const latitudeSpan = document.getElementById("latitude");
const longitudeSpan = document.getElementById("longitude");
const locationSpan = document.getElementById("location");
const windSpeedSpan = document.getElementById("wind-speed");
const humiditySpan = document.getElementById("humidity");
const timeZoneSpan = document.getElementById("time-zone");
const pressureSpan = document.getElementById("pressure");
const windDirectionSpan = document.getElementById("wind-direction");
const uvIndexSpan = document.getElementById("uv-index");
const feelsLikeSpan = document.getElementById("feels-like");
const mapContainer = document.getElementById("maps");

// Update map with iframe
function updateMap(latitude, longitude) {
    mapContainer.innerHTML = ''; // Clear existing map
    const iframe = document.createElement("iframe");
    iframe.className = "map";
    iframe.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    iframe.width = "100%";
    iframe.height = "370";
    iframe.frameBorder = "0";
    iframe.style.border = "0";
    mapContainer.appendChild(iframe);
}

// Convert wind degree to direction
function windDirection(degree) {
    if (degree === 0 || degree === 360) return "North";
    if (degree === 90) return "East";
    if (degree === 180) return "South";
    if (degree === 270) return "West";
    if (degree > 0 && degree < 90) return "North-East";
    if (degree > 90 && degree < 180) return "South-East";
    if (degree > 180 && degree < 270) return "South-West";
    if (degree > 270 && degree < 360) return "North-West";
    return "Unknown";
}

// Convert Kelvin to Celsius
function toCelsius(temp) {
    return Math.floor(temp - 273.15);
}

// Fetch UV Index
async function fetchUVIndex(latitude, longitude) {
    const endPoint = `${baseUrl}/uvi?appid=${apiKey}&lat=${latitude}&lon=${longitude}`;
    try {
        const response = await fetch(endPoint);
        const result = await response.json();
        return result.value || "N/A";
    } catch (error) {
        console.error("Error fetching UV Index:", error);
        return "N/A";
    }
}

// Update UI with weather data
function updateUI(data, latitude, longitude) {
    latitudeSpan.textContent = latitude.toFixed(4);
    longitudeSpan.textContent = longitude.toFixed(4);
    locationSpan.textContent = `${data.name}, ${data.sys.country}`;
    windSpeedSpan.textContent = `${data.wind.speed} km/h`;
    humiditySpan.textContent = `${data.main.humidity}%`;
    timeZoneSpan.textContent = `GMT${data.timezone >= 0 ? "+" : ""}${data.timezone / 3600}`;
    pressureSpan.textContent = `${data.main.pressure} mbar`;
    windDirectionSpan.textContent = windDirection(data.wind.deg);
    feelsLikeSpan.textContent = `${toCelsius(data.main.feels_like)}°C`;
}

// Fetch weather data
async function fetchWeather(latitude, longitude) {
    const endPoint = `${baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    try {
        const response = await fetch(endPoint);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        
        // Fetch UV Index separately
        const uvIndex = await fetchUVIndex(latitude, longitude);
        uvIndexSpan.textContent = uvIndex;

        // Update UI
        updateUI(result, latitude, longitude);
        updateMap(latitude, longitude);
    } catch (error) {
        console.error("Error fetching weather:", error);
        // Update UI with error message
        latitudeSpan.textContent = "Error";
        longitudeSpan.textContent = "Error";
        locationSpan.textContent = "Unable to fetch data";
        windSpeedSpan.textContent = "N/A";
        humiditySpan.textContent = "N/A";
        timeZoneSpan.textContent = "N/A";
        pressureSpan.textContent = "N/A";
        windDirectionSpan.textContent = "N/A";
        uvIndexSpan.textContent = "N/A";
        feelsLikeSpan.textContent = "N/A";
    }
}

// Get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (success) => {
                const { latitude, longitude } = success.coords;
                fetchWeather(latitude, longitude);
            },
            (error) => {
                console.error("Geolocation error:", error);
                latitudeSpan.textContent = "Geolocation not available";
                longitudeSpan.textContent = "Geolocation not available";
                locationSpan.textContent = "Please enable location services";
            }
        );
    } else {
        console.error("Geolocation not supported");
        latitudeSpan.textContent = "Geolocation not supported";
        longitudeSpan.textContent = "Geolocation not supported";
        locationSpan.textContent = "Geolocation not supported by browser";
    }
}

// Initialize app
document.addEventListener("DOMContentLoaded", getLocation);