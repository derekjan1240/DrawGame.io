const title = window.location.pathname.split("/")[2];
let dataSet = null;

function setup() {
    const picTitle = document.getElementById('picTitle');
    picTitle.innerHTML= title;
    init();
}

function init(times=1){
    let cnv = createCanvas(255, 255);
    cnv.id('mycanvas');
    background('#363B45');
    if(times == 1){
        loadJSON(`/quickdrawDataStreaming/${title}`, gotPic, (err)=>{
            console.log(err)
            window.location='/quickdraw/TheMonaLisa'
        });
    }else{
        drawPic();
    }
}

function gotPic(data){
    // Got GotSet
    dataSet = data;
    drawPic();
}

function copyImg(){
    const imgCanvas = document.getElementById('mycanvas');
    let url = imgCanvas.toDataURL();
    document.getElementById('pic').src=url;
}

async function drawPic(){
    let index = Math.floor(Math.random()* dataSet.length);
    let drawing = dataSet[index].drawing;
    console.log(drawing)
    for(let j=0; j<drawing.length; j++){
        let lastX=null, lastY=null;
        noFill();
        stroke('#B9DBDB');
        strokeWeight(3);
        // beginShape();
        for(let i=0; i<drawing[j][0].length; i++){
            let x = drawing[j][0][i];
            let y = drawing[j][1][i];
            // console.log(`N(${x}, ${y}) L(${lastX}, ${lastY})`);
            await drawPath(lastX, lastY, x, y).then((value)=>{
                copyImg();
            });
            lastX = x;
            lastY = y;
        }
        console.log(j)
    }  
    setTimeout(()=>{
        clear();
        init('reDraw');
    },10);
}

function drawPath(lastX, lastY, x, y){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            (lastX && lastY)? line(lastX, lastY, x, y): null;
            resolve(`N(${x}, ${y}) L(${lastX}, ${lastY})`);
        }, 20);
    })
}