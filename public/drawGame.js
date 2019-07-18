// alert('connect');
var socket = io();
var canvas, ctx;
var mouseX, mouseY, mouseDown = 0,
    lastX, lastY;

socket.on('getPic', (dataURL) =>{
    // console.log(dataURL.pic.data);
    document.getElementById('image').src= dataURL.pic.data;
});

window.onload = function(){
    init();
}

// join game room
// socket.emit('join', roomNum);

/* socket handle */
function scyncSketchapad(){
    canvas = document.getElementById('Sketchpad');
    let dataURL = canvas.toDataURL();
    socket.emit('passPicToServer', { data: dataURL});
    setTimeout(()=>{
        scyncSketchapad()
    },200)
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
        alert('!')
        console.log('layer')
        console.log(e.layerX, e.layerY)
        mouseX = e.layerX
        mouseY = e.layerY
    }
 }

function init() {
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
}