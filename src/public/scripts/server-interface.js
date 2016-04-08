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
});
