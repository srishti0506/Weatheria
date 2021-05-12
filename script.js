let update = {

  cityName: "",

  displayWeather: function (data) {
    
    const { name } = data;
    const { icon, description, main } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;
    const { deg } = data.wind;
    this.cityName = name;

    document.querySelector(".city").innerText = "" + name;
    document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description;
    
    document.querySelector(".temp").innerText = temp + "°C";

    document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
    document.querySelector(".wind").innerText = "Wind speed: " + speed + " km/h";
    
    let dir; // setting direction according to the angle of the wind
    if(deg>348.75 || deg<=11.25)dir = "N";
    else if(deg>11.25 && deg<=33.75)dir = "NNE";
    else if(deg>33.75 && deg<=56.25)dir = "NE";
    else if(deg>56.25 && deg<=78.75)dir = "ENE";
    else if(deg>78.75 && deg<=101.25)dir = "E";
    else if(deg>101.25 && deg<=123.75)dir = "ESE";
    else if(deg>123.75 && deg<=146.25)dir = "SE";
    else if(deg>146.25 && deg<=168.75)dir = "SSE";
    else if(deg>168.75 && deg<=191.25)dir = "S";
    else if(deg>191.25 && deg<=213.75)dir = "SSW";
    else if(deg>213.75 && deg<=236.25)dir = "SW";
    else if(deg>236.25 && deg<=258.75)dir = "WSW";
    else if(deg>258.75 && deg<=281.25)dir = "W";
    else if(deg>281.25 && deg<=303.75)dir = "WNW";
    else if(deg>303.75 && deg<=326.25)dir = "NW";
    else if(deg>326.25 && deg<=248.75)dir = "NNW";

    document.querySelector(".wind-dir").innerText = "Wind Direction: " + dir + "("+ deg + "°"+")";

    document.querySelector(".weather").classList.remove("loading");


    let imgSrc = "";
    if (main === "Thunderstorm") imgSrc = "./Images/thunder.png";
    else if (main === "Drizzle" || main === "Rain") imgSrc = "./Images/rain.png";
    else if (main === "Snow" || temp < 0) imgSrc = "./Images/snow.png";
    else if (temp < 22) imgSrc = "./Images/winter.png";
    else if (temp >= 22) imgSrc = "./Images/clearSky.png";

    document.getElementById("wearing").src = imgSrc;

    //document.body.style.backgroundImage =
    //"url('https://source.unsplash.com/1600x900/?" + name + "')";
  },
  search: function () {

    let place = document.querySelector(".search-bar").value;
    weather.fetchWeather(place);
  },
  loading: function(){
    document.getElementById("weather-cloth").innerHTML = "Loading...";
  }
}

