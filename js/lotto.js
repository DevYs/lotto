function ready(fn) {
    if(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function() {
    // pick(50);
    getJSON('get', 'js/win.json');
});

function getJSON(method, url){
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            for(var i=0; i<data.length;i++){
                console.log(data[i]);
            } 
        } else {
            // We reached our target server, but it returned an error
        }
    };
    request.onerror = function() {
        // There was a connection error of some sort
    };
    request.send();
}

function pick(count) {
    for(var i=0; i<count; i++){
        var n = randomNumber.getPickNumber(); 
        console.log(n);
    } 
}

var randomNumber = {
    min : 1,
    max : 46,
    index : 0,
    numberStore : [],
    size : 7, 
    pickNumber : function() {
        return Math.floor(Math.random() * (this.max - this.min)) + this.min;
    },
    makeNumber : function() {
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

        this.makeNumber();
    },
    getPickNumber : function() {
        this.clear();
        this.makeNumber();
        return this.numberStore;
    },
    clear : function() {
        this.numberStore = [];
        this.index = 0;
    }

}