let html = document.querySelector("html");
let search = document.querySelector("#search ");
let btnSearch = document.querySelector(".search label");

let iconeSearch = document.querySelector(".icone-search");
let placeName = document.querySelector(".intro-box h1");
let timeForPosition = document.querySelector(".intro-box span");
let introBox = document.querySelector(".intro-box ");
let hOne = document.querySelector(".intro-box .num");
let daily = document.querySelectorAll(".daily-box h2");
let spanOne = document.querySelectorAll(".daily-box .one");

let spanTwo = document.querySelectorAll(".daily-box .two");

let apparent = document.querySelector(" .apparent");
let Humidity = document.querySelector(".Humidity");
let wind = document.querySelector(".wind");
let precipitation = document.querySelector(".precipitation");
let hourSpan = document.querySelectorAll(".hour");
let degSpan = document.querySelectorAll(".deg");
let day = document.querySelector("#day");
let box = document.querySelectorAll(".box");
let dailybox = document.querySelectorAll(".daily-box");

let p = document.querySelectorAll("p");
let span = document.querySelectorAll("span");
let h1 = document.querySelectorAll("h1");
let h2 = document.querySelectorAll("h2");
let h3 = document.querySelectorAll("h3");
let forecast = document.querySelector(".forecast");
let forecastLis = document.querySelectorAll(".forecast li");

html.addEventListener("click", (e) => {
  if (e.target.classList.contains("search-on")) {
    iconeSearch.style.display = "none";
  } else {
    iconeSearch.style.display = "block";
  }
});
let weatherDataObj = {};
let newLatitude;
let newLongitude;
let newCountry;
let newName;

async function getWeatherForCity(cityName) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}`
  );
  const geoData = await geoRes.json();
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("City not found");
  }

  const { latitude, longitude, country, name } = geoData.results[0];

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,apparent_temperature&current=temperature_2m,is_day&timezone=Africa/Cairo`
  );
  const weatherData = await weatherRes.json();
  let now = new Date();
  let formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  let parts = formatter.format(now).replace(" ", "T").slice(0, 13);
  let part = now.getHours();

  let index = weatherData.hourly.time.findIndex((t) => t.startsWith(parts));

  weatherDataObj = {
    latitudeForPosition: latitude,
    longitudeForPosition: longitude,
    countryForPosition: country,
    nameForPosition: name,
    temperature: weatherData.current.temperature_2m,
    FeelsLikes: weatherData.hourly.apparent_temperature[index],
    humidity: weatherData.hourly.relative_humidity_2m[index],
    wind: weatherData.hourly.wind_speed_10m[index],
    precipitation: weatherData.hourly.precipitation[index],
    hourlyTemperature: weatherData.hourly.temperature_2m,
    dailyTemperatureMax: weatherData.daily.temperature_2m_max,
    dailyTemperatureMin: weatherData.daily.temperature_2m_min,
    Index: index,
    Hour: Number(part),
  };

  localStorage.setItem("data", JSON.stringify(weatherDataObj));

  return weatherData;
}

window.addEventListener("DOMContentLoaded", (e) => {
  const saved = JSON.parse(localStorage.getItem("data"));
  if (saved) time(saved.nameForPosition);
  let date = new Date().getHours();
  if (date >= 12) {
    introBox.style = `
      background-image: url(../images/moon.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
    `;
  } else if (date < 12) {
    introBox.style = `
      background-image: url(../images/sunny.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
    `;
  }
  btnSearch.onclick = (e) => {
    setData();
  };
});

function setData() {
  const query = search.value;
  if (query.length < 2) {
    return;
  }
  time(query);
}
function time(queryParm) {
  getWeatherForCity(queryParm)
    .then((data) => {
      let latestSaved = JSON.parse(localStorage.getItem("data"));
      placeName.textContent = `${latestSaved.nameForPosition},${latestSaved.countryForPosition}`;
      hOne.textContent = `${Number(latestSaved.temperature).toFixed()} °`;
      apparent.textContent = `${latestSaved.FeelsLikes} °`;
      Humidity.textContent = `${latestSaved.humidity} %`;
      wind.textContent = `${latestSaved.wind} km/h`;
      precipitation.textContent = `${latestSaved.precipitation} mm`;
      timeForToday();

      spanOne.forEach((element, i) => {
        element.textContent = ` ${Number(
          latestSaved.dailyTemperatureMax[i]
        ).toFixed()}°`;
      });
      spanTwo.forEach((element, i) => {
        element.textContent = `${Number(
          latestSaved.dailyTemperatureMin[i]
        ).toFixed()}°`;
      });

      const history = new Date().getDay();
      const dayArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat "];
      const weekDay = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday ",
      ];

      daily.forEach((el, i) => {
        let dayIndex = (history + i) % 7;
        el.textContent = dayArr[dayIndex];
      });

      let date = new Date(data.current.time);
      const options = {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      let time = date.toLocaleDateString("en-US", options);
      let today = date.toLocaleDateString("en-US", { weekday: "long" });
      let indexDay = weekDay.findIndex((e) => {
        return e.includes(today);
      });

      timeForPosition.textContent = time;
      day.selectedIndex = indexDay;
    })
    .catch((err) => console.error(err));
}

