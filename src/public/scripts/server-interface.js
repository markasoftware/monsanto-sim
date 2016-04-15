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
    traits = data.traits;
    updateMoney(data.money);
    globalMoney = data.money;
    pawns.forEach(function(curPawn){
        //first, add traits
        var traitLabelContainer = document.createElement('div');
        traitLabelContainer.classList.add('trait-label-container', 'dna-column');
        var padderTop = document.createElement('div');
        padderTop.classList.add('dna-padder');
        traitLabelContainer.appendChild(padderTop);
        traits[curPawn].forEach(function(curTrait){
            var traitElt = document.createElement('div');
            traitElt.classList.add('trait-label');
            traitElt.textContent = curTrait.trait + ':';
            traitLabelContainer.appendChild(traitElt);
        });

        var curContainer = document.getElementById(curPawn + '-container');

        curContainer.appendChild(traitLabelContainer);

        data.people[curPawn].forEach(function(curPerson, curIndex){
            curContainer.appendChild(createDNAColumn(curPerson, traits[curPawn], curIndex === 0));
        });
    });
    setupBuying();
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

//buying stuff
function setupBuying(){
    [].forEach.call(document.getElementsByClassName('dna-money'), function(curElt){
        curElt.addEventListener('click', function(e){
            //hide other columns
            var startTime = Date.now();
            var buyCol = e.target.parentNode;
            var parentName = buyCol.id;
            var pawnID = buyCol.parentNode.id;
            var pawnName = pawnID.slice(0, pawnID.indexOf('-'));
            [].forEach.call(
                document.querySelectorAll('#' + pawnID + '>.dna-column:not(#' + parentName + '):not(.dna-column-left):not(.trait-label-container)'),
                function(curToHide) { curToHide.style.opacity = '0' }
            );
            ajaxPost('ajax/buy', {
                pawn: pawnName,
                boughtIndex: [].indexOf.call(buyCol.parentNode.childNodes, buyCol) - 1
            }, function(data){
                //deal with money
                updateMoney(data.money);
                //everything else
                var nowTime = Date.now();
                var waitForCrossover = 1750;
                if(nowTime - startTime < waitForCrossover) setTimeout(doBuy, waitForCrossover - (nowTime - startTime));
                else doBuy();
                function doBuy(){
                    console.log('doBuy');
                    //crossover
                    var crossoverIndex = data.crossover;
                    var baseQuery = parentName + crossoverIndex;
                    var elt1 = document.getElementById(baseQuery + '1');
                    var elt2 = document.getElementById(baseQuery + '2');
                    var val1 = elt1.textContent.slice(0);
                    var val2 = elt2.textContent.slice(0);
                    elt1.style.opacity = elt2.style.opacity = '0';
                    setTimeout(function(){
                        elt1.textContent = val2;
                        elt2.textContent = val1;
                        elt1.style.opacity = elt2.style.opacity = '1';
                        setTimeout(function(){
                            
                            //independent assortment
                            hideAlleles(data.assort.main.sectors, buyCol.parentNode.querySelector('.dna-column:nth-child(2)'));
                            hideAlleles(data.assort.buy.sectors, buyCol);
                            function hideAlleles(hideData, parentCol){
                                hideData.forEach(function(curHideThingy, curIndex){
                                    //I'm really really sorry for this
                                    debugger;
                                    parentCol.querySelector('.dna-column-inner .dna-icon-column:nth-child(' +
                                            (curHideThingy ? '3' : '1') +
                                            ') .allele:nth-child(' +
                                            (curIndex + 1) +
                                            ')')
                                            .style.opacity = '0';
                                });
                            }
                        }, 800);
                    }, 350);
                }
            });
        });
    });
}
