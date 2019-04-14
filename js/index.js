var TAG_ROUND = '{round}';
var TAG_WIN_NUMBERS = '{winNumbers}';
var TAG_NUM_COLOR = ['{colorNum1}','{colorNum2}','{colorNum3}','{colorNum4}','{colorNum5}','{colorNum5}']; 
var TAG_NUM = ['{num1}','{num2}','{num3}','{num4}','{num5}','{num6}']; 
var TAG_BONUS = '{bonus}';
var TAG_BONUS_COLOR = '{colorBonus}';
var TAG_YOUR_TOTAL_MONEY = '{yourTotalMoney}'; 
var TAG_WIN_PICK_LIST = '{winPickList}';
var TAG_WIN_BEST_RANKING = '{winBestRanking}';
var TEMP_ROUND = '<div class="round" data-best-ranking="' + TAG_WIN_BEST_RANKING + '"><dl><dt>' + TAG_ROUND + '회</dt><dd><span class="num ' + TAG_NUM_COLOR[0] + '">' + TAG_NUM[0] + '</span><span class="num ' + TAG_NUM_COLOR[1] + '">' + TAG_NUM[1] + '</span><span class="num ' + TAG_NUM_COLOR[2] + '">' + TAG_NUM[2] + '</span><span class="num ' + TAG_NUM_COLOR[3] + '">' + TAG_NUM[3] + '</span><span class="num ' + TAG_NUM_COLOR[4] + '">' + TAG_NUM[4] + '</span><span class="num ' + TAG_NUM_COLOR[5] + '">' + TAG_NUM[5] + '</span> <span class="add-bonus">+</span> <span class="num ' + TAG_BONUS_COLOR + '">' + TAG_BONUS + '</span></dd><dd class="money"><strong>' + TAG_YOUR_TOTAL_MONEY + '</strong><span>원</span></dd></dl><ul>' + TAG_WIN_PICK_LIST + '</ul></div>';

var TAG_WIN_MONEY = '{winMoney}';
var TAG_WIN_RANKING = '{winRanking}'; 
var TEMP_WIN_PICK = '<li><div class="number"><strong>' + TAG_WIN_RANKING + '등</strong><span class="num ' + TAG_NUM_COLOR[0] + '">' + TAG_NUM[0] + '</span><span class="num ' + TAG_NUM_COLOR[1] + '">' + TAG_NUM[1] + '</span><span class="num ' + TAG_NUM_COLOR[2] + '">' + TAG_NUM[2] + '</span><span class="num ' + TAG_NUM_COLOR[3] + '">' + TAG_NUM[3] + '</span><span class="num ' + TAG_NUM_COLOR[4] + '">' + TAG_NUM[4] + '</span><span class="num ' + TAG_NUM_COLOR[5] + '">' + TAG_NUM[5] + '</span></div><div class="money"><strong>' + TAG_WIN_MONEY + '</strong><span>원</span></div></li>';

var NAME_WIN_LIST = 'winList';

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
    var isStorageAvailable = storageAvailable(); 
    var isExistData = false;

    if(isStorageAvailable === true){
        winList = JSON.parse(localStorage.getItem(NAME_WIN_LIST));
        isExistData = winList ? true : false; 
    }

    // 역대 당첨번호 로드 
    if(isExistData === false){
        getJSON('get', 'js/win.json', function(data){
            winList = data;
        
            if(isStorageAvailable === true){
                localStorage.setItem(NAME_WIN_LIST, JSON.stringify(data));
            } 
        });
    } 

    // 버튼 이벤트
    var button = document.querySelector('button');
    button.addEventListener('click', function() {
        button.disabled = true;
        setTimeout(function(){
            button.disabled = false;
        },3000);

        toggleNoResultWinMsg(false);
        setRankingButton(5);
        toScrollSmooth('.win-info'); 

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

        winList.totalPickSize = pickSize * winList.length;
        winList.payMoney = winList.totalPickSize * 1000;

        start(pickSize);
    });

    var rankingButtonList = document.querySelectorAll('.ranking-button a');
    for(var i=0; i<rankingButtonList.length; i++){
        rankingButtonList[i].addEventListener('click', function(e){
            e.preventDefault();
            toScrollSmooth('.ranking-button');  
            var ranking = this.getAttribute('data-ranking');
            setRankingButton(ranking);
            hideRound(ranking);
        });
    }
});

