//const server = "http://localhost:9090";
var mRequestCount = 0;

//const server = "http://ras.technomediasoft.com:8080";

const server = "http://167.88.173.75:8080"; // faster

const baseUrl = server + "/RouteAlertServer4p0/login?source=gvl&v_id=";

var selectedRouteUrl = "";
var timerInterval = 20; // default monitor every 10 seconds
var mTimeoutId;

startMonitoring();

//----------------------------------------------------------------------------------------------------

function startMonitoring() {
  showToast("Welcome to RouteAlert Server Admin");

  document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from the JSON endpoint
    fetch(server + "/RouteAlertServer4p0/login?source=heartbeat&option=-4") // list of vehicles
      .then((response) => response.json())
      .then((data) => populateDropdown(data))
      .catch((error) => console.error("Error fetching data:", error));
  });

  checkSmsBalanceOfRouteMobile();

  heartBeatStarted = true;

  document.getElementById("timerInterval").innerText = timerInterval;

  doHeartbeat();

  var serverNameContainer = document.getElementById("server-name-container");
  serverNameContainer.innerText = "Server : " + server;
}

function checkSmsBalanceOfRouteMobile() {
  const baseUrl = server + "/RouteAlertServer4p0/login?source=sms_balance";

  console.log(baseUrl);
  fetch(baseUrl)
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      var resultContainer = document.getElementById("sms-container");
      if (resultContainer) {
        resultContainer.innerText = data;

        showToast(data);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function openStatisticsPage() {
  //window.location.href = server + '/ra/admin.html';

  window.open(server + "/ra/admin.html", "_blank");
}

function populateDropdown(data) {
  console.log(data);

  var select = document.getElementById("routes");

  // Clear existing options
  select.innerHTML = "";

  // Add options from the JSON data
  data.forEach((route) => {
    var option = document.createElement("option");
    option.value = route.id; // Assuming 'id' is the property containing the value
    option.text = route.name; // Assuming 'name' is the property containing the text
    select.appendChild(option);
    updateSelectedRoute();
  });
}

function updateSelectedRoute() {
  var selectedRouteId = document.getElementById("routes").value;
  selectedRouteUrl = baseUrl + selectedRouteId;

  document.getElementById("url-container").innerText = selectedRouteUrl;
}

function openSelectedRoute() {
  window.open(selectedRouteUrl, "_blank");
}

function shareOnWhatsApp() {
  // You can customize this function to create a WhatsApp share link
  //
  var encodedUrl = encodeURIComponent(selectedRouteUrl);
  window.open("https://api.whatsapp.com/send?text=" + encodedUrl, "_blank");
}

function copyURL() {
  navigator.clipboard
    .writeText(selectedRouteUrl)
    .then(() => {
      //showToast( "Copied URL to clipboard: " + selectedRouteUrl );
      alert("Copied URL to clipboard: " + selectedRouteUrl);
    })
    .catch((err) => {
      showToast("Couldnt Copy URL to clipboard: " + selectedRouteUrl);
      console.error("Unable to copy URL to clipboard", err);
    });
}

function restartServer() {
  var resultContainer = document.getElementById("result-container");
  if (!resultContainer) {
    console.error("Result container not found.");
    return;
  }

  // Ask for confirmation before restarting
  var confirmRestart = confirm(
    "Are you sure you want to restart the RouteAlert Server?"
  );
  if (confirmRestart) {
    showToast("Restarting RouteAlert Server");

    fetch(
      server +
        "/RouteAlertServer4p0/login?source=restart_server&source=html&option=1"
    )
      .then((response) => response.text())
      .then((data) => {
        resultContainer.innerText = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function executeAction() {
  var action = document.getElementById("action").value;
  fetch(
    server + "/RouteAlertServer4p0/login?source=parent_app&option=" + action
  )
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("parent-app-container").innerText = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function doHeartbeat() {
  //console.log( "set Interval calling :' +  server + '/RouteAlertServer4p0/login?source=heartbeat" );

  timerInterval = document.getElementById("timerInterval").value * 1000; // Convert to milliseconds

  mRequestCount++;

  fetch(server + "/RouteAlertServer4p0/login?source=heartbeat&option=-1")
    .then((response) => response.text())
    .then((data) => {
      //console.log( "setInterval data: " + data );

      parseServerStatus(data);

      /*                    
             // Parse the integer value from the response
             var integerValue = parseInt(data);

             // Check if the value exceeds a limit
             if (integerValue > 100) {
                 document.getElementById("alert-container").innerText = "Alert: Value exceeds limit!";
                 // You can add additional logic for sound and flashing text here
             } else {
                 document.getElementById("alert-container").innerText = "";
             }
*/
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  if (heartBeatStarted == true)
    mTimeoutId = setTimeout(doHeartbeat, timerInterval);
}

function doStopHeartbeat() {
  clearTimeout(mTimeoutId);

  heartBeatStarted = false;

  showToast("Stopping Heartbeat");

  //var resultContainer = document.getElementById("result-container");

  //resultContainer.innerText = "Heartbeat has been stopped";
}

function doStartHeartbeat() {
  heartBeatStarted = true;
  //var resultContainer = document.getElementById("result-container");
  //resultContainer.innerText = "";

  showToast("Starting Heartbeat");
  doHeartbeat();
}

function doGarbageCollection() {
  const baseUrl =
    server + "/RouteAlertServer4p0/login?source=heartbeat&option=2";

  console.log(baseUrl);
  fetch(baseUrl)
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      var resultContainer = document.getElementById("result-container");
      if (resultContainer) {
        resultContainer.innerText = data;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function parseServerStatus(jsonData) {
  try {
    var serverStatus = JSON.parse(jsonData);
    var resultContainer = document.getElementById("result-container");

    var accessRequestDifference =
      serverStatus.server_access_count - serverStatus.request_completed_count;

    /*     resultContainer.innerHTML = "Request Number : " + mRequestCount + "\n";

    resultContainer.innerHTML +=
      "<p>VLH Queue Size: " + serverStatus.vlh_queue_size;
    resultContainer.innerHTML +=
      "\nUser Request: " +
      serverStatus.server_access_count +
      " Completed: " +
      serverStatus.request_completed_count +
      " [Diff: " +
      accessRequestDifference +
      "]" +
      "</br>Server Start Time : " +
      serverStatus.server_start_time +
      "</br>Current Time      : " +
      serverStatus.current_time +
      "</br>Thread Count      : " +
      serverStatus.thread_count +
      "</br>Peak Thread Count : " +
      serverStatus.peak_thread_count +
      "</br>Total Thread Count: " +
      serverStatus.total_thread_started_count +
      "</br>Gps Update Time   : " +
      serverStatus.gps_recent_update_time +
      "</br>Memory Used       : " +
      serverStatus.memory_used +
      "</br>Total Alerts Sent : " +
      serverStatus.total_alerts_sent +
      "</p>";

    showToast("Request Number " + mRequestCount); */

    // Create table to display data
    let table = `<table border="1" cellpadding="10" cellspacing="1">

<tr><td>Request Number</td><td>${mRequestCount}</td></tr>
<tr><td>VLH Queue Size</td><td>${serverStatus.vlh_queue_size}</td></tr>
<tr><td>User Request</td><td>${serverStatus.server_access_count}</td></tr>
<tr><td>Completed</td><td>${serverStatus.request_completed_count}</td></tr>
<tr><td>Difference (Access - Completed)</td><td>${accessRequestDifference}</td></tr>
<tr><td>Server Start Time</td><td>${serverStatus.server_start_time}</td></tr>
<tr><td>Current Time</td><td>${serverStatus.current_time}</td></tr>
<tr><td>Thread Count</td><td>${serverStatus.thread_count}</td></tr>
<tr><td>Peak Thread Count</td><td>${serverStatus.peak_thread_count}</td></tr>
<tr><td>Total Thread Count</td><td>${serverStatus.total_thread_started_count}</td></tr>
<tr><td>GPS Update Time</td><td>${serverStatus.gps_recent_update_time}</td></tr>
<tr><td>Memory Used</td><td>${serverStatus.memory_used}</td></tr>
<tr><td>Total Alerts Sent</td><td>${serverStatus.total_alerts_sent}</td></tr>
</table>`;

    resultContainer.innerHTML = table;

    showToast("Request Number " + mRequestCount);

    // Check conditions
    if (serverStatus.vlh_queue_size > 50) {
      resultContainer.innerHTML +=
        "<p>Vlh Queue Size exceeds 50. Playing audio and invoking URL to restart server.</p>";
      playAudioAlert();
      invokeRestartServerURL();
    }

    //alert( accessRequestDifference );
    if (accessRequestDifference > 10) {
      resultContainer.innerHTML +=
        "<p>Access-Request difference exceeds 10. Playing audio and invoking URL.</p>";
      playAudioAlert();
      invokeCustomURL();
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
    resultContainer.innerHTML =
      "<p>Error parsing JSON. Please enter valid JSON data.</p>";
  }
}

function playAudioAlert() {
  var audioAlert = document.getElementById("audioAlert");
  audioAlert.play();
}

// check the usage. not used probably
function invokeRestartServerURL() {
  var resultContainer = document.getElementById("result-container");
  if (!resultContainer) {
    console.error("Result container not found.");
    return;
  }

  // Ask for confirmation before restarting
  var confirmRestart = confirm(
    "Are you sure you want to restart the RouteAlert Server?"
  );
  if (confirmRestart) {
    showToast("Restarting RouteAlert Server");

    fetch(
      server +
        "/RouteAlertServer4p0/login?source=restart_server&source=html&option=1"
    )
      .then((response) => response.text())
      .then((data) => {
        resultContainer.innerText = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function invokeCustomURL() {
  // Add logic to invoke a custom URL
  console.log("Invoking custom URL...");
}

function showToast(message) {
  const toastElement = document.getElementById("toast");

  // Display the toast
  toastElement.innerText = message;
  toastElement.style.display = "block";

  // Hide the toast after 3 seconds (adjust as needed)
  setTimeout(() => {
    toastElement.style.display = "none";
  }, 3000);
}

function checkTomcat() {
  showToast("Opening Tomcat: " + server);
  window.open(server);
}

function checkWebServer() {
  showToast("Opening Server: " + server + "/RouteAlertServer4p0/login.html");
  window.open(server + "/RouteAlertServer4p0/login.html");
}
