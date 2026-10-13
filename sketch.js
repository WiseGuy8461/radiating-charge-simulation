const canvas = document.getElementById("electric-field");
const ctx = canvas.getContext("2d");
const playButton = document.getElementById("playButton");
const fieldBox = document.getElementById("showField");
const waveBox = document.getElementById("showWaves");
const linesBox = document.getElementById("showLines");
const trajectories = document.getElementById("trajectory");

const SCALE = 30;
const ARROW_SCALE = 50;
const MAX_ARROW_MAGNITUDE = 0.25;

let charge = {
    value: 5e-10,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    radius: 0.5
};

const k = 8.99*Math.pow(10,9);
const c = 25;

let time = 0;
let dt = 0.01;
let history = [];
let waveFronts = [];
let lastWaveFrontTime = 0;
const waveFrontInterval =0.05;
const accelerationTolerance = 90;
let play = true;

let arrows = false;
let waves = false;
let lines = false;

draw();

function drawBackground(){

    ctx.beginPath();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.moveTo(0,canvas.height/2);
    ctx.lineTo(canvas.width,canvas.height/2);
    ctx.moveTo(canvas.width/2,0);
    ctx.lineTo(canvas.width/2,canvas.height);
    ctx.stroke();
}

function drawCharge(x,y){
    const pixelP = worldToScreen(x,y);
    ctx.beginPath();
    ctx.fillStyle = "#0000FF";
    ctx.arc(pixelP.x,pixelP.y,charge.radius*SCALE,0,2*Math.PI);
    ctx.fill();

}
function drawAcceleration(x,y){
    drawArrow(x,y,charge.ax,charge.ay, Math.hypot(charge.ax,charge.ay)/75, false);
}

function drawArrow(x,y,Ex,Ey, colorScale,field){
    const p = worldToScreen(x,y);
    const magnitude = Math.hypot(Ex,Ey);

    if(magnitude === 0){
        return;
    }

    const theta = Math.atan2(Ey,Ex);
    const theta1 = theta - 3*Math.PI/4;
    const theta2 = theta + 3*Math.PI/4;

    


    const displayLength = ARROW_SCALE * colorScale;

    const ux = Ex/magnitude;
    const uy = Ey/magnitude;

    const tipX = p.x + ux*displayLength;
    const tipY = p.y - uy*displayLength;

    const headLength = 10;

    ctx.beginPath();
    if(field){    
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgb(255,255,${255*(1-colorScale)})`;
    } else{
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgb(0,255,255)`;
    }        
    ctx.moveTo(p.x,p.y);
    ctx.lineTo(tipX,tipY);

    ctx.moveTo(tipX,tipY);
    ctx.lineTo(
        tipX + headLength*Math.cos(theta1),
        tipY - headLength*Math.sin(theta1)
    );

    ctx.moveTo(tipX,tipY);
    ctx.lineTo(
        tipX + headLength*Math.cos(theta2),
        tipY - headLength*Math.sin(theta2)
    );

    ctx.stroke();
}

function drawField(){
    for(let i = 0;i<canvas.width;i+=canvas.width/30){
        for(let j = 0;j<canvas.height;j+=canvas.height/50){
            const p = screenToWorld(i,j);
            const E = calcE(p.x,p.y);
            if(Math.hypot(p.x-charge.x,p.y-charge.y)<=charge.radius) continue;
            drawArrow(p.x,p.y,E.x,E.y,1/(1+Math.pow(Math.E,-15*Math.hypot(E.x,E.y)+2)), true);
        }
    }
}

