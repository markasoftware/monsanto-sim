var slider = document.getElementById('selector-box');
var selectionImgs = document.querySelectorAll('#selector-icon-container > img');

[].forEach.call(selectionImgs, function(curImg, curIndex){
    curImg.addEventListener('click', function(){
        slider.style.marginLeft = 'calc(4.6em * ' + curIndex + ' - 2px)';
    });
});