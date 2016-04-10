//bruh. If you see this, you might be cool

//bruh

//global variables. I have no idea why we're defining them here

var traits;

function ajax(url, done){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.addEventListener('load', function(e){
        if(xhr.status != 200) document.write('non-200 http code from GET ' + url + ': ' + xhr.status);
        else done(xhr.response);
    });
}

function ajaxPost(url, data, done){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.responseType = 'json';
    xhr.send('json=' + JSON.stringify(data));
    xhr.addEventListener('load', function(e){
        if(xhr.status != 200) document.write('non-200 http code from POST ' + url + ': ' + xhr.status);
        else done(xhr.response);
    });
}

//starting the game

ajax('ajax/start', function(data){
    console.log(data);
    traits = data.traits;
    updateMoney(data.money);
    pawns.forEach(function(curPawn){
        var curContainer = document.getElementById(curPawn + '-container');
        data.people[curPawn].forEach(function(curPerson, curIndex){
            curContainer.appendChild(createDNAColumn(curPerson, traits[curPawn], curIndex === 0));
        });
    });
});

//ending the turn

document.getElementById('end-turn-button').addEventListener('click', function() {
    hideMain();
    var hasDisplayed = false;
    var largeText = document.getElementById('large-text');
    var waitTextDisplay = setTimeout(function(){
        hasDisplayed = true;
        largeText.textContent = 'Waiting...';
        largeText.style.opacity = '1';
        largeText.style.transform = 'translateY(0vh)';
    }, 800);
    ajax('ajax/turn', function(data){
        if(hasDisplayed) {
            clearTimeout(waitTextDisplay);
            processStuff(data);
        } else {
            largeText.style.opacity = '0';
            largeText.style.transform = 'translateY(10vh)';
            setTimeout(function(){
                processStuff(data);
            }, 700);
        }
    });
    function processStuff(data){
        processLargeTextArr(
            [
                {text: 'Fight!', duration: 650},
                {text: 'Lawyer Battle:', duration: 650},
                {text: 'Your Odds:', duration: 400},
                {text: data.yourOdds + '%', duration: 400},
                {text: 'Their Odds:', duration: 400},
                {text: data.theirOdds + '%', duration: 400},
                {text: 'Winner:', duration: 800},
                {text: data.winner, duration: 500}
            ]
        );
    }
});
