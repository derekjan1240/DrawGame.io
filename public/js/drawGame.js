const socket = io({autoConnect: false});
let canvas, ctx;
let mouseX, mouseY, mouseDown = 0,
    lastX, lastY;
let penColor = '#000000', penSize=2;

socket.on('getPic', (dataURL) =>{
    let img = new Image;
    img.onload = function(){
        ctx.globalCompositeOperation = 'lighter';      
        ctx.drawImage(img, 0, 0);                         
    };
    img.src = dataURL.pic.data;
});

socket.on('resetSketchpad',()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

window.onload = function(){
    init();
}

/* socket handle */
function scyncSketchapad(){
    let dataURL = canvas.toDataURL();
    socket.emit('passPicToServerP', { data: dataURL});
    setTimeout(()=>{
        socket.connected? scyncSketchapad(): null;
    },200)
}

/* Draw Function */ 
function setEraser(){
    penColor = "#ffffff";
    penSize = 4;
}

function setPencil(){
    penColor = "#000000";
    penSize = 2;
}

function onMouseDown() {
    mouseDown = 1
    draw(ctx, mouseX, mouseY, penSize)
}

function draw(ctx,x,y,size) {
    // 解決連續筆觸
    if (lastX && lastY && (x !== lastX || y !== lastY)) {
        ctx.strokeStyle = penColor;
        ctx.fillStyle = penColor;
        ctx.lineWidth = 2 * size;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    ctx.fillStyle = penColor;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    lastX = x;
    lastY = y;
}

function clearCanvas() {
    socket.connected? socket.emit('clearCanvas') : ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function connect(){
    socket.open();
    socket.emit('showConnectedPeople');
    // Reset Sketchapad
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // scyncCanvas
    scyncSketchapad();
    document.getElementById('disconnect').classList.remove("nonDisplayBtn");
    document.getElementById('connect').classList.add("nonDisplayBtn");
}

function disconnect(){
    socket.close();
    document.getElementById('connect').classList.remove("nonDisplayBtn");
    document.getElementById('disconnect').classList.add("nonDisplayBtn");
    // Reset Sketchapad
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function onMouseUp() {
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
    if (!e)
        var e = event
    if (e.offsetX) {
        mouseX = e.offsetX
        mouseY = e.offsetY
    }
    else if (e.layerX) {
        mouseX = e.layerX
        mouseY = e.layerY
    }
 }

function init() {
    canvas = document.getElementById('Sketchpad');;
    ctx = canvas.getContext('2d')                             
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
}