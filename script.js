
async function getLocInfo() { // return the location information
    try {
        const response = await fetch('http://ip-api.com/json');
        const data = await response.json();
        return {
            ip: data.query,
            country: data.country,
            city: data.city
        }
    } catch (error) {
        console.error('Error fetching IP information:', error);
        return null;
    }
}

async function doit() {
    const locInfo = await getLocInfo();
    document.getElementById("location").innerHTML= `<li>Your location= ${locInfo.city}, ${locInfo.country}</li>`;

    init(locInfo.city, "output");

    }

function init(inputLoc, outputId) {
    const output = $("#" + outputId);
    search(inputLoc, output);

    const searchInput = document.getElementById('search-input');
    const submitButton = document.getElementById('submit');

    submitButton.addEventListener('click', function () {
        const searchLoc = searchInput.value;
        search(searchLoc, output)
    });

    }

function search(keyword, output) {

    output.append($("<div/>").html("Loading..."));
    output.append($("<div/>").addClass("cp-spinner cp-meter"));

    let url =
        "https://api.waqi.info/v2/search/?token=" +
        token() + "&keyword=" + keyword;

    fetch(url)
        .then((x) => x.json())
        .then((result) => {

            output.html("<h3>Search results:</h3>");
            if (!result || result.status != "ok") {
                throw result.data;
            }
            if (result.data.length == 0) {
                output.append("Sorry, there is no result for your search!");
                return;
            }

            var table = $("<table/>").addClass("result");
            table.css({
                border: "1px solid black",  // Add a border
                borderSpacing: "10px",
                margin: "20px",             // Add some margin for spacing
                width: "100%",              // Make the table width 100%
            })

            var aqiInfo = "standardized numerical scale that conveys the level of air pollution in a specific area. providing information about potential health risks associated with various pollutants."
            output.append(table);
            var tr = $("<tr>");
            tr.append($("<td>Station</td>"));
            tr.append($("<td>AQI</td>").attr("title", aqiInfo));


            tr.append($("<td>Time</td>"));
            table.append(tr)

            output.append(
                $("<div/>").html(
                    "Click on any of the station to see the detailed AQI"
                )
            );

            var stationInfo = $("<div/>");
            output.append(stationInfo);

            result.data.forEach(function (station) {
                if(upToDate(station.time.vtime)) { //dispaly only up to date info
                    var tr = $("<tr>");
                    tr.append($("<td>").html(station.station.name));
                    tr.append($("<td>").html(colorize(station.aqi)));
                    tr.append($("<td>").html(station.time.stime.substring(11,16)));
                    tr.on("click", function () {
                        showStation(station, stationInfo);
                    });
                    table.append(tr);
                }
            });
        })
        .catch((e) => {
            output.html("<div class='ui negative message'>" + e + "</div>");
        });
}

function showStation(station, output) {
    output.html("<h2>Pollutants & Weather conditions:</h2>");
    output.append($("<div/>").html("Loading..."));
    output.append($("<div/>").addClass("cp-spinner cp-meter"));

    let url =
        "https://api.waqi.info/feed/@" + station.uid + "/?token=" + token();
    fetch(url)
        .then((x) => x.json())
        .then((result) => {
            output.html("<h2>Pollutants & Weather conditions:</h2>");
            if (!result || result.status != "ok") {
                output.append("Sorry, something wrong happened: ");
                if (result.data) output.append($("<code>").html(result.data));
                return;
            }

            var names = {
                pm25: "PM<sub>2.5</sub>",
                pm10: "PM<sub>10</sub>",
                o3: "Ozone",
                no2: "Nitrogen Dioxide",
                so2: "Sulphur Dioxide",
                co: "Carbon Monoxyde",
                t: "Temperature",
                w: "Wind",
                r: "Rain (precipitation)",
                h: "Relative Humidity",
                dew: "Dew",
                p: "Atmostpheric Pressure",
            };
            var featureInfo = {
                pm25: "Particulate matter with a diameter of 2.5 micrometers or smaller in the air",
                pm10: "Particulate matter with a diameter of 10 micrometers or smaller in the air",
                o3: "A reactive gas formed from pollutants in sunlight, a key component of smog and harmful at ground level.",
                no2: "A reddish-brown gas from combustion processes, linked to respiratory problems and smog formation.",
                so2: "A pungent gas primarily emitted from burning fossil fuels, leading to respiratory issues and acid rain.",
                co: "A colorless, odorless gas produced by incomplete combustion, posing health risks at high levels.",
                t: "The measure of heat in the air, influencing chemical reactions and pollutant behavior.",
                w: "Movement of air that disperses pollutants and can impact their concentrations in different areas.",
                r: "Removes pollutants from the air, cleansing the atmosphere by depositing them on the ground.",
                h: "The amount of water vapor in the air relative to its capacity, affecting chemical reactions and particle behavior.",
                dew: "Water droplets forming on surfaces due to cooling, potentially aiding in capturing airborne pollutants.",
                p: "The weight of the air above, affecting vertical mixing and dispersion of pollutants",
            };

            output.append(
                $("<div>").html(
                    "Station: " +
                    result.data.city.name +
                    " on " +
                    result.data.time.s.substring(11,16)
                )
            );
            output.append($("<div>").html("Hover on any specie for more info"));

            var table = $("<table/>").addClass("result");
            output.append(table);


                for (var specie in result.data.iaqi) {
                var aqi = result.data.iaqi[specie].v;
                var tr = $("<tr>");
                tr.append($("<td>").html(names[specie] || specie).attr("title", featureInfo[specie]));
                tr.append($("<td>").html(colorize(aqi, specie)));
                console.log(specie);

                table.append(tr);
            }
        })
        .catch((e) => {
            output.html("<h2>Sorry, something wrong wrong</h2>" + e);
        });
}

function token() {
    return "548fb7ea32443ec8b103ddc8f837c0c973c37bb0"
}

function colorize(aqi, specie) {
    specie = specie || "aqi";
    if (["pm25", "pm10", "no2", "so2", "co", "o3", "aqi"].indexOf(specie) < 0)
        return aqi;

    var spectrum = [
        { a: 0, b: "#cccccc", f: "#ffffff" },
        { a: 50, b: "#009966", f: "#ffffff" },
        { a: 100, b: "#ffde33", f: "#000000" },
        { a: 150, b: "#ff9933", f: "#000000" },
        { a: 200, b: "#cc0033", f: "#ffffff" },
        { a: 300, b: "#660099", f: "#ffffff" },
        { a: 500, b: "#7e0023", f: "#ffffff" },
    ];

    var i = 0;
    for (i = 0; i < spectrum.length - 2; i++) {
        if (aqi == "-" || aqi <= spectrum[i].a) break;
    }
    return $("<div/>")
        .html(aqi)
        .css("font-size", "120%")
        .css("min-width", "30px")
        .css("text-align", "center")
        .css("background-color", spectrum[i].b)
        .css("color", spectrum[i].f);
}

function upToDate(vtime) { //returns True it the vtime is today or yesterday

    const today = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const oneDayInSeconds = 24 * 60 * 60; // Number of seconds in a day

    // Calculate the Unix timestamp for the start of today and yesterday
    const startOfToday =  (today % oneDayInSeconds);
    const startOfYesterday = startOfToday - oneDayInSeconds;

    // Check if the provided vtime falls within today or yesterday
    if (vtime >= startOfYesterday && vtime <= startOfToday) {
        return false;
    } else {
        return true;
    }
}

$(document).ready(function() {
    doit();
})
