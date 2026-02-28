function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    // Existing DOM references
    this.cityInput = document.getElementById("cityInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.weatherContainer = document.getElementById("weather-container");

    // 🔹 New DOM references for recent searches
    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");

    // 🔹 Initialize recent searches array
    this.recentSearches = [];

    // 🔹 Set maximum number of recent searches to save
    this.maxRecentSearches = 5;

    this.init();
}

// 🔹 Initialize App
WeatherApp.prototype.init = function () {
    // Existing event listeners
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
    this.cityInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    }.bind(this));

    // Load recent searches
    this.loadRecentSearches();

    // Load last searched city
    this.loadLastCity();

    // 🔹 Add clear history button listener
    const clearBtn = document.getElementById("clear-history-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", this.clearHistory.bind(this));
    }
};

// 🔹 Welcome Message (Enhanced)
WeatherApp.prototype.showWelcome = function () {
    const welcomeHTML = `
        <div class="welcome-message">
            🌤️ <h2>Welcome to WeatherApp</h2>
            <p>Search for a city to get started!</p>
            <p><em>Try: London, Paris, Tokyo</em></p>
        </div>
    `;
    this.weatherContainer.innerHTML = welcomeHTML;
};

// 🔹 Handle Search
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        this.showError("City name too short.");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

// 🔹 Save Recent Search
WeatherApp.prototype.saveRecentSearch = function (city) {
    // Convert to title case for consistency
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Remove if already exists
    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    // Add to front
    this.recentSearches.unshift(cityName);

    // Limit to maxRecentSearches
    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    // Save to localStorage
    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));

    // Update display
    this.displayRecentSearches();
};

// 🔹 Display Recent Searches
WeatherApp.prototype.displayRecentSearches = function () {
    // Clear existing buttons
    this.recentSearchesContainer.innerHTML = "";

    // If no recent searches, hide the section
    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = "none";
        return;
    }

    // Show the section
    this.recentSearchesSection.style.display = "block";

    // Create a button for each recent search
    this.recentSearches.forEach(function(city) {
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;

        // Add click handler
        btn.addEventListener("click", function() {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};

// 🔹 Load Recent Searches from localStorage
WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem("recentSearches");

    if (saved) {
        this.recentSearches = JSON.parse(saved);
    }

    this.displayRecentSearches();
};

// 🔹 Load Last City from localStorage
WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        this.showWelcome();
    }
};

// 🔹 Clear History Method
WeatherApp.prototype.clearHistory = function() {
    if (confirm("Clear all recent searches?")) {
        this.recentSearches = [];
        localStorage.removeItem("recentSearches");
        this.displayRecentSearches();
    }
};

// 🔹 Fetch Current Weather + Forecast
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const forecastUrl = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl)
        ]);

        this.displayWeather(currentRes.data);
        this.displayForecast(forecastRes.data);

        // 🔹 Save this successful search to recent searches
        this.saveRecentSearch(city);

        // 🔹 Save as last searched city
        localStorage.setItem("lastCity", city);

    } catch (error) {
        console.error("Error:", error);
        if (error.response && error.response.status === 404) {
            this.showError("City not found. Please check spelling and try again.");
        } else {
            this.showError("Something went wrong. Please try again later.");
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";
    }
};

// 🔹 Display Current Weather
WeatherApp.prototype.displayWeather = function (data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherContainer.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${iconUrl}" />
        <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C</p>
        <p>${data.weather[0].description}</p>
    `;
};

// 🔹 Process Forecast Data (Pick 12:00 PM entries)
WeatherApp.prototype.processForecastData = function (data) {
    const filtered = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    return filtered.slice(0, 5);
};

// 🔹 Display 5-Day Forecast
WeatherApp.prototype.displayForecast = function (data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(day.main.temp);
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" />
                <p>${temp}°C</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    }).join("");

    const forecastSection = `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    this.weatherContainer.innerHTML += forecastSection;
};

// 🔹 Show Loading
WeatherApp.prototype.showLoading = function () {
    this.weatherContainer.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather data...</p>
        </div>
    `;
};

// 🔹 Show Error
WeatherApp.prototype.showError = function (message) {
    this.weatherContainer.innerHTML = `
        <div class="error-message">
            ❌ ${message}
        </div>
    `;
};

// 🔹 Create App Instance
const app = new WeatherApp(CONFIG.API_KEY);