var winList;
var randomNumber = {
    min : 1,
    max : 46,
    index : 0,
    numberStore : [],
    size : 6, 
    pickNumber : function() {
        return Math.floor(Math.random() * (this.max - this.min)) + this.min;
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
            number  : this.numberStore,
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
});

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