function toScrollSmooth(selector){
    document.querySelector(selector).scrollIntoView({behavior: 'smooth'});
}

function allRankingButtonHide(){
    var rankingButtonList = document.querySelectorAll('.ranking-button a');
    for(var j=0; j<rankingButtonList.length; j++){
        rankingButtonList[j].classList.remove('on');
    }
}

function setRankingButton(ranking){
    allRankingButtonHide();
    document.querySelectorAll('.ranking-button a')[ranking - 1].classList.add('on');
}

function hideRound(ranking){
    var roundList = document.querySelectorAll('.round');
    var blockRoundCount = 0; 

    for(var i=0; i<roundList.length; i++) {
        var round = roundList[i]; 
        var roundRanking = round.getAttribute('data-best-ranking');
        if(ranking < roundRanking){
            round.style.display = 'none';
        }else{
            round.style.display = 'block';
            blockRoundCount++;
        }
    }

    toggleNoResultWinMsg(blockRoundCount === 0);
}

function toggleNoResultWinMsg(isShow){
    var noResultWinMsg = document.querySelector('.wrap-result .no-result-win');
    if(isShow){
        noResultWinMsg.classList.add('show');
    }else{
        noResultWinMsg.classList.remove('show');
    }
}

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
    winList.bestRanking = 6;
    winList.totalCountWin = 0;
    
    for(var wi=0; wi<winList.length; wi++){
        var pickList = pick(pickSize);
        winList[wi].pickList = [];
        winList[wi].hasWin = false;
        winList[wi].yourTotalMoney = 0; 
        winList[wi].winBestRanking = 9;
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

    if(0 < winRanking && winRanking < win.winBestRanking){
        win.winBestRanking = winRanking;
    }

    pick.winRanking = winRanking;
    if(5 <= pick.winRanking){
        winList.totalCountWin++;
    } 

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
   
    if(0 < pick.winRanking){
        win.pickList.push(pick);
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

// 결과 출력
function print(isAll){
    var roundListAll = '';

    for(var wi=winList.length-1; wi>=0; wi--) {
        var round = winList[wi].round;
        var bonus = winList[wi].bonusNum;
        var yourTotalMoney = winList[wi].yourTotalMoney;
        var winBestRanking = winList[wi].winBestRanking;

        document.querySelector('.win-info .total strong').textContent = addComma(winList.yourAllTotalMoney);
        document.querySelector('.win-info .best strong').textContent = addComma(winList.bestMoney);
        document.querySelector('.win-info .best .best-round').textContent = addComma(winList.bestRound);
        document.querySelector('.win-info .best .best-ranking').textContent = winList.bestRanking + '등';
        document.querySelector('.win-info .pay strong').textContent = addComma(winList.payMoney);
        document.querySelector('.win-info .profit-loss strong').textContent = addComma(winList.yourAllTotalMoney - winList.payMoney);
        document.querySelector('.win-info .total-count-win strong').textContent = winList.totalCountWin + ' / ' + winList.totalPickSize;
        
        var bestNum = document.querySelectorAll('.win-info .best-num .num');
        for(var bni=0; bni<bestNum.length; bni++){
            bestNum[bni].setAttribute('class', 'num');
            bestNum[bni].textContent = countWin[bni].winNum;
            bestNum[bni].setAttribute('data-count', countWin[bni].count + '회');
            bestNum[bni].classList.add(numberColor(countWin[bni].winNum));
        }

        var htmlRound = TEMP_ROUND.replace(TAG_ROUND, round);
        for(var ni=0; ni<winList[wi].winNumList.length; ni++){
            var num = winList[wi].winNumList[ni];
            htmlRound = htmlRound.replace(TAG_NUM[ni], num).replace(TAG_NUM_COLOR[ni], numberColor(num));
        }
        htmlRound = htmlRound.replace(TAG_BONUS, bonus).replace(TAG_BONUS_COLOR, numberColor(bonus)).replace(TAG_YOUR_TOTAL_MONEY, addComma(yourTotalMoney)).replace(TAG_WIN_BEST_RANKING, winBestRanking);

        var htmlAllWinPick = '';
        for(var pli=0; pli<winList[wi].pickList.length; pli++){
            var winRanking = winList[wi].pickList[pli].winRanking;
           
            var htmlWinPick = TEMP_WIN_PICK;
            for(var pi=0; pi<winList[wi].pickList[pli].numbers.length; pi++){
                var pickWinNum = winList[wi].pickList[pli].numbers[pi];
                
                htmlWinPick = htmlWinPick.replace(TAG_NUM[pi], pickWinNum);
                if(-1 < winList[wi].pickList[pli].winNums.indexOf(pickWinNum)){
                    htmlWinPick = htmlWinPick.replace(TAG_NUM_COLOR[pi], numberColor(pickWinNum));
                } else {
                    htmlWinPick = htmlWinPick.replace(TAG_NUM_COLOR[pi], 'black');
                }
            }
            var winMoney = winList[wi].winMoney[winRanking - 1];
            htmlWinPick = htmlWinPick.replace(TAG_WIN_RANKING, winRanking).replace(TAG_WIN_MONEY, addComma(winMoney));
            htmlAllWinPick += htmlWinPick;
        }

        htmlRound = htmlRound.replace(TAG_WIN_PICK_LIST, htmlAllWinPick);      
        
        if(wi === 1){
            document.querySelector('.win-info').classList.add('on');
            document.querySelector('.wrap-result').classList.add('on');
        }
        
        if(winList[wi].hasWin === false && isAll === false){
            continue;
        }

        roundListAll += htmlRound;
    }

    document.querySelector('.wrap-result .all').innerHTML = '';
    document.querySelector('.wrap-result .all').insertAdjacentHTML('afterBegin',roundListAll);
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

// 문자열을 화폐 '원'으로 표현
function addComma(value){
    var money = '0'; 
    money = value + '';
    
    if(value < 0){
        money = money.substring(1, money.length);
    }    
    
    // 1,000 단위
    var UNIT_1000 = 3; 
    if(UNIT_1000 < money.length){
        money = money.substring(0, money.length - UNIT_1000) + ',' + money.substring(money.length - UNIT_1000, money.length);
    }

    // 1,000,000 단위
    var UNIT_1000000 = 7; 
    if(UNIT_1000000 < money.length){
        money = money.substring(0, money.length - UNIT_1000000) + ',' + money.substring(money.length - UNIT_1000000, money.length);
    }
   
    // 100,000,000 단위
    var UNIT_1000000000 = 11; 
    if( UNIT_1000000000< money.length){
        money = money.substring(0, money.length - UNIT_1000000000) + ',' + money.substring(money.length - UNIT_1000000000, money.length);
    }

    if(value < 0){
        money = '-' + money;
    }

    return money;
}

/**
 * localStorage 사용가능 여부 감지 함수
 * 
 * 출처 : MDN
 */
function storageAvailable() {
    try {
        var storage = window['localStorage'];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch(e) {
        return e instanceof DOMException && (
            // Firefox를 제외한 모든 브라우저
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // 코드가 존재하지 않을 수도 있기 때문에 테스트 이름 필드도 있습니다.
            // Firefox를 제외한 모든 브라우저
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // 이미 저장된 것이있는 경우에만 QuotaExceededError를 확인하십시오.
            storage.length !== 0;
    }
}