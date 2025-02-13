# DIG developers go with the UNICORN!!!
この基礎演習講座で、毎日触れ合った、  
あのユニコーンが走り出す！


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

## \[JS\] 動きを待つために、非同期/同期関数を意識した実装。
以下の様に、「一定時間待つ」という関数を定義。
```js
const sleep = time => new Promise((resolve) => setTimeout(resolve, time));
```
- `async`/`await`を使って、`Promise`を活用。  「待つときは待つ」同期処理。
- 平行してやりたいときは、`asyncFunc().then();`として、同期処理を実装。


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

## \[JS\] クリックイベント
画面のどこをクリックしてもジャンプしてくれるように、ラッパーを画面全体に設置。  
ゲーム開始処理の中で、イベントリスナーへ追加。
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

## \[JS\] あたり判定
```js
async function hitJudge(){
    gameSetting.judgeIntervalId = setInterval(_hitJudge, 1)
}
```
`setInterval`関数を使って、1 \[ms\] 毎にあたり判定をトリガー。  
ユーザ操作と平行して、常にあたり判定を継続させる。


## \[CSS\] オブジェクトの点滅と回転
`ceyframes`を使って、アニメーションを定義し、使う事で、複雑な、動きを`CSS`で実現。
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

## \[JS\] レスポンシブ対応
スマホでもできるように、表示を調整。  
画面幅でデバイスを判定し、ユニコーンのサイズを調整。
```js
const isSmartPhone = () => !!(window.matchMedia && window.matchMedia('(max-device-width: 480px)').matches);
```


## \[GIT\] `README.md`を書いて知見を残す
このファイルを残して、gitで見えるように。  
誰でも「改善」ができるように！!  
markdownも勉強しました！


### copyright
@ 2025.02  
DIG college, Toyota Motor Corporation.  
Hachiya Takuya.
