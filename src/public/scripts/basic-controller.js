var moneyElt = document.getElementById('money');

function updateMoney(newVal) {
    if(moneyElt.textContent.length < 1) {
        moneyElt.textContent = newVal;
        return;
    }
    //who cares about stuff anyways right
    console.log(globalMoney, newVal);
    if(globalMoney == newVal) return;
    globalMoney = newVal;
    moneyElt.style.opacity = 0;
    setTimeout(function() {
        moneyElt.textContent = newVal;
        moneyElt.style.opacity = 1;
    }, 250);
}

var mainElt = document.getElementById('main-container');
var turnEndElt = document.getElementById('end-turn-button');

function hideMain() {
    mainElt.style.transform = 'translateY(85vh)';
    turnEndElt.style.opacity = '0';
}

function showMain() {
    mainElt.style.transform = 'translateY(0vh)';
    turnEndElt.style.opacity = '1';
}

var largeText = document.getElementById('large-text');

function setLargeText(text, duration, done) {
    if(largeText.textContent.length > 0){
        largeText.style.opacity = 0;
        largeText.style.transform = 'translateY(10vh)';
        var innerArgs = arguments;
        setTimeout(function(){
            largeText.textContent = '';
            setLargeText.apply(window, innerArgs);
        }, 200);
        return;
    }
    largeText.textContent = text;
    largeText.style.transform = 'translateY(0vh)';
    largeText.style.opacity = '1';
    setTimeout(function(){
        largeText.style.transform = 'translateY(10vh)';
        largeText.style.opacity = '0';
        setTimeout(function(){ largeText.textContent = ''; done() }, 200);
    }, duration + 200);
}

function processLargeTextArr(textArr, done) {
    function nextThingy(curInd) {
        if(curInd === textArr.length) {
            done();
            return;
        }
        if(textArr[curInd].money) setTimeout(function() { updateMoney(textArr[curInd].money) }, 300);
        setLargeText(textArr[curInd].text, textArr[curInd].duration, function(){
            setTimeout(function(){ nextThingy(curInd + 1) }, 250);
        });
    };
    nextThingy(0);
};