let weather = {
  apiKey: "89830c36ae5b21f4de1a7ac42ad3e349",

  daysOfWeek: ["Sun", "Mon", "Tues", "Wed", "Thrs", "Fri", "Sat"],

  monthOfYears: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],

  // lat and lon of the searched place
  // fetchWeatherDaily and fetchWeatherHourly works with lat and lon
  posLat: 0,
  posLon: 0,


  fetchAPI: async function (link) {
    let response = await fetch(link);
    let json = await response.json();
    return json;
  },

  fetchWeatherDaily: async function (city) {
    let _xlabels = []; // Ticks for the x axiz
    let _ylabels = []; // data to be plotted
    let _icons = []; // icon for data point
    let _temp = []; // details
    let _description = []; // details


    let data = await this.fetchAPI("https://api.openweathermap.org/data/2.5/onecall?lat=" + this.posLat + "&lon=" + this.posLon + "&exclude=current,minutely,hourly&units=metric&appid=" + this.apiKey);
    
    
    for (let i = 0; i < data.daily.length; ++i) {
      let dt = new Date(data.daily[i].dt * 1000);
      _xlabels.push(((dt.getDate() < 10) ? ('0' + dt.getDate()) : (dt.getDate())) + " " + this.monthOfYears[dt.getMonth()] + ", " + this.daysOfWeek[dt.getDay()]);
      _ylabels.push(data.daily[i].temp.day);
      _temp.push(data.daily[i].temp);
      _description.push(data.daily[i].weather[0].description);
      let img = new Image();
      let { icon } = data.daily[i].weather[0]
      img.src = "https://openweathermap.org/img/wn/" + icon + ".png";
      _icons.push(img);
    }

    return { xlabels: _xlabels, ylabels: _ylabels, pntIcons: _icons, details: { temp: _temp, description: _description } };


  },

  fetchWeatherHourly: async function (city) {
    let _xlabels = [];
    let _ylabels = [];
    let _description = []; // details

    let data = await this.fetchAPI("https://api.openweathermap.org/data/2.5/onecall?lat=" + this.posLat + "&lon=" + this.posLon + "&exclude=current,minutely,daily&units=metric&appid=" + this.apiKey);
    console.log(data);
    for (let i = 0; i < data.hourly.length; ++i) {

      let temp = new Date(data.hourly[i].dt * 1000);
      let hrs = temp.getHours();
      let mins = temp.getMinutes();

      if (hrs < 10) hrs = "0" + hrs;
      if (mins < 10) mins = "0" + mins;
      _xlabels.push(hrs + ":" + mins + ", " + ((temp.getDate() < 10) ? ('0' + temp.getDate()) : (temp.getDate())) + " " + this.monthOfYears[temp.getMonth()]);
      _ylabels.push(data.hourly[i].temp);
      _description.push(data.hourly[i].weather[0].description);

    }
    return { xlabels: _xlabels, ylabels: _ylabels, details: { description: _description } };

  },


  fetchWeather: function (city) {
    let gotIt = false;
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + this.apiKey
    )
    .then((response) => {
      if (!response.ok) {
        alert("No weather found.");
        throw new Error("No weather found.");
      }
      return response.json();
    })
    .then((data) => {
      const { lat, lon } = data.coord;
      this.posLat = lat; 
      this.posLon = lon;
      $("#loading-info").hide(); // when fetch request completes hide Loading....
      update.displayWeather(data);
      $(".loaded").show(); // show the info and update it
    });

    $(".loaded").hide(); // to hide the info of the previous search when searching a new place
    $("#loading-info").show(); // to show Loading.... while the fetch request is going on

  }
};


function generateGraphContainer(graphID){
  let mainContainer = document.getElementById("chartBase");

  let chartContainer = document.createElement("div");

  chartContainer.className = "chart-container";
  chartContainer.style.marginTop = "20px";
  chartContainer.style.marginBottom = "20px";
  chartContainer.style.width = "1100px";

  let graphCanvas = document.createElement("canvas");
  graphCanvas.id = graphID;
  graphCanvas.className = "chart";
  graphCanvas.setAttribute("aria-label","Hello ARIA World");
  graphCanvas.setAttribute("role","img");
  graphCanvas.setAttribute("align","center");
  graphCanvas.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
  graphCanvas.style.display = "none";

  let brk = document.createElement("br");

  chartContainer.appendChild(graphCanvas);
  mainContainer.appendChild(chartContainer);
  mainContainer.appendChild(brk);

  return graphCanvas;

}



