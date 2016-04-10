var moneyElt = document.getElementById('money');

function updateMoney(newVal) {
    if(moneyElt.textContent.length < 1) {
        moneyElt.textContent = newVal;
        return
    }
    moneyElt.style.opacity = 0;
    setTimeout(function() {
        moneyElt.textContent = newVal;
        moneyElt.style.opacity = 1;
    }, 250);
}

var mainElt = document.getElementById('main-container');

function hideMain() {
    mainElt.style.transform = 'translateY(85vh)';
}

function showMain() {
    mainElt.style.transform = 'translateY(0vh)';
}

var largeText = document.getElementById('large-text');

function setLargeText(text, duration, done) {
    largeText.textContent = text;
    largeText.style.transform = 'translateY(0vh)';
    largeText.style.opacity = '1';
    setTimeout(function(){
        largeText.style.transform = 'translateY(10vh)';
        largeText.style.opacity = '0';
        setTimeout(done, 200);
    }, duration + 200);
}

function processLargeTextArr(textArr) {
    function nextThingy(curInd) {
        setLargeText(textArr[curInd].text, textArr[curInd].duration, function(){
            setTimeout(function(){ nextThingy(curInd + 1) }, 500);
        });
    };
    nextThingy(0);
};
