const socket = io({autoConnect: false});
let index = 0;

socket.on('findFalse',(data)=>{
    document.getElementById('hintMsg').innerHTML = data.msg;
});

socket.on('findTrue',(data)=>{
    window.location = data.url;
});

function colorImg(){ 
    let img =["/pic/painter.png", "/pic/painter-colored.png"];
    let painter = document.getElementById('painter');
    index++;
    console.log(img[index%1], index)
    painter.src = img[index%2];
}

function goGameRoom(){
    let roomID = document.getElementById('roomID');
    socket.open();
    socket.emit('findRoom', {roomName: roomID.value});
    // window.location = `/game/room/${roomID.value}`;
}