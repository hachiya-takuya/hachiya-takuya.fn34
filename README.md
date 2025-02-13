# DIG developers go with the UNICORN!!!
この基礎演習講座で、毎日触れ合った、  
あのユニコーンが走り出す！  

<img src="https://cdn.dribbble.com/users/1281272/screenshots/4515441/unicorn.gif">


　

　


# こだわりポイント

## \[JS\] JSDOCを書いて、機能を見える化
それぞれしっかり書きました！
```js
/**
 * Actual hit judgement.
 * @param {object} unicornRect 
 * @param {object[]} starsPoints 
 * @returns {boolean} - judgement hit or not
 */
function _hit(unicornRect, starsPoints){
```


## \[JS\] 機能を関数に分けて、実装をしやすく
- `initGame`: 画面遷移/ゲームの初期化
- `startGame`: ゲーム開始処理
- `unicornJump`: ユニコーンがジャンプ!
- `starGenerator`: スターがランダムで現れる
  - `getNewStar`: 実際に一つのスターを生成
- `hitJudge`: 当たり判定のループ開始
  - `_hitJudge`: 当たり判定をして、当たったらゲーム終了の処理へ
    - `_hit`: 実際のあたり判定をする部分
    - `getTopCenter`: 現在の「スター」の位置を取得
- `onGameEnd`: ゲーム終了の処理
- `KeyboardEvent`: キーボードが押されたときの`eventListener`
- `onLoadEnd`: ページが読み込み終了した後の`eventListener`


## \[JS\] 最小限のグローバルスコープ定義
変数の名前が競合して、ぐちゃぐちゃにならないように、グローバルスコープでの変数定義を最小化(4つだけ)  
さらに、不意なオーバーライドを防ぐ為、全て`const`定義。
```js
// Global variable
const gameSetting = {
    jumpHeight: 100,
    jumpTime: 500,
    jumpInterval: 150,
    starIntervalMin: 800,  // [ms]
    starIntervalMax: 3000,  // [ms]
    starSpeed: 3,  // [s]
    testMode: false,
}
const unicornObj = {
    initStart: false,
    init: false,
    running: false,
    jumping: false,
    dead: false,
    score: 0,
};
const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
const testRect = document.getElementById("testRect");
```


## \[JS\] スコアの表示には、「テンプレートリテラル」を活用
```js
document.getElementById("resultScoreText").textContent = `SCORE: ${unicornObj.score}`;
```


## \[JS\] クリックイベント
画面のどこをクリックしてもジャンプしてくれるように、画面全体にDIV要素(ラッパー)を配置。  
ゲーム開始処理の中で、`click`のイベントリスナーへ追加。
```js
document.getElementById("gameWrapper").addEventListener("click", ()=>{unicornJump().then();});
```


## \[JS\]キーボードイベント
キーが押されるたびにトリガーされる、`onKeyboardEvent`を定義。  
押されたキーが\[SPACE\]だった場合に、ユニコーンの状態に応じて、実行する内容を変化。
```js
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

document.body.onkeydown = onKeyboardEvent;
```


## \[JS\] DOMが存在しないエラーを回避
`addEventListener`系の初期設定は、`DOMContentLoaded`のトリガーイベントに設定し、  
確実にHTMLのレンダリングが終わってから設定されるように。
```js
/**
 * Loaded event callback.
 */
async function onLoadEnd(){
    if (isSmartPhone()){
        document.getElementById("unicorn").style.width = "8rem";
    }
    document.getElementById("unicornDefault").addEventListener("click", ()=>{initGame().then();})
    document.getElementById("introductionTextWrapper").addEventListener("click", ()=>{startGame().then();})
    document.body.onkeydown = onKeyboardEvent;
}


/**
 * main loaded event
 */
document.addEventListener("DOMContentLoaded", () => onLoadEnd().then());

```


## \[JS\] 非同期/同期関数を意識した実装。
- `async`/`await`を使って、`Promise`を活用。  「待つときは待つ」同期処理。
- 平行してやりたいときは、`asyncFunc().then();`として、非同期で処理を実装。

HTML要素のアニメーションを待つために、  
以下の様に、「一定時間待つ」という関数を定義。
```js
const sleep = time => new Promise((resolve) => setTimeout(resolve, time));
```


## \[JS\] ランダムなタイミングで STAR を出現させる
1. 最大/最小の範囲の中からランダムで値を選ぶ関数。
2. 星を出現させる。
3. 選ばれた時間\[ms\]待つ。
4. 2と3を無限ループさせる。
```js
const getRandom = (min, max) => Math.floor((Math.random() * (max - min)) + min);

async function starGenerator(){
    while(unicornObj.running){
        await getNewStar();
        let next = getRandom(gameSetting.starIntervalMin, gameSetting.starIntervalMax);
        await sleep(next);
    }
}
```


## \[JS\] あたり判定
```js
async function hitJudge(){
    gameSetting.judgeIntervalId = setInterval(_hitJudge, 1)
}
```
`setInterval`関数を使って、1 \[ms\] 毎にあたり判定をトリガー。  
ユーザ操作と平行して、常にあたり判定を継続させる。

DOM要素の座標取得は、`.getBoundingClientRect()`メソッドで取得。
```js
Element.getBoundingClientRect();
```


## \[CSS\] HTML要素を「ゆっくり」動かす。
`transition`を使って、指定
```css
#unicornDefault{
    cursor: pointer;
    z-index: 128;
    position: relative;
    left: 0;
    transition: all 0.5s;
    transition-timing-function: ease-in;
}
```


## \[CSS\] HTML要素の点滅と回転
`@keyframes`を使って、アニメーションを定義し、使う事で、複雑な、動きを`CSS`で実現。
```css
@keyframes circle {
    100%{transform: rotate(0deg);}    
    0%{transform: rotate(360deg);}    
}

@keyframes blink{
    0% {opacity:0;}
    100% {opacity:1;}
}

#selector {
    animation: circle 1s linear infinite;
}
```


## \[JS / CSS\] レスポンシブ対応
スマホでもできるように、表示を調整。  
画面幅でデバイスを判定し、ユニコーンのサイズを調整。
```js
// script.js
const isSmartPhone = () => !!(window.matchMedia && window.matchMedia('(max-device-width: 480px)').matches);
```
```css
/* css */
@media (max-width: 450px) {
    #introductionTextWrapper,
    #resultTextWrapper{
        font-size: 8px;
    }
}
```


## \[HTML\] ブラウザのキャッシュ対応
せっかく修正したのに、ブラウザに反映されない、、、  
変更したら、読み直してほしい！  
`.js`, `.css`ファイルにバージョニングをすることでキャッシュから読み込まれるのを回避。
```html
<link rel="stylesheet" href="style.css?v=2025.02.12.04" />
<script type="text/javascript" src="script.js?v=2025.02.12.04"></script>
```


## \[GIT\] `README.md`を書いて知見を残す
このファイルを残して、gitで見えるように。  
誰でも「改善」ができるように。  
markdownも勉強しました！


## 調べるって楽しい、できるようになるって楽しい！<br>作ったのが動いたらもっと楽しい！！


### copyright
@ 2025.02  
DIG college, Toyota Motor Corporation.  
Hachiya Takuya.
