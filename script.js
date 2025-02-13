'use strict'
// 1行目に記載している 'use strict' は削除しないでください


// util functions
const isSmartPhone = () => !!(window.matchMedia && window.matchMedia('(max-device-width: 480px)').matches);
const sleep = time => new Promise((resolve) => setTimeout(resolve, time));
const getRandom = (min, max) => Math.floor((Math.random() * (max - min)) + min);


// Global variable
const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
const testRect = document.getElementById("testRect");


const gameSetting = {
    jumpHeight: 100,
    jumpTime: 500,
    jumpInterval: 150,
    starIntervalMin: 800,  // [ms]
    starIntervalMax: 3000,  // [ms]
    starSpeed: 3,  // [s]
    testMode: false,
};
if(isSmartPhone()){
    gameSetting.jumpHeight = 100 + 2 * remPx;
}


const unicornObj = {
    initStart: false,
    init: false,
    running: false,
    jumping: false,
    dead: false,
    score: 0,
};


/**
 * Initialize Game
 * 1. unicorn background spread
 * 2. Go out default unicorn
 * 3. Come back playable unicorn
 * 4. Display introduction text
 * @returns none:
 */
async function initGame(){
    if(unicornObj.initStart){return;}
    unicornObj.initStart = true;
    const defaultUnicorn = document.getElementById("unicornDefault");
    const unicorn = document.getElementById("unicorn");
    const unicornPosition = defaultUnicorn.getBoundingClientRect();
    const defaultBackground = document.getElementById("defaultBackground");
    const gameWrapper = document.getElementById("gameWrapper");

    defaultBackground.style.top = `${unicornPosition.top}px`;
    defaultBackground.style.left = `-${window.innerWidth}px`;
    defaultBackground.style.height = `${unicornPosition.height}px`;
    defaultBackground.style.display = "block";
    await sleep(400);
    defaultBackground.style.left = "0px";
    await sleep(450);
    defaultBackground.style.top = `0px`;
    defaultBackground.style.height = `100vh`;
    await sleep(1000);
    defaultUnicorn.style.left = `${window.innerWidth*1.5}px`;
    gameWrapper.style.display = "block";
    await sleep(1000);    
    document.getElementById("defaultElements").remove();

    unicorn.style.left = `${window.innerWidth*1.5}px`;
    unicorn.style.display = "block";
    unicorn.style.transition = "all 3s";
    await sleep(1);
    unicorn.style.left = `${1}rem`;
    await sleep(3100);
    document.getElementById("introductionTextWrapper").style.display = "flex";
    unicornObj.init = true;
}


/**
 * Game start
 * 1. hidden introduction text
 * 2. Add unicornJump to click event
 * 3. Initialize score
 * 4. kick starGenerator.
 */
async function startGame(){
    const unicorn = document.getElementById("unicorn");
    unicorn.style.transition = "none";
    document.getElementById("introductionTextWrapper").remove();
    unicornObj.running = true;
    document.getElementById("gameWrapper").addEventListener("click", ()=>{unicornJump().then();});
    unicornObj.score = 0;
    starGenerator().then();
}


/**
 * Jump unicorn
 */
async function unicornJump(){
    const unicorn = document.getElementById("unicorn");
    if (unicornObj.jumping){return ;}
    unicorn.style.transition = "all 0.05s"
    unicorn.style["transition-timing-function"] = "ease-out";

    unicornObj.jumping = true;
    unicorn.style.bottom = `${gameSetting.jumpHeight}px`;
    await sleep(gameSetting.jumpTime);
    unicorn.style.transition = "all 0.05s";
    unicorn.style["transition-timing-function"] = "ease-in" ;
    if(isSmartPhone()){
        unicorn.style.bottom = `2rem`;   
    } else {
        unicorn.style.bottom = `0px`;
    }
    await sleep(gameSetting.jumpInterval);
    unicornObj.jumping = false;
}


/**
 * star generating while loop
 * end trigger: unicornObj.running
 */
async function starGenerator(){
    console.log("Game Start!");
    hitJudge();
    while(unicornObj.running){
        await getNewStar();
        let next = getRandom(gameSetting.starIntervalMin, gameSetting.starIntervalMax);
        await sleep(next);
    }
}


/**
 * Generate new star.
 * Then remove star after go out from display.
 */
