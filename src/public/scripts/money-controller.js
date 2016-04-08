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
