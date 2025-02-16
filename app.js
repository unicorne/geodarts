
function loadJSONP(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = callback;
    document.body.appendChild(script);
  }
  
  
  loadJSONP('locations.js', function() {

    // ###############################################
    // Display functions
    // ###############################################

    function animateHeader(){
        //animate overall score
        var headerScore = document.getElementById('header-overall-score');
        var headerLevelScore = document.getElementById("header-level-score");
 
        var newScore = Math.round(overallScore);
        var oldScore = Math.round(lastScore);

        var newScoreLevel = Math.round(levelScore);
        var oldScoreLevel = Math.round(lastScoreLevel);


        // Set the animation duration (in milliseconds)
        var duration = 500;

        // Set the interval (in milliseconds) at which to update the score
        var interval = 10;


        // Calculate the number of steps and the increment value
        var steps = Math.ceil(duration / interval);
        var increment = (newScore - oldScore) / steps;

        // Create a function to update the score
        function updateScore() {
        // Update the score
            lastScore += increment;
            lastScoreLevel += increment;
            headerScore.innerHTML = "Score: " + Math.round(lastScore);
            headerLevelScore.innerHTML = "Level Score: " + Math.round(lastScoreLevel);

            // Check if we've reached the new score
            if (lastScore >= newScore) {
                // Stop the animation
                clearInterval(animation);

                // Set the final score
                headerScore.innerHTML = "Score: " + newScore;
                headerLevelScore.innerHTML = "Level Score: " + newScoreLevel;
            }
        }

        // Start the animation
        var animation = setInterval(updateScore, interval);
    };

    function displayHeader(){
        //console.log("IN header: " + overallScore + " " + levelScore + " " + scoreNeeded + " " + level)
        //var headerScore = document.getElementById("header-overall-score");
        //headerScore.innerHTML = "Score: " + Math.round(overallScore);
        animateHeader();

        var levelNameHeader = document.getElementById("level_name");
        levelNameHeader.innerHTML = levelName;
        

        //var headerLevelScore = document.getElementById("header-level-score");
        //headerLevelScore.innerHTML = "Level Score: " + Math.round(levelScore);
        var headerScoreNeeded = document.getElementById("header-score-needed");
        headerScoreNeeded.innerHTML = "Score needed: " + scoreNeeded;
        var headerLevel = document.getElementById("header-level");
        var tmp_level = level + 1;
        headerLevel.innerHTML = "Level: " + tmp_level;
        var headerCounter = document.getElementById("header-counter");
        var tmp_counter = counter + 1;
        var tmp_max_counter = counter_needed;
        headerCounter.innerHTML = tmp_counter + "/" + tmp_max_counter;
    }

    function displayTimerText(targetname){
        var timerText = document.getElementById("timer-text");
        timerText.innerHTML = targetname;
    }


    function removeTargetMarker(){
        targetMarker.removeFrom(mymap);
    }

    function showTargetMarker(){
        targetMarker.addTo(mymap);
    }

    // ###############################################
    // Modal functions
    // ###############################################


    async function showModal(score, distance, timeleft){

        animation.pause();

        return new Promise(resolve => {

            // Get the modal
            const modal = document.querySelector('.modal');
            modal.style.display = "flex";

            // Get the scores
            const score1 = document.querySelector('.score1');
            const score2 = document.querySelector('.score2');

            // Get the timer
            const modalScore = document.querySelector('.modal-score');

            // Set the initial scores
            var tmp_distance = Math.round(distance / 1000);
            score1.textContent = "Distance: " + tmp_distance + " km";
            score2.textContent = "Time left: " + timeleft + " s";
            modalScore.textContent = "Score: " + Math.round(score);

            if (distanceLine){
                distanceLine.removeFrom(mymap);
            };
                //console.log("distance line: " + distanceLine);


            // Add a click event listener to the button to close the modal
            const closeButton = document.querySelector('.close-button');
                closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
                nextTarget();
                animation.cancel();
                animation.play();
                resolve();
                });
        });
    }

    function showStartModal(){

        animation.pause();
        // Get the modal
        const modal = document.querySelector('.start-modal');
        modal.style.display = "flex";

        // Get the scores
        const startMessage = document.querySelector('.start-message');


        // Set the initial scores
        startMessage.textContent = "Welcome! You have 10 seconds to guess the location of the city on the map. Click on the map to make your guess. Press the button or f or Enter to submit your guess. Good luck!";


    // Add a click event listener to the button to close the modal
        const closeButton = document.querySelector('.close-button-start');
            closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            animation.cancel();
            animation.play();
        });
    }

    function showLevelModal(level){

        animation.pause();
        // Get the modal
        const modal = document.querySelector('.level-modal');
        modal.style.display = "flex";

        // Get the scores
        const startMessage = document.querySelector('.level-message');

        var tmp_level = level + 2;
        // Set the initial scores
        startMessage.textContent = "Congrats you reached level " + tmp_level + "!";

        // display score reached and needed
        const score_reached = document.querySelector('.score-reached-level');
        score_reached.textContent = Math.round(levelScore);
        const score_needed = document.querySelector('.score-needed-level');
        score_needed.textContent = Math.round(scoreNeeded);


        // Add a click event listener to the button to close the modal
        const closeButton = document.querySelector('.close-button-level');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            animation.cancel();
            animation.play();
        });
    }

    function showGameoverModal(score){

        animation.pause();
        // Get the modal
        const modal = document.querySelector('.game-over-modal');
        modal.style.display = "flex";

        // Get the scores
        const startMessage = document.querySelector('.gameover-message');


        // Set the initial scores
        startMessage.textContent = "Game over you reached " + score + " points!";


        // Add a click event listener to the button to close the modal
        const closeButton = document.querySelector('.close-button-gameover');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            animation.cancel();
            animation.play();
            location.reload();
        });
    }

    // ###############################################
    // Game functions
    // ###############################################

    function calculateDistance(){
        var targetLatLng = targetMarker.getLatLng();
        var draggableLatLng = draggableMarker.getLatLng();
        var distance = targetLatLng.distanceTo(draggableLatLng).toFixed(2);
        return distance;
    }

    function calculateTimeleft() {
        const remaining =  ((10000 - animation.currentTime)/1000).toFixed(2);
        return remaining;
    }

    function calculateScore(distance, timeleft){
        var maxDistance = 20000000;
        var distance_km = distance / 1000;
        var tmp_score = Math.exp(-0.001*(maxDistance-(maxDistance-distance_km)))*6000;
        //var tmp_score = Math.round(tmp_score);
        // convert timeleft to float
        var timeleft = parseFloat(timeleft);
        //console.log(timeleft)
        //console.log(tmp_score)
        tmp_score = tmp_score + 50*timeleft;

        return tmp_score;
    }


    function zoomToTarget(){
        showTargetMarker();
        var targetLatLng = targetMarker.getLatLng();
        var draggableLatLng = draggableMarker.getLatLng();

        // calculate the center of the two markers
        var latLngs = [targetLatLng, draggableLatLng];
        var center = L.latLngBounds(latLngs).getCenter();

        // calculate the appropriate zoom level based on the distance between the markers
        var zoom = mymap.getBoundsZoom(L.latLngBounds(latLngs).pad(0.5), false);

        // set the map view to the center of the markers with the appropriate zoom level
        mymap.flyTo(center, 0.5*zoom);
        //mymap.on('zoomend', function() {
          //  distanceLine = L.polyline([targetLatLng, draggableLatLng], {color: 'red'});
          //  distanceLine.addTo(mymap);
        //});
        //distanceLine = L.polyline([targetLatLng, draggableLatLng], {color: 'red'});
        //distanceLine.addTo(mymap);
    }

    function initialize_level(level){
        // reset level score
        levelScore = 0;
        lastScoreLevel = 0;
        // reset counter
        counter = 0;
        // get counter needed
        counter_needed = locations[level].counter_max;
        // reset score needed
        scoreNeeded = locations[level].score_needed;
        // level name
        levelName = locations[level].level_name;
        displayHeader();
        nextTarget();
    }

    async function updateGameState(tmp_score) {
        // record the guess for this round
        levelGuesses.push({
          guess: draggableMarker.getLatLng(),
          target: targetMarker.getLatLng()
        });
      
        lastScore = overallScore;
        overallScore += tmp_score;
        console.log("overall score: " + overallScore);
        lastScoreLevel = levelScore;
        levelScore += tmp_score;
        counter += 1;
        console.log("counter: " + counter);
      
        if (counter >= counter_needed) {
          // When level is finished, display the level results map
          //await showLevelGuessesMap();

            
      
          // Now check if the level criteria were met
          if (levelScore >= scoreNeeded) {
            level += 1;
            if (level == MAX_LEVEL) {
              alert("Congratugulations. You won! Your score is: " + overallScore);
            }
            showLevelModal(level - 1);
            initialize_level(level);
          } else {
            showGameoverModal(overallScore);
          }
        }
        displayHeader();
      }
      

    function nextTarget(){
        // remove Target MArker from map
        targetMarker.removeFrom(mymap);
        var randomNumber = Math.floor(Math.random() * locations[level].cities.length);
        var lat = locations[level].cities[randomNumber].lat;
        var lng = locations[level].cities[randomNumber].lng;
        var name = locations[level].cities[randomNumber].city;
        var country = locations[level].cities[randomNumber].country;
        targetMarker.setLatLng([lat, lng]);
        var display_target_name = "";
        if (show_country){
            display_target_name = name + " (" + country + ")";
        } else {
            display_target_name = name;
        }
        displayTimerText(display_target_name);
        mymap.setView([20,0], 2);
    }

    function showLevelGuessesMap() {
        return new Promise(resolve => {
          const modal = document.querySelector('.level-results-modal');
          modal.style.display = 'flex';
      
          // Create a new Leaflet map inside the modal’s container
          const resultMap = L.map('level-result-map').setView([20, 0], 2);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
            doubleClickZoom: 5,
            zoomAnimationDuration: 200
          }).addTo(resultMap);
      
          // For each guess, add markers and a connecting polyline
          levelGuesses.forEach(item => {
            // Add target marker in green
            L.circleMarker(item.target, { color: 'green', radius: 8 }).addTo(resultMap);
            // Add guess marker in red
            L.circleMarker(item.guess, { color: 'red', radius: 8 }).addTo(resultMap);
            // Connect the two markers with a red line
            L.polyline([item.target, item.guess], { color: 'red' }).addTo(resultMap);
          });
      
          // Listen for close button click to hide the modal
          const closeButton = document.querySelector('.close-button-level-results');
          closeButton.addEventListener('click', function handler() {
            modal.style.display = 'none';
            resultMap.remove(); // remove the result map
            closeButton.removeEventListener('click', handler);
            resolve();
          });
        });
      }
      


    // Load locations

    // Define variables
    var overallScore = 0;
    var levelScore = 0;
    var scoreNeeded = 0;
    var lastScore = 0;
    var lastScoreLevel = 0;
    var level = 0;
    var distanceLine = null;
    var circle = null;
    var counter = 0;
    var counter_needed = locations[0].counter_max;
    var DURATION_TIMER = 10;
    var MAX_LEVEL = 7;
    var show_country = true;
    let levelGuesses = [];
    var levelName = "";


    displayHeader();

    // Timer
    const timer = document.getElementById('timer-bar');
    const animation = timer.animate([
    { width: '100%' },
    { width: '0%' }
    ], {
    duration: DURATION_TIMER * 1000,
    easing: 'linear',
    fill: 'forwards'
    });

    // Map
    var mymap = L.map('mapid').setView([20, 20], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 12
    }).addTo(mymap);

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }
      
      // Define a function to style each feature in the GeoJSON layer
      function style(feature) {
        return {
          fillColor: getRandomColor(),
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        };
      }
      
      // Create a GeoJSON layer with the random color styling

     //L.geoJson.ajax('countries.geojson', {
                //style: style
              //}).addTo(mymap);
    

    var draggableMarker = L.marker([0, 0], {
    draggable: true,
    autoPan: true
    }).addTo(mymap);
    var targetMarker = L.marker([45.5231, -122.6765], color='red');

    initialize_level(0);

    // GAME

    // Modal
    showStartModal();

    // Add event listener to the map
    mymap.on('click', function(e) {
        draggableMarker.setLatLng(e.latlng);
      });

    // Create a reusable handler function
    const handleButtonAction = async () => {
        zoomToTarget();
        const distance = calculateDistance();
        const timeleft = calculateTimeleft();
        const score = calculateScore(distance, timeleft);
        await showModal(score, distance, timeleft);
        updateGameState(score);
    };

    // add event listener
    var demoButton = document.getElementById('buttonid');
    demoButton.addEventListener('click', async function() {
        handleButtonAction();
    });
    animation.addEventListener('finish', async function() {
        zoomToTarget();
        distance = calculateDistance();
        timeleft = calculateTimeleft();
        score = calculateScore(distance, timeleft);
        await showModal(score, distance, timeleft);
        updateGameState(score);
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            handleButtonAction();
        }
      });
      document.addEventListener('keydown', function(event) {
        if (event.key === 'f') {
            handleButtonAction();
        }
      });

});

