var TAG_ROUND = '{round}';
var TAG_WIN_NUMBERS = '{winNumbers}';
var TAG_NUM_COLOR = ['{colorNum1}','{colorNum2}','{colorNum3}','{colorNum4}','{colorNum5}','{colorNum5}']; 
var TAG_NUM = ['{num1}','{num2}','{num3}','{num4}','{num5}','{num6}']; 
var TAG_BONUS = '{bonus}';
var TAG_BONUS_COLOR = '{colorBonus}';
var TAG_YOUR_TOTAL_MONEY = '{yourTotalMoney}'; 

var TEMP_ROUND = '<div class="round close"><dl><dt>' + TAG_ROUND + '회</dt><dd><span class="num ' + TAG_NUM_COLOR[0] + '">' + TAG_NUM[0] + '</span><span class="num ' + TAG_NUM_COLOR[1] + '">' + TAG_NUM[1] + '</span><span class="num ' + TAG_NUM_COLOR[2] + '">' + TAG_NUM[2] + '</span><span class="num ' + TAG_NUM_COLOR[3] + '">' + TAG_NUM[3] + '</span><span class="num ' + TAG_NUM_COLOR[4] + '">' + TAG_NUM[4] + '</span><span class="num ' + TAG_NUM_COLOR[5] + '">' + TAG_NUM[5] + '</span> + <span class="num ' + TAG_BONUS_COLOR + '">' + TAG_BONUS + '</span></dd><dd class="money"><strong>' + TAG_YOUR_TOTAL_MONEY + '</strong><span>원</span></dd></dl></div>';

// pick 최대 사이즈
var MAX_SIZE = 100;

// pick 최대 사이즈를 초과한 값을 입력할 경우 메세지
var MAX_SIZE_EXCESS_MSG = '1회당 구매한도는 ' + MAX_SIZE + '장입니다.';

// 미입력시 메세지
var SIZE_ZERO_MSG = '숫자를 입력하세요.';

// 1~45의 번호가 몇번이나 매칭됐는지 카운팅
var countWin = [];

// 역대 당첨번호 목록 정보
var winList = [];

var payMoney = 0;

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

        if(!Number(pickSize)){
            alert('1~100 사이의 정수를 입력하세요');
        }

        payMoney = pickSize * winList.length * 1000;

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

    winList.yourAllTotalMoney = 0;
    winList.bestMoney = 0;
    winList.bestRound = 0;
    winList.bestRanking = 0;
    for(var wi=0; wi<winList.length; wi++){
        var pickList = pick(pickSize);
        winList[wi].pickList = [];
        winList[wi].hasWin = false;
        winList[wi].yourTotalMoney = 0; 
        for(var pi=0; pi<pickList.length; pi++){
            compare(pickList[pi], winList[wi]);
        }
        winList.yourAllTotalMoney += winList[wi].yourTotalMoney;
    }
    
    sortCountWin();  
   
    print(false); 
}

// 길이가 6인 정수배열을 서로 비교하여 매칭되는 숫자를 수집
function compare(pick, win) {
    var pickNumbers = pick.numbers;
    var winNumbers = win.winNumList; 
    var bonus = win.bonusNum; 
    var winRanking = 0; 
    pick.winNums = [];
    pick.yourMoney = 0;

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
    var moneyIndex = Number(pick.winRanking - 1);
    if(-1 < moneyIndex){
        var yourMoney = win.winMoney[moneyIndex]; 
        win.yourTotalMoney += yourMoney;
        pick.yourMoney = yourMoney;
    }

    if(winList.bestMoney < pick.yourMoney){
        winList.bestMoney = pick.yourMoney;
        winList.bestRound = win.round;
        winList.bestRanking = pick.winRanking;
    }

    if(win.hasWin === false && (0 < winRanking && winRanking)) {
        win.hasWin = true;
    } 
    
    win.pickList.push(pick);
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

// 결과 출력
function print(isAll){
    // console.log(winList);
    // console.log(countWin);
    var roundList = ''; 
    for(var wi=winList.length-1; wi>=0; wi--) {
        var round = winList[wi].round;
        var bonus = winList[wi].bonusNum;
        var yourTotalMoney = winList[wi].yourTotalMoney;

        document.querySelector('.win-info .total strong').textContent = addComma(winList.yourAllTotalMoney);
        document.querySelector('.win-info .best strong').textContent = addComma(winList.bestMoney);
        document.querySelector('.win-info .best .best-round').textContent = addComma(winList.bestRound);
        document.querySelector('.win-info .best .best-ranking').textContent = winList.bestRanking + '등';
        document.querySelector('.win-info .pay strong').textContent = addComma(payMoney);

        var bestNum = document.querySelectorAll('.win-info .best-num .num');
        for(var i=0; i<bestNum.length; i++){
            bestNum[i].setAttribute('class', 'num');
            bestNum[i].textContent = countWin[i].winNum;
            bestNum[i].setAttribute('data-count',countWin[i].count + '회');
            bestNum[i].classList.add(numberColor(countWin[i].winNum));
        }

        var htmlRound = TEMP_ROUND.replace(TAG_ROUND,round);
        for(var ni=0; ni<winList[wi].winNumList.length; ni++){
            var num = winList[wi].winNumList[ni];
            htmlRound = htmlRound.replace(TAG_NUM[ni],num).replace(TAG_NUM_COLOR[ni],numberColor(num));
        }

        htmlRound = htmlRound.replace(TAG_BONUS,bonus).replace(TAG_BONUS_COLOR,numberColor(bonus));
        htmlRound = htmlRound.replace(TAG_YOUR_TOTAL_MONEY,addComma(yourTotalMoney));

        if(winList[wi].hasWin === false){
            htmlRound = htmlRound.replace('round','round no-win');
        }else{
            htmlRound = htmlRound.replace('round','round win');
        }
       
        if(winList[wi].hasWin === false && isAll === false){
            continue;
        }

        roundList += htmlRound;
    }
    document.querySelector('.wrap-result').innerHTML = '';
    document.querySelector('.wrap-result').insertAdjacentHTML('afterBegin',roundList);
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

function addComma(str){
    str = str + '';
    // 1,000 단위
    var UNIT_1000 = 3; 
    if(UNIT_1000 < str.length){
        str = str.substring(0, str.length - UNIT_1000) + ',' + str.substring(str.length - UNIT_1000, str.length);
    }

    // 1,000,000 단위
    var UNIT_1000000 = 7; 
    if(UNIT_1000000 < str.length){
        str = str.substring(0, str.length - UNIT_1000000) + ',' + str.substring(str.length - UNIT_1000000, str.length);
    }
   
    // 100,000,000 단위
    var UNIT_1000000000 = 11; 
    if( UNIT_1000000000< str.length){
        str = str.substring(0, str.length - UNIT_1000000000) + ',' + str.substring(str.length - UNIT_1000000000, str.length);
    }
    return str;
}