async function generateGraphs(place) {

  let plots = await weather.fetchWeatherDaily(place);
  //let d_graphEle = document.getElementById('chart-day');
  let d_graphEle = generateGraphContainer("chart-day");

  let customTooltip = function (context, customData) { // tooltip thats need to be bind with data points
    let info = "";
    let idx = context.parsed.x;
    info += "Description: " + customData.description[idx] + "\n";
    info += "Max: " + customData.temp[idx].max + '\xB0' + 'C\n';
    info += "Min: " + customData.temp[idx].min + '\xB0' + 'C\n';
    info += "Morning: " + customData.temp[idx].morn + '\xB0' + 'C\n';
    info += "Evening: " + customData.temp[idx].eve + '\xB0' + 'C\n';
    info += "Night: " + customData.temp[idx].night + '\xB0' + 'C';
    return info;
  }
  
  let day_graph = graph(d_graphEle, plots, 
  	{ borderColor: 'rgba(255,255,0,1)', backgroundColor: 'rgba(195,50,255,1)', pntStyle: plots.pntIcons, radius: 15 }, 
  	{ x: 'Days', y: 'Temperature in °C', graphTitle: '  Daily Temperature' }, 
  	{ tooltipFunc: customTooltip, tooltipData: plots.details });




  plots = await weather.fetchWeatherHourly(place);
  // let h_graphEle = document.getElementById('chart-hr');
  let h_graphEle = generateGraphContainer("chart-hr");

  customTooltip = function (context, customData) {
    let info = "";
    let idx = context.parsed.x;
    info += "Description: " + customData.description[idx];
    return info;
  }
  let hr_graph = graph(h_graphEle, plots, { borderColor: '#0E4068', backgroundColor: 'rgba(255, 99, 132, 0.2)', pntStyle: 'circle', radius: 4 }, { x: 'Time (24hrs)', y: 'Temperature in °C', graphTitle: '  Hourly Temperature' }, { tooltipFunc: customTooltip, tooltipData: plots.details });

  return true;
}

function graph(ctx, plots, styling, title, tooltipContent) {
  let showTicks = true;
  let showGrid = false;
  let gridColor = 'rgba(0,0,0,1)';
  Chart.defaults.font.size = 16;
  Chart.defaults.borderColor = 'rgba(0,0,0,1)';

  let myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: plots.xlabels,
      datasets: [{
        label: title.graphTitle,
        data: plots.ylabels,
        fill: false,
        backgroundColor: styling.backgroundColor,
        borderColor: styling.borderColor,
        borderWidth: 3,
        lineTension: 0.1,
        pointRadius: styling.radius,
        pointStyle: styling.pntStyle,
        type: 'line'
      }]
    },
    options: {
      plugins: {
        legend: {

          labels: {
            usePointStyle: true,
            color: gridColor
          }
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              
              var label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + '\xB0' + 'C';
              }
              return label;
            },

            afterLabel: function (context) {
              if (tooltipContent) return tooltipContent.tooltipFunc(context, tooltipContent.tooltipData);
            }


          }
        }
      },
      scales: {
        // Styling of x Axis
        x: {
          grid: {
            display: showTicks, // display the x grids or not
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
            drawOnChartArea: showGrid
          },
          title: {
            display: true,
            text: title.x,
            color: gridColor
          },
          ticks: {
            color: gridColor,
            // align: 'start',
            padding: 10

          }
        },
        //  Styling of y Axis
        y: {
          weight: 10,
          grid: {
            display: showTicks, // display the y grids or not
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: gridColor,
            drawOnChartArea: showGrid
          },
          title: {
            display: true,
            text: title.y,
            color: gridColor
          },
          ticks: {
            color: gridColor,
            padding: 10
          }
        }
      }
    }
  });
  ctx.style.display = "block";
  return myChart;
}


document.querySelector(".search button").addEventListener("click", function(){
  document.getElementById("chartBase").innerText = "";
  update.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function(event){
  if (event.key == "Enter"){
    document.getElementById("chartBase").innerText = "";
    update.search();
  }
});

document.getElementById("ShowHide").addEventListener("click", function(){
  let container = document.getElementById("chartBase");
  if(container.innerHTML === ""){
    container.style.display = "flex";
    generateGraphs(update.cityName).then(function(response){
      document.getElementById("graph-loading").innerHTML = "";
      container.scrollIntoView({behavior: 'smooth'});
    });
    document.getElementById("graph-loading").innerHTML = "Loading...";
  }
  else{
    $("#chartBase").toggle();
    container.scrollIntoView({behavior: 'smooth'});
  }

});
weather.fetchWeather("Chandigarh");