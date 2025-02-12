'use strict'
// 1行目に記載している 'use strict' は削除しないでください

const vhPx = window.outerHeight / 100;
const vwPx = window.outerWidth / 100;

const gameSetting = {
    jumpHeight: 100,
    jumpTime: 500,
    jumpInterval: 150,
    hurdleIntervalMin: 800,  // [ms]
    hurdleIntervalMax: 3000,  // [ms]
    hurdleSpeed: 3,  // [s]
}


const unicornObj = {
    init: false,
    running: false,
    jumping: false,
};


async function initGame(){
    const defaultUnicorn = document.getElementById("unicornDefault")
    const unicorn = document.getElementById("unicorn")
    const unicornPosition = defaultUnicorn.getBoundingClientRect();
    const defaultBackground = document.getElementById("defaultBackground");
    const gameWrapper = document.getElementById("gameWrapper");
    
    defaultBackground.style.top = `${unicornPosition.top}px`;
    defaultBackground.style.left = `-${window.outerWidth}px`;
    defaultBackground.style.height = `${unicornPosition.height}px`;
    defaultBackground.style.display = "block";
    await sleep(400);
    defaultBackground.style.left = "0px";
    await sleep(450);
    defaultBackground.style.top = `0px`;
    defaultBackground.style.height = `100vh`;
    await sleep(1000);
    defaultUnicorn.style.left = `${window.outerWidth*1.5}px`;
    gameWrapper.style.display = "block";
    await sleep(1000);    
    document.getElementById("defaultElements").remove();

    unicorn.style.display = "block";
    unicorn.style.left = `${window.outerWidth*1.5}px`;
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
    hurdleGenerator().then();
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


async function getNewHurdle()  {
    const hurdle = document.createElement("img", );
    hurdle.classList = "hurdle";
    hurdle.src = "./src/star.png";
    hurdle.style.left = `${window.outerWidth}px`;
    hurdle.style.transition = `all ${gameSetting.hurdleSpeed}s`;
    hurdle.style["transition-timing-function"] = "ease-in"
    document.getElementById("gameWrapper").appendChild(hurdle);
    await sleep(1);
    hurdle.style.left = `-100px`;
    sleep(gameSetting.hurdleSpeed * 1000 + 1000).then(
        () => {
            hurdle.remove();
        }
    );
}

async function hurdleGenerator(){
    console.log("Game Start!");
    while(unicornObj.running){
        await getNewHurdle();
        let next = getRandom(gameSetting.hurdleIntervalMin, gameSetting.hurdleIntervalMax);
        console.log(`Next hurdle: ${next}[ms]`);
        await sleep(next);
    }
}

async function hitJudge(){
    while(true){
        // todo:
    }
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