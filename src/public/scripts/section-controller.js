var slider = document.getElementById('selector-box');
var selectionImgs = document.querySelectorAll('#selector-icon-container > img');
var dnaContainer = document.getElementById('dna-inner-container');

[].forEach.call(selectionImgs, function(curImg, curIndex){
    curImg.addEventListener('click', function(){
        slider.style.transform = 'translateX(' + (9 * curIndex) + 'vh)';
        dnaContainer.style.transform = 'translateX(' + (-85 * curIndex) + 'vw)';
    });
});