async function getNewStar()  {
    const star = document.createElement("img", );
    star.classList = "star";
    star.src = "./src/star.png";
    star.style.left = `${window.innerWidth}px`;
    star.style.transition = `all ${gameSetting.starSpeed}s`;
    star.style["transition-timing-function"] = "ease-in";
    document.getElementById("gameWrapper").appendChild(star);
    let ___ = (star.getBoundingClientRect());
    star.style.left = `-100px`;
    sleep(gameSetting.starSpeed * 1000 + 1000).then(
        () => {
            unicornObj.score += 100;
            star.remove();
        }
    );
}


/**
 * Start hitJudgement
 */
async function hitJudge(){
    gameSetting.judgeIntervalId = setInterval(_hitJudge, 1);
}


/**
 * Judgement hit or not
 * If hit, then 
 * - unicornObj.dead = true;
 * - unicornObj.running = false;
 * - Stop judgementInterval
 * - kick onGameEnd event.
 */
function _hitJudge(){
    const unicornRect = document.getElementById("unicorn").getBoundingClientRect();
    const starsPoints = [...document.getElementsByClassName("star")].map((el) => getTopCenter(el.getBoundingClientRect()));
    if (_hit(unicornRect, starsPoints)){
        console.log("hit!");
        unicornObj.dead = true;
        unicornObj.running = false;
        clearInterval(gameSetting.judgeIntervalId);
        onGameEnd().then();
    }
}


/**
 * Actual hit judgement.
 * @param {object} unicornRect 
 * @param {object[]} starsPoints 
 * @returns {boolean} - judgement hit or not
 */
function _hit(unicornRect, starsPoints){
    let hit = false;
    let unicornAria;
    if(isSmartPhone()){
        unicornAria = {
            bottom: unicornRect.bottom - 18,
            xLeft: unicornRect.x + 30,
            xRight: unicornRect.right - 30,
        };
    }else{
        unicornAria = {
            bottom: unicornRect.bottom - 40,
            xLeft: unicornRect.x + 100,
            xRight: unicornRect.right -120,
        };
    }
    if(gameSetting.testMode){
        testRect.style.left = `${unicornAria.xLeft}px`;
        testRect.style.right = `${window.innerWidth - unicornAria.xRight}px`;
        testRect.style.bottom = `${window.innerHeight - unicornAria.bottom}px`;    
    }
    for (const star of starsPoints){
        hit ||= (
            star.x > unicornAria.xLeft
            && star.x < unicornAria.xRight
            && star.y < unicornAria.bottom
        );
    }
    return hit;
}


/**
 * Get center of star position.
 * @param {DOMRect} domRectCenter 
 * @returns {object}  absolute position
 * 
 */
function getTopCenter(domRect){
    return {
        x: domRect.x + (domRect.width / 2),
        y: domRect.y
    };
}


/**
 * Game end event.
 * 1. Throw away unicorn
 * 2. Display result text
 */
async function onGameEnd(){
    console.log("DEAD END!!");
    const unicorn = document.getElementById("unicorn");
    unicorn.style.transition = "all 1s";
    unicorn.classList = "unicornDead";
    unicorn.style.left = `${-window.innerWidth}px`;
    unicorn.style.bottom = `${window.innerHeight}px`;
    document.getElementById("resultScoreText").textContent = `SCORE: ${unicornObj.score}`;
    await sleep(2000);
    document.getElementById("resultTextWrapper").style.display = "flex";
}


/**
 * key push event
 * @param {Event} e 
 */
function onKeyboardEvent(e){
    if (e.key == " " ||
        e.code == "Space" ||      
        e.keyCode == 32      
    ) {
        if(unicornObj.init && !unicornObj.running){
            startGame().then();
        } else if (unicornObj.running){
            unicornJump().then();
        }
    }
}


/**
 * for test mode.
 */
function toTestMode(){
    gameSetting.testMode = true;
    testRect.style.display = "block";
}


/**
 * Loaded event callback.
 */
async function onLoadEnd(){
    if (isSmartPhone()){
        document.getElementById("unicorn").style.width = "8rem";
    }
    document.getElementById("unicornDefault").addEventListener("click", ()=>{initGame().then();});
    document.getElementById("introductionTextWrapper").addEventListener("click", ()=>{startGame().then();});
    document.body.onkeydown = onKeyboardEvent;
}


/**
 * main loaded event
 */
document.addEventListener("DOMContentLoaded", () => onLoadEnd().then());
