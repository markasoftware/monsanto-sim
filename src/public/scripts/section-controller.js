var slider = document.getElementById('selector-box');
var selectionImgs = document.querySelectorAll('#selector-icon-container > img');
var dnaContainer = document.getElementById('dna-inner-container');

[].forEach.call(selectionImgs, function(curImg, curIndex){
    curImg.addEventListener('click', function(){
        slider.style.marginLeft = 'calc(9vh * ' + curIndex + ' - 2px)';
        dnaContainer.style.marginLeft = -85 * curIndex + 'vw';
    });
});
