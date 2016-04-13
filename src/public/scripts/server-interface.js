//bruh. If you see this, you might be cool

//bruh

//global variables. I have no idea why we're defining them here

var traits, globalMoney;

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
    globalMoney = data.money;
    pawns.forEach(function(curPawn){
        var curContainer = document.getElementById(curPawn + '-container');
        data.people[curPawn].forEach(function(curPerson, curIndex){
            curContainer.appendChild(createDNAColumn(curPerson, traits[curPawn], curIndex === 0));
        });
    });
});

//ending the turn

var turnEnding = false;

document.getElementById('end-turn-button').addEventListener('click', function() {
    if(turnEnding) return;
    turnEnding = true;
    hideMain();
    var largeText = document.getElementById('large-text');
    var waitTextDisplay = setTimeout(function(){
        largeText.textContent = 'Waiting...';
        largeText.style.opacity = '1';
        largeText.style.transform = 'translateY(0vh)';
    }, 800);
    ajax('ajax/turn', function(data){
        if(!data.doTurn) return;
        setLargeText('Fight!', 600, function(){ setTimeout(function(){ processStuff(data)}, 250) });
    });
    function processStuff(data){
        processLargeTextArr(
            [
                {text: 'Lawyer Battle:', duration: 650},
                {text: 'Your Odds:', duration: 400},
                {text: data.yourOdds + '%', duration: 400},
                {text: 'Their Odds:', duration: 400},
                {text: data.theirOdds + '%', duration: 400},
                {text: 'Winner:', duration: 600},
                {text: data.winner, duration: 500},
                {text: 'Damages:', duration: 600},
                {text: '$' + data.lawyerDamages, duration: 600, money: data.lawyerMoney},
                {text: 'Soldier Battle:', duration: 650},
                {text: 'Damage to opponent:', duration: 400},
                {text: '$' + data.soldierAttack, duration: 500},
                {text: 'Damage to you:', duration: 400},
                {text: '$' + data.soldierDamage, duration: 600, money: data.soldierMoney},
                {text: 'Profit:', duration: 650},
                {text: '$' + data.profit, duration: 500, money: data.finalMoney}
            ]
        ,function(){
            turnEnding = false;
            showMain();
        });
    }
});