function drawWaveFronts() {
    for (let wave of waveFronts) {
        const radius = c * (time - wave.birthTime);
        const p = worldToScreen(wave.x, wave.y);

        const samples = 120;
        const maxDisplayStrength = 0.1;

        for (let i = 0; i < samples; i++) {
            const theta = 2 * Math.PI * i / samples;

            const x = wave.x + radius * Math.cos(theta);
            const y = wave.y + radius * Math.sin(theta);

            

            const E = calcErad(x, y);

            
            const normalized = E.magnitude / maxDisplayStrength;
            const opacity = 1 - Math.exp(-Math.pow(normalized,5));

            const p1 = worldToScreen(
                wave.x + radius * Math.cos(theta),
                wave.y + radius * Math.sin(theta)
            );

            const p2 = worldToScreen(
                wave.x + radius * Math.cos(theta + 2 * Math.PI / samples),
                wave.y + radius * Math.sin(theta + 2 * Math.PI / samples)
            );

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            
            ctx.strokeStyle = `rgba(0, 0, 255, ${opacity})`;
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    }
}

function drawLines(){
    const dr = 1;
    let a = Math.sqrt(3)/2;
    let in_x = new Array(12);
    let in_y = new Array(12);
    for(let i = 0; i<12;i++){
        in_x[i] = charge.x;
        in_y[i] = charge.y;
    }
    let dxs =[dr,dr*a,dr/2,0,dr/-2,-1*dr*a,-1*dr,-1*dr*a,dr/-2,0,dr/2,dr*a];
    let dys =[0,dr/2,dr*a,dr,dr*a,dr/2,0,-1*dr/2,-1*dr*a,-1*dr,-1*dr*a,dr/-2];
    let E;
    let Emag;
    let pos;
    let endpoint;
    
    for(let i = 0; i<20;i++){
        for(let angle = 0;angle<12;angle++){
            pos = worldToScreen(in_x[angle],in_y[angle]);
            endpoint = worldToScreen(in_x[angle]+dxs[angle],in_y[angle]+dys[angle]);
            ctx.beginPath();
            ctx.moveTo(pos.x,pos.y);
            ctx.lineTo(endpoint.x, endpoint.y);
            ctx.strokeStyle = `rgb(0,255,0)`;
            ctx.lineWidth=5;
            ctx.stroke();

            in_x[angle] += dxs[angle];
            in_y[angle] +=dys[angle];
            E = calcE(in_x[angle],in_y[angle]);
            Emag = Math.hypot(E.x,E.y);
            dxs[angle] = dr*E.x/Emag;
            dys[angle] = dr*E.y/Emag;
        }
    }
}

function draw(){
    if(play){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawBackground();
        updatePosition();
        if(lines){
            drawLines();
        }
            if(arrows){
            drawField();
        }
        if(waves){
            drawWaveFronts();
        }
        drawCharge(charge.x,charge.y);
        drawAcceleration(charge.x,charge.y);
    }        
    requestAnimationFrame(draw);
}

function worldToScreen(x,y){
    return {
        x: canvas.width/2+x*SCALE,
        y: canvas.height/2-y*SCALE
    };
}

function screenToWorld(x,y){
    return{
        x:(x-canvas.width/2)/SCALE,
        y:(canvas.height/2-y)/SCALE
    };
}

function calcState(){

    time+=dt;
    switch(trajectories.value){
        case "rest":
            charge.x = 0;
            charge.y = 0;
            charge.vx = 0;
            charge.vy = 0;
            charge.ax = 0;
            charge.ay = 0;
            break;
        case "sinusoidal":
            charge.x = 5*Math.cos(4*time);
            charge.y = 0;
            charge.vx = -20*Math.sin(4*time);
            charge.vy = 0;
            charge.ax = -80*Math.cos(4*time);
            charge.ay = 0;
            break;
        case "constant-acceleration":
            const edge = screenToWorld(0,canvas.height/2);
            const t = time % 3;
            charge.x = edge.x+4*t*t;
            charge.y = 0;
            charge.vx = 8*t;
            charge.vy = 0;
            charge.ax = 8;
            charge.ay = 0;
            break;             
        case "circular":
            charge.x = Math.cos(10*time);
            charge.y = Math.sin(10*time);
            charge.vx = -10*Math.sin(10*time);
            charge.vy = 10*Math.cos(10*time);
            charge.ax = -100*Math.cos(10*time);
            charge.ay = -100*Math.sin(10*time);
            break;
        case "linear":
            charge.x+=10*dt;
            if(worldToScreen(charge.x,0).x>canvas.width){
                deltax = screenToWorld(1.5*canvas.width,0).x;
                charge.x-=deltax;
            }
            charge.vx = 10;
            charge.y = 0;
            charge.vy = 0;
            charge.ax = 0;
            charge.ay = 0;
        default:
    }
}

function updatePosition(){

    calcState();
    

    history.push({
        t: time,
        x: charge.x,
        y: charge.y,
        vx: charge.vx,
        vy: charge.vy,
        ax: charge.ax,
        ay: charge.ay
    });

    if (time - lastWaveFrontTime >= waveFrontInterval) {
        waveFronts.push({
            x: charge.x,
            y: charge.y,
            birthTime: time
        });

        lastWaveFrontTime = time;
    }

    while(history.length > 2 && history[0].t < time - Math.hypot(canvas.width,canvas.height)/SCALE/c){
        history.shift();
    }
    while(waveFronts.length > 2 && waveFronts[0].birthTime<time-Math.hypot(canvas.width,canvas.height)/SCALE/c){
        waveFronts.shift();
    }
}

function calcErad(x, y) {
    let targetTime = time;
    let retState;
    let r;

    for (let i = 0; i < 5; i++) {
        retState = getChargeState(targetTime);
        r = Math.hypot(x - retState.x, y - retState.y);
        targetTime = time - r / c;
    }

    retState = getChargeState(targetTime);
    r = Math.hypot(x - retState.x, y - retState.y);

    if (r < 0.01) {
        return { x: 0, y: 0, magnitude: 0 };
    }

    const nx = (x - retState.x) / r;
    const ny = (y - retState.y) / r;

    const ax = retState.ax;
    const ay = retState.ay;

    const nDotA = nx * ax + ny * ay;

    const EradX = (k * charge.value) / (c * c * r) *
                  (nx * nDotA - ax);

    const EradY = (k * charge.value) / (c * c * r) *
                  (ny * nDotA - ay);

    return {
        x: EradX,
        y: EradY,
        magnitude: Math.hypot(EradX, EradY)
    };
}

function calcE(x,y){
    let r;
    let retState;
    let targetTime = time;

    for(let i = 0;i<5;i++){
        retState = getChargeState(targetTime);
        r = Math.hypot(x-retState.x,y-retState.y);
        targetTime = time-r/c;
        
    }

    retState = getChargeState(targetTime);
    r = Math.hypot(x-retState.x, y-retState.y);

    if (r < 0.01) return { x: 0, y: 0 };

    const nx = (x-retState.x)/r;
    const ny = (y-retState.y)/r;
    const betax = retState.vx/c;
    const betay = retState.vy/c;
    const betaxDot = retState.ax/c;
    const betayDot = retState.ay/c;

    const D = 1 - (nx*betax + ny*betay);
    const beta2 = betax*betax + betay*betay;
    
    let E = {
        x: 0,
        y: 0
    };

    const coulombFactor = (k * charge.value * (1 - beta2)) / (D * D * D * r * r);
    E.x += coulombFactor * (nx - betax);
    E.y += coulombFactor * (ny - betay);

    const n_dot_betaDot = nx * betaxDot + ny * betayDot;
    const radFactor = (k * charge.value) / (D * D * D * c * r);
    
    E.x += radFactor * ((nx - betax) * n_dot_betaDot - betaxDot * D);
    E.y += radFactor * ((ny - betay) * n_dot_betaDot - betayDot * D);

    return E;
}

function getChargeState(targetTime){
    if(history.length === 0) return {x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0};
    if(history[0].t>targetTime) return history[0];
    if(history[history.length-1].t<=targetTime) return history[history.length-1];

    for(let i = history.length-2;i>=0;i--){
        if(history[i].t<=targetTime && history[i+1].t>=targetTime){
            const alpha = (targetTime-history[i].t)/(history[i+1].t-history[i].t);
            return {
                x: history[i].x+alpha*(history[i+1].x-history[i].x),
                y: history[i].y+alpha*(history[i+1].y-history[i].y),
                vx: history[i].vx+alpha*(history[i+1].vx-history[i].vx),
                vy: history[i].vy+alpha*(history[i+1].vy-history[i].vy),
                ax: history[i].ax+alpha*(history[i+1].ax-history[i].ax),
                ay: history[i].ay+alpha*(history[i+1].ay-history[i].ay)
            };
        }
    }

    return history[history.length-1];
}

playButton.addEventListener("click",function(e){
    if(play){
        playButton.innerText="Play";        
    } else {
        playButton.innerText="Pause";
    }
    play = !play;
});

fieldBox.addEventListener("click",function(e){
    arrows=fieldBox.checked;
});

waveBox.addEventListener("click",function(e){
    waves=waveBox.checked;
});
linesBox.addEventListener("click", function(e){
    lines = linesBox.checked;
});