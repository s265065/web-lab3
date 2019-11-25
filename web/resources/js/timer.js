(function () {
    "use strict";

    const clockHours = document.getElementById("clockHours");
    const clockMinutes = document.getElementById("clockMinutes");
    const clockSeconds = document.getElementById("clockSeconds");
    const count = document.getElementById("count");
    let secTime;
    let ticker;

    function getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    function clock() {
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (hours < 10)
            hours = "0" + hours;
        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;

        clockHours.innerText = hours;
        clockMinutes.innerText = minutes;
        clockSeconds.innerText = seconds;

        setTimeout(clock, 12000);
    }

    function changeClockColor() {
        clockHours.style.color = getRandomColor();
        clockMinutes.style.color = getRandomColor();
        clockSeconds.style.color = getRandomColor();
        setTimeout(changeClockColor, 1000);
    }

    clock();
    changeClockColor();
    getSeconds();

    function getSeconds() {
        let diff = 13;
        startTimer (diff);
    }

    function startTimer(secs) {
        secTime = parseInt(secs);
        ticker = setInterval(tick,1000);
        tick(); //initial count display
    }

    function tick() {
        let secs = secTime;
        if (secs > 0) {
            secTime--;
        } else {
            clearInterval(ticker);
            getSeconds(); //start over
        }
        count.innerText = ((secs < 10) ? "0" : "") + secs;
    }

})();