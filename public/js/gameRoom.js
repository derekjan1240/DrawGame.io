// alert('conect')
const socket = io();
const roomID = window.location.pathname.split("/")[3];
let userInfo = null;
let oppInfo = null;
let readyNum = 0;
let isGmaeStart = false;

// Get userInfo and Join Room
fetch('/data/user')
  .then((response) =>{
    return response.json(); 
  }).then((jsonData)=>{
    userInfo = jsonData; 
    socket.emit('joinRoom', {roomName: roomID, user: userInfo});   
  }).catch((err)=>{
      console.log(err);
  });

socket.on('illegalCreateRoom', (data)=>{
    alert(data.msg)
    window.location = "/";
})

socket.on('RoomIsFull', (data)=>{
    alert(data.msg)
    window.location = "/";
})
// When you are host
socket.on('opponentJoin', (data)=>{
    // console.log('opponentJoin');
    oppInfo = data.opponentInfo;
    document.getElementById('opponentName').innerHTML = data.opponentInfo.username;
    document.getElementById('opponentImg').src = data.opponentInfo.thumbnail;
    socket.emit('passHostInfoToOpponent', {roomName: roomID, user: userInfo});
})
// When you are guest
socket.on('hostInfoSet',(data)=>{
    // console.log('hostInfoSet');
    oppInfo = data.hostInfo;
    document.getElementById('opponentName').innerHTML = data.hostInfo.username;
    document.getElementById('opponentImg').src = data.hostInfo.thumbnail;
    socket.emit('startCheckRoom', {roomName: roomID});
})

socket.on('checkRoom',()=>{
    checkOpponentStillAtRoom();
})

socket.on('hostLeave',()=>{
    console.log('hostLeave');
    if(isGmaeStart){
        // Opponent win
        console.log('Opp win');
        roundOver(oppInfo, userInfo);
    }
    // Became room host
    window.location = `/game/room/${userInfo._id}`;
})

socket.on('opponentLeave',()=>{
    console.log('oppLeave');
    document.getElementById('opponentName').innerHTML = "Waitting ...";
    if(isGmaeStart){
        // Host win
        console.log('Host win');
        roundOver(userInfo, oppInfo);
    }
})

socket.on('opponentReady', ()=>{
    // console.log('opponentReady')
    readyNum++;
    document.getElementById('opponentSection').style.background='#78e08f';
    document.getElementById('opponentBtn').textContent = 'Unlock';
    checkReady()
})

socket.on('opponentOffReady', ()=>{
    readyNum--;
    document.getElementById('opponentSection').style.background='#ffeaa7';
    document.getElementById('opponentBtn').textContent = 'Clear';
})

socket.on('losing',()=>{
    clearTimeout(winnerCheck);
    console.log('You loss!');
    roundOver(oppInfo, userInfo);
})

function getReady(){
    readyNum++;
    document.getElementById('ownSection').style.background='#78e08f';
    document.getElementById('offReadyBtn').classList.remove("nonDisplayBtn");
    document.getElementById('ReadyBtn').classList.add("nonDisplayBtn");
    socket.emit('getReady', {roomName: roomID});
    checkReady();
}

function offReady(){
    readyNum--;
    document.getElementById('ownSection').style.background='#ffeaa7';
    document.getElementById('ReadyBtn').classList.remove("nonDisplayBtn");
    document.getElementById('offReadyBtn').classList.add("nonDisplayBtn");
    socket.emit('offReady', {roomName: roomID});
}

function checkReady(){
    // console.log('readyNum:', readyNum)
    if(readyNum==2){
        // start game
        startGame()
    }
}

function checkOpponentStillAtRoom(){
    // console.log('checkOpponentStillAtRoom!')
    socket.emit('checkOpponentStillAtRoom', {roomName: roomID, user: userInfo});
}

function startGame(){
    document.getElementById('gameSection').classList.remove("nonDisplaySection");
    document.getElementById('preGameSection').classList.add("nonDisplaySection");
    isGmaeStart = true;
    initGame();
}

// -----------------------------------
let canvas, ctx;
let mouseX, mouseY, mouseDown = 0,
    lastX, lastY;

socket.on('getPic', (dataURL) =>{
    document.getElementById('opponentSketchpad').src= dataURL.pic;
});

// join game room
// socket.emit('join', roomNum);

/* socket handle */
function scyncSketchapad(){
    canvas = document.getElementById('Sketchpad');
    let dataURL = canvas.toDataURL();
    socket.emit('passPicToServer', { pic: dataURL, roomName: roomID});
    setTimeout(()=>{
        scyncSketchapad()
    },200)
}

function disconnect(){
    socket.close();
}

/* Draw Function */ 
function onMouseDown() {
    mouseDown = 1
    draw(ctx, mouseX, mouseY, 2)
}

function draw(ctx,x,y,size) {
    // console.log(`x:${x} y:${y} lastX:${lastX} lastY:${lastY}`)
    // 解決連續筆觸
    if (lastX && lastY && (x !== lastX || y !== lastY)) {
        ctx.fillStyle = "#000000";
        ctx.lineWidth = 2 * size;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    lastX = x;
    lastY = y;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.open();
    socket.emit('showConnectedPeople');
}

function onMouseUp() {
    // console.log(`onMouseUp()\nlastX:${lastX} lastY:${lastY}`)
    mouseDown = 0;
    lastX = 0;
    lastY = 0;
}

function onMouseMove(e) {
    getMousePos(e)
    if (mouseDown == 1) {
        draw(ctx, mouseX, mouseY, 2)
    }
}

function getMousePos(e) {
    // console.log(`e:${e}`)
    if (!e)
        var e = event
    if (e.offsetX) {
        // console.log('offset')
        // console.log(e.offsetX, e.offsetY)
        mouseX = e.offsetX
        mouseY = e.offsetY
    }
    else if (e.layerX) {
        // alert('!')
        // console.log('layer')
        // console.log(e.layerX, e.layerY)
        mouseX = e.layerX
        mouseY = e.layerY
    }
 }

function initGame() {
    canvas = document.getElementById('Sketchpad');
    ctx = canvas.getContext('2d')
    canvas.addEventListener('mousedown', onMouseDown, false)
    canvas.addEventListener('mousemove', onMouseMove, false)
    window.addEventListener('mouseup', onMouseUp, false)
    // setCanvasSize
    canvas.height = window.innerHeight*0.5;
    canvas.width = window.innerWidth*0.4;
    // scyncCanvas
    scyncSketchapad();
    // checkWinner
    checkWinner();
}

function AI_Judge_Function(){
    // sent pic to network score>k trigger winning!
    let temp = Math.floor(Math.random()*10);
    if(temp==5){
        return true;
    }else{
        return false;
    }
}

function checkWinner(){
    let isOver = AI_Judge_Function(); //score>k => true(winning)
    
    console.log('AI Check winner!', isOver);
    if(isOver){
        // You win
        socket.emit('gameRoundOver',{roomName: roomID, winner: userInfo._id, loser: oppInfo._id});
        console.log('You win!')
        roundOver(userInfo, oppInfo);

    }else{
        winnerCheck = setTimeout(()=>{
            checkWinner();
        }, 1000)
    }
}

function roundOver(winner, losser){
    resetRoom()
}

// Round over reset
function resetRoom(){
    offReady()
    document.getElementById('gameSection').classList.add("nonDisplaySection");
    document.getElementById('preGameSection').classList.remove("nonDisplaySection");
    isGmaeStart = false;
}