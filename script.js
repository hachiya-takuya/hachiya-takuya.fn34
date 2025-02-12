'use strict'
// 1行目に記載している 'use strict' は削除しないでください

const vhPx = window.outerHeight / 100;
const vwPx = window.innerWidth / 100;

const testRect = document.getElementById("testRect");
let testMode = false;

const gameSetting = {
    jumpHeight: 100,
    jumpTime: 500,
    jumpInterval: 150,
    starIntervalMin: 800,  // [ms]
    starIntervalMax: 3000,  // [ms]
    starSpeed: 3,  // [s]
}


const unicornObj = {
    initStart: false,
    init: false,
    running: false,
    jumping: false,
    dead: false,
    score: 0,
};


async function initGame(){
    if(unicornObj.initStart){return;}
    unicornObj.initStart = true;
    const defaultUnicorn = document.getElementById("unicornDefault")
    const unicorn = document.getElementById("unicorn")
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

    unicorn.style.display = "block";
    unicorn.style.left = `${window.innerWidth*1.5}px`;
    unicorn.style.transition = "all 3s"
    await sleep(1);
    unicorn.style.left = `${1}rem`;
    await sleep(3100);
    document.getElementById("introductionTextWrapper").style.display = "flex";
    unicornObj.init = true;
}


async function startGame(){
    const unicorn = document.getElementById("unicorn")
    unicorn.style.transition = "none"
    document.getElementById("introductionTextWrapper").remove();
    document.body.onkeydown = KeyboardEvent;
    unicornObj.running = true;
    document.getElementById("gameWrapper").addEventListener("click", ()=>{unicornJump().then();});
    unicornObj.score = 0;
    starGenerator().then();
}


async function unicornJump(){
    const unicorn = document.getElementById("unicorn")
    if (unicornObj.jumping){return{}}
    unicorn.style.transition = "all 0.05s"
    unicorn.style["transition-timing-function"] = "ease-out"

    unicornObj.jumping = true;
    unicorn.style.bottom = `${gameSetting.jumpHeight}px`;
    await sleep(gameSetting.jumpTime);
    unicorn.style.transition = "all 0.05s"
    unicorn.style["transition-timing-function"] = "ease-in"    
    unicorn.style.bottom = `0px`;    
    await sleep(gameSetting.jumpInterval);
    unicornObj.jumping = false;
}


async function getNewStar()  {
    const star = document.createElement("img", );
    star.classList = "star";
    star.src = "./src/star.png";
    star.style.left = `${window.innerWidth}px`;
    star.style.transition = `all ${gameSetting.starSpeed}s`;
    star.style["transition-timing-function"] = "ease-in"
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


async function starGenerator(){
    console.log("Game Start!");
    hitJudge();
    while(unicornObj.running){
        await getNewStar();
        let next = getRandom(gameSetting.starIntervalMin, gameSetting.starIntervalMax);
        await sleep(next);
    }
}


async function hitJudge(){
    gameSetting.judgeIntervalId = setInterval(_hitJudge, 1)
}

function _hitJudge(){
    const unicornRect = document.getElementById("unicorn").getBoundingClientRect();
    const starsPoints = [...document.getElementsByClassName("star")].map((el) => getTopCenter(el.getBoundingClientRect()));
    if (_hit(unicornRect, starsPoints)){
        console.log("hit!")
        unicornObj.dead = true;
        unicornObj.running = false
        clearInterval(gameSetting.judgeIntervalId);
        onGameEnd().then();
    }
}


function _hit(unicornRect, starsPoints){
    let hit = false;
    const unicornAria = {
        bottom: unicornRect.bottom - 40,
        xLeft: unicornRect.x + 100,
        xRight: unicornRect.right -120,
    }
    if(testMode){
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
 * 
 * @param {DOMRect} domRectCenter 
 * @returns {object}  absolute position
 * 
 */
function getTopCenter(domRect){
    return {
        x: domRect.x + (domRect.width / 2),
        y: domRect.y
    }
}

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


function KeyboardEvent(e){
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


const sleep = time => new Promise((resolve) => setTimeout(resolve, time));
const getRandom = (min, max) => Math.floor((Math.random() * (max - min)) + min);
document.addEventListener("DOMContentLoaded", () => startEvent().then());

async function startEvent(){
    document.getElementById("unicornDefault").addEventListener("click", ()=>{initGame().then();})
    document.getElementById("introductionTextWrapper").addEventListener("click", ()=>{startGame().then();})
    document.body.onkeydown = KeyboardEvent;
}


function toTestMode(){
    testMode = true;
    testRect.style.display = "block";
}