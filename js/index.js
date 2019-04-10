var MAX_SIZE = 100;
var MAX_SIZE_EXCESS_MSG = '1회당 구매한도는 ' + MAX_SIZE + '장입니다.';
var SIZE_ZERO_MSG = '숫자를 입력하세요.';
var countWin = [];
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
            winNums : [],
            winRanking : 0
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
    button.addEventListener('click', function() {
        var pickSize = document.querySelector('#pickSize').value;
        if(pickSize.length < 1) {
            alert(SIZE_ZERO_MSG);
            return false;
        } 
       
        if(MAX_SIZE < pickSize) {
            alert(MAX_SIZE_EXCESS_MSG); 
            return false;
        } 
        start(pickSize);
    });
});

function initCountWin() {
    countWin.length = 45; 
    for(var i=0; i<countWin.length; i++){
        countWin[i] = {winNum:i + 1, count:0};
    }
}

function start(pickSize) {
    initCountWin();

    for(var wi=0; wi<winList.length; wi++){
        var pickList = pick(pickSize);
        winList[wi].pickList = [];
        winList[wi].hasWin = false;
        for(var pi=0; pi<pickList.length; pi++){
            compare(pickList[pi], winList[wi]);
        }
    }
    
    sortCountWin();  
   
    print(); 
}

function print(){
    for(var i=winList.length-1; i>=0; i--) {
        var round = winList[i].round;
        var winNumber = numberString(winList[i].winNums);
        var bonus = winList[i].bonusNum;
        console.log(winList[i]);
    }
}

function sortCountWin(){
    countWin.sort(function(a, b){
        return b.count - a.count;
    });
    countWin.length = 6;
    countWin.sort(function(a, b){
        return a.winNum - b.winNum;
    });
}

function numberString(winNums) {
    var winNumsString = '';
    for(var i=0; i<winNums.length; i++){
        if(winNums[i] < 10){
            winNumsString += ' ' + winNums[i] + ' ';
        } else {
            winNumsString += winNums[i] + ' ';
        }
    }
    return winNumsString; 
}

function compare(pick, win) {
    var pickNumbers = pick.numbers;
    var winNumbers = win.winNums; 
    var bonus = win.bonusNum; 
    var winRanking = 0; 
    pick.winNums = [];
    
    for(var pi=0; pi<pickNumbers.length; pi++) {
        var pickNum = pickNumbers[pi];
        if(-1 < winNumbers.indexOf(pickNum)){
            pick.winNums.push(pickNum);
            numberColor(pickNum);  
            countWin[pickNum - 1].count++;
        } 
    }
 
    switch(pick.winNums.length) {
        case 3 : winRanking = 5; break;
        case 4 : winRanking = 4; break;
        case 5 : winRanking = 3; break;
        case 6 : winRanking = 1; break;
    }
    
    if(pick.winNums.length === 5) {
        if(-1 < pickNumbers.indexOf(bonus)){
            pick.winNums.push(bonus);
            countWin[bonus - 1].count++;
            winRanking = 2;
        } 
    }

    pick.winRanking = winRanking;
    if(win.hasWin === false && (0 < winRanking && winRanking)) {
        win.hasWin = true;
    } 
    
    win.pickList.push(pick);
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

function numberColor(num){
    var color = 'black';
    var quotient = Math.floor(num / 10);
    switch(quotient) {
        case 0 : color = 'green'; break;
        case 1 : color = 'blue'; break;
        case 2 : color = 'red'; break;
        case 3 : color = 'dark'; break;
        case 4 : color = 'pink'; break;
    }
    return color;
}