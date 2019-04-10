var MAX_SIZE = 100;
var MAX_SIZE_EXCESS_MSG = '1회당 구매할 수 있는 최대한도는 ' + MAX_SIZE +'장입니다.';
var winList;
var randomNumber = {
    min : 1,
    max : 45,
    index : 0,
    numberStore : [],
    size : 6, 
    pickNumber : function() {
        return Math.floor(Math.random() * ((this.max + 1) - this.min)) + this.min;
    },
    makeNumbers : function() {
        var num = this.pickNumber();

        if(-1 === this.numberStore.indexOf(num)){
            this.numberStore[this.index++] = num;
        }
       
        if(this.numberStore.length === this.size){
            this.numberStore.sort(function(a, b){
                return a - b;
            });
            return this;
        }

        this.makeNumbers();
    },
    getPickNumbers : function() {
        this.clear();
        this.makeNumbers();
        return {
            numbers  : this.numberStore,
            winNums : [] 
        };
    },
    clear : function() {
        this.numberStore = [];
        this.index = 0;
    }
}

ready(function() {
    getJSON('get', 'js/win.json', function(data){
        winList = data;
    });
    
    var button = document.querySelector('button');
    button.addEventListener('click', function(){
        var pickSize = document.querySelector('#pickSize').value;
        if(MAX_SIZE < pickSize){
            alert(MAX_SIZE_EXCESS_MSG); 
        } 
        start(pickSize);
    });
});

function start(pickSize) {
    for(var wi=0; wi<winList.length; wi++){
        var pickList = pick(pickSize);
        winList[wi].pickList = [];
        for(var pi=0; pi<pickList.length; pi++){
            compare(pickList[pi], winList[wi]);
        }
    }
    print(); 
}

function print(){
    for(var i=0; i<winList.length; i++){
        console.log(winList[i]); 
    } 
    // document.querySelector('.print').textContent = winList; 
}

function compare(pick, win) {
    var pickNumbers = pick.numbers;
    var winNumbers = win.winNums; 
    pick.winNums = [];
    
    for(var pi=0; pi<pickNumbers.length; pi++){
        for(var wi=0; wi<winNumbers.length; wi++){
            var pickNum = pickNumbers[pi];
            var winNum = winNumbers[wi];
            if(pickNum === winNum){
                pick.winNums.push(pickNum);
            }
        }
         
    } 

    // if(0 < pick.winNums.length){
        win.pickList.push(pick);
    // }
    
}

function ready(fn) {
    if(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function getJSON(method, url, callback){
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            callback(data); 
        } 
    };
    request.onerror = function() {
        // There was a connection error of some sort
    };
    request.send();
}

function pick(count) {
    var result = []; 
    for(var i=0; i<count; i++){
        result[i] = randomNumber.getPickNumbers(); 
    } 
    return result;
}