function timeForDay(dayIndex) {
  let latestSaved = JSON.parse(localStorage.getItem("data"));

  let startIndex = dayIndex * 24;

  degSpan.forEach((e, i) => {
    let module = (startIndex + i) % 168;
    e.textContent = ` ${Number(
      latestSaved.hourlyTemperature[module]
    ).toFixed()}° `;
  });

  hourSpan.forEach((e, i) => {
    let hour = i % 24;
    let suffix = hour >= 12 ? "PM" : "AM";
    let displayHour = hour % 12 || 12;
    e.textContent = `${displayHour} ${suffix}`;
  });
}

function timeForToday() {
  let latestSaved = JSON.parse(localStorage.getItem("data"));
  degSpan.forEach((e, i) => {
    let module = (latestSaved.Index + i) % 168;
    e.textContent = ` ${Number(
      latestSaved.hourlyTemperature[module]
    ).toFixed()}° `;
  });
  hourSpan.forEach((e, i) => {
    let hours = `${Number(latestSaved.Hour) + i}`;
    let suffix = hours >= 12 ? "PM" : "AM";
    let displayHour = hours % 12 || 12;
    e.textContent = `${displayHour} ${suffix}`;
  });
}
day.addEventListener("change", (e) => {
  let now = new Date().getDay();
  let selectedDay = Number(e.target.value);
  if (selectedDay === now) {
    timeForToday();
  } else {
    timeForDay(selectedDay);
  }
});

//start mode dark and light
let selectChange = document.getElementById("mode");
let boxMode = document.querySelector(".box-mode");
let body = document.querySelector("body");

let mode = "dark";
selectChange.addEventListener("change", (e) => {
  if (mode === "light") {
    mode = "dark";
    localStorage.setItem("mode", mode);
    selectChange.classList.add("dark-on");
    boxMode.style = ` background-color: #25223f;  `;
    selectChange.style = `background-color: #25223f;`;

    darkMode();
  } else if (mode === "dark") {
    mode = "light";
    localStorage.setItem("mode", mode);
    lightMode();
    boxMode.style = `background-color: #adb1cb;;`;
    selectChange.style = `  background-color: #adb1cb; `;
    selectChange.classList.remove("dark-on");
  }
});

mode = localStorage.getItem("mode") || "dark";
if (mode === "dark") darkMode();

if (mode === "light") {
  selectChange.selectedIndex = 1;
  lightMode();
  boxMode.style = `background-color: #adb1cb;;`;
  selectChange.style = `  background-color: #adb1cb; `;
  selectChange.classList.remove("dark-on");
} else if (mode === "dark") {
  selectChange.selectedIndex = 0;
  darkMode();
  selectChange.style = ` background-color: #25223f;  `;
  boxMode.style = `background-color: #25223f;`;
  selectChange.classList.add("dark-on");
}

function darkMode() {
  body.style.backgroundColor = "#02012b";
  forecast.style.backgroundColor = "#252b43";
  day.style.backgroundColor = "#39375c";
  forecastLis.forEach((element, index) => {
    element.classList.add("active");
    element.style.backgroundColor = "#2f2f49";
  });
  box.forEach((element) => {
    element.style.backgroundColor = "#252b43";
    element.classList.add("active");
  });
  dailybox.forEach((element, index) => {
    element.classList.add("active");
    element.style.backgroundColor = "#252b43";
  });
  degSpan.forEach((element) => {
    element.style.color = "white";
  });
  hourSpan.forEach((element) => {
    element.style.color = "white";
  });
  p.forEach((element) => {
    element.style.color = "white";
  });
  span.forEach((element) => {
    element.style.color = "white";
  });
  h1.forEach((element) => {
    element.style.color = "white";
  });
  h2.forEach((element) => {
    element.style.color = "white";
  });
  h3.forEach((element) => {
    element.style.color = "white";
  });
}
function lightMode() {
  body.style.backgroundColor = "#b4a6a6ff";
  forecast.style.backgroundColor = "#f0f3fa";
  day.style.backgroundColor = "#f0f3fa";
  forecastLis.forEach((element, index) => {
    element.classList.remove("active");
    element.style.backgroundColor = "#f0f3fa";
  });
  box.forEach((element, index) => {
    element.classList.remove("active");
    element.style.backgroundColor = "#f0f3fa";
  });
  dailybox.forEach((element, index) => {
    element.classList.remove("active");
    element.style.backgroundColor = "#f0f3fa";
  });

  degSpan.forEach((element) => {
    element.style.color = "#1c1f28";
  });
  hourSpan.forEach((element) => {
    element.style.color = "#1c1f28";
  });
  p.forEach((element) => {
    element.style.color = "#1c1f28";
  });
  span.forEach((element) => {
    element.style.color = "#1c1f28";
  });
  h1.forEach((element) => {
    element.style.color = "#1c1f28";
  });
  h2.forEach((element) => {
    element.style.color = "#1c1f28";
  });
  h3.forEach((element) => {
    element.style.color = "#1c1f28";
  });
}
// end mode dark and light
