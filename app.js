// Step 1: Add your API key
const apiKey = "6d28349a1ffa9935d813a7cc4b1bde01";

// Step 2: Choose a city
const city = "London";

// Step 3: Create API URL
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

// // Step 4: Fetch weather data
// axios.get(url)
//   .then(function(response) {

//     // Step 5: Get data from response
//     const data = response.data;

//     // Step 6: Update HTML elements
//     document.getElementById("city").textContent = data.name;
//     document.getElementById("temperature").textContent =
//       "Temperature: " + data.main.temp + "°C";
//     document.getElementById("description").textContent =
//       data.weather[0].description;

//     const iconCode = data.weather[0].icon;
//     document.getElementById("icon").src =
//       `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

//   })

//   .catch(function(error) {
//     console.log("Error:", error);
//   });

//   function getWeather(city) {
//     axios.get(url)
//         .then(function(response) {
//             displayWeather(response.data);
//         })
//         .catch(function(error) {
//             console.error(error);
//         });
// }

// async function getWeather(city) {
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
//     try {
//         const response = await axios.get(url);
//         console.log(response);
//         displayWeather(response.data);
//     } catch (error) {
//         console.error(error);
//         showError(error);
//     }
// }
// const API_KEY = "4e7543eb6379f76c64e49012131267f1";
// const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDisplay = document.getElementById("weather-container");

/* =========================
   🌤 GET WEATHER (ASYNC/AWAIT)
========================= */
async function getWeather(city) {
    showLoading();

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    // ✅ Fixed: use backticks for template literal
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        console.log(response);
        displayWeather(response.data);

    } catch (error) {
        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            showError("City not found. Please check the spelling.");
        } else if (error.response && error.response.status === 401) {
            showError("Invalid API key. Please check your credentials.");
        } else {
            showError("Something went wrong. Please try again.");
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

function displayWeather(data) {
    // ✅ Added fallback checks to avoid breaking if data is incomplete
    const temp = data.main?.temp ?? "N/A";
    const description = data.weather?.[0]?.description ?? "No description available";
    const icon = data.weather?.[0]?.icon ?? "01d";

    const weatherHTML = `
        <h2>${data.name}</h2>
        <p>🌡 Temperature: ${temp}°C</p>
        <p>🌥 ${description}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
    `;

    weatherDisplay.innerHTML = weatherHTML;
    cityInput.focus();
}

/* =========================
   ❌ ERROR HANDLING
========================= */
function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <h3>⚠️ Oops!</h3>
            <p>${message}</p>
        </div>
    `;
    weatherDisplay.innerHTML = errorHTML;
}

/* =========================
   ⏳ LOADING STATE
========================= */
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
    weatherDisplay.innerHTML = loadingHTML;
}

/* =========================
   🔎 SEARCH FUNCTIONALITY
========================= */
function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("City name is too short.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

/* =========================
   🌟 WELCOME MESSAGE
========================= */
weatherDisplay.innerHTML = `
    <div class="welcome-message">
        <h3>🌤 Welcome!</h3>
        <p>Enter a city name to get started.</p>
    </div>
`;