// pick 최대 사이즈
var MAX_SIZE = 100;

// pick 최대 사이즈를 초과한 값을 입력할 경우 메세지
var MAX_SIZE_EXCESS_MSG = '1회당 구매한도는 ' + MAX_SIZE + '장입니다.';

// 미입력시 메세지
var SIZE_ZERO_MSG = '숫자를 입력하세요.';

// 1~45의 번호가 몇번이나 매칭됐는지 카운팅
var countWin = [];

// 역대 당첨번호 목록 정보
var winList;

// 자동 번호 뽑기 도구
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

// 역대 당첨번호 로드 후 이벤트 정의
ready(function() {
    
    // 역대 당첨번호 로드 
    getJSON('get', 'js/win.json', function(data){
        winList = data;
    });

    // 버튼 이벤트
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

// 1~45 매칭 횟수 초기화
function initCountWin() {
    countWin.length = 45; 
    for(var i=0; i<countWin.length; i++){
        countWin[i] = {winNum:i + 1, count:0};
    }
}

// 시작
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

// 결과 출력
function print(){
    for(var i=winList.length-1; i>=0; i--) {
        var round = winList[i].round;
        var winNumber = numberString(winList[i].winNums);
        var bonus = winList[i].bonusNum;
        console.log(winList[i]);
    }
}

// 1~45 매칭 횟수 상위 6개만 남기고 절삭 후 번호 순서대로 정렬 
function sortCountWin(){
    countWin.sort(function(a, b){
        return b.count - a.count;
    });
    countWin.length = 6;
    countWin.sort(function(a, b){
        return a.winNum - b.winNum;
    });
}

// 길이가 6인 정수 배열을 문자열로 변환
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

// 길이가 6인 정수배열을 서로 비교하여 매칭되는 숫자를 수집
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

// $(document).ready();
function ready(fn) {
    if(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

// 역대 번호 목록을 로드
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

// count만큼 번호생성
function pick(count) {
    var result = []; 
    for(var i=0; i<count; i++){
        result[i] = randomNumber.getPickNumbers(); 
    } 
    return result;
}

// 1~9 그린, 10~19 블루, 20~29 레드, 30~39 다크, 40~45 핑크
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