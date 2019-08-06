import {categories} from './categories.js';
const title = window.location.pathname.split("/")[2];
const STROKE_WEIGHT = 4;
const STROKE_COLOR = '#B9DBDB';
const BACKGROUND_COLOR = '#363B45';

const P5 = new p5((p5)=>{
    p5.setup = function(){
        const picTitle = document.getElementById('picTitle');
        picTitle.innerHTML= title.replace('%20',' ');
        picTitle.addEventListener('click', randomPic)
        init();
    }
})

function init(){
    let cnv = P5.createCanvas(255, 255);
    cnv.id('mycanvas');
    P5.background(BACKGROUND_COLOR);
    P5.noFill();
    P5.stroke(STROKE_COLOR);
    P5.strokeWeight(STROKE_WEIGHT);
    // console.log('Loading Pic ....');
    P5.loadJSON(`https://quickdrawfiles.appspot.com/drawing/${title}?id=&key=AIzaSyC0U3yLy_m6u7aOMi9YJL2w1vWG4oI5mj0`, drawPic, (err)=>{
        console.log(err)
        let index = Math.floor(Math.random()*categories.length);
        window.location=`/quickdraw/${categories[index].category}`
    });
    
}

function copyImg(){
    const imgCanvas = document.getElementById('mycanvas');
    let url = imgCanvas.toDataURL();
    document.getElementById('pic').src=url;
}

async function drawPic(data){
    let drawing = data.drawing;
    // console.log('Data:', drawing)
    // console.log('Start Drawing ....');
    for(let j=0; j<drawing.length; j++){
        let lastX=null, lastY=null;
        
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
    }  
    P5.clear();
    init();
}

function drawPath(lastX, lastY, x, y){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            (lastX && lastY)? P5.line(lastX, lastY, x, y): null;
            resolve(`N(${x}, ${y}) L(${lastX}, ${lastY})`);
        }, 10);
    })
}

function randomPic(){
    let index = Math.floor(Math.random()*categories.length);
    window.location=`/quickdraw/${categories[index].category}`
}