let canvas;
var pg, click;

let helvetica;
let pressstart;
let blurShader;

var shouldReset = true;

var firstClick = false;

var N = 15;
var D = 20;
var matrix = [];
var pv, vv, av;

var alphab = 'ABCDEFGHIJ0123456789.'
var alhapbImgs = {};

function preload() {
    helvetica = loadFont('assets/HelveticaNeueBd.ttf');
    pressstart = loadFont('assets/PressStart2P-Regular.ttf');
    blurShader = loadShader('assets/blur.vert', 'assets/blur.frag');
}

function setup(){
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    pg = createGraphics(width, height, WEBGL);
    click = createGraphics(width, height);

    for(var k = 0; k < alphab.length; k++){
        alhapbImgs[alphab[k]] = createGraphics(25, 25);
        alhapbImgs[alphab[k]].clear();
        alhapbImgs[alphab[k]].textFont(pressstart);
        alhapbImgs[alphab[k]].textSize(20);
        alhapbImgs[alphab[k]].textAlign(CENTER, CENTER);
        alhapbImgs[alphab[k]].fill(10);
        alhapbImgs[alphab[k]].text(alphab[k], 15, 15);
    }

    reset();

    initMatrix();

    pg.colorMode(HSB, 100);
    pg.imageMode(CENTER);

}

var mx, my;
var ppv;

var impactx = -10000;
var impacty = -10000;

function draw(){

    drawMatrix(pg);

    var aa = N*D/2;

    av.mult(0);
    var toc = createVector(0, 0);
    toc.x += random(-N*D/2, N*D/2)*0;
    toc.y += random(-N*D/2, N*D/2)*0;
    toc = p5.Vector.sub(toc, pv);
    toc.normalize();
    if(random(100) > 96 && pv.mag() < N*D/2*1.3){
        //av.add(p5.Vector.mult(toc, 20));
        //av.rotate(radians(random(-60, 60)));
    }
    pg.stroke(60, 80, 90);
    //pg.line(pv.x, pv.y, pv.x+av.x*10, pv.y+av.y*10);
    //toc.mult(-1);

    var nz = createVector(0, 0);
    nz.x = -1 + 2*power(noise(pv.x*0.001, pv.y*0.001, 9331.31+frameCount*0.0031), 2);
    nz.y = -1 + 2*power(noise(pv.x*0.001, pv.y*0.001, 883.432+frameCount*0.0031), 2);
    nz.mult(1.4);

    //pg.stroke(18);
    //pg.line(pv.x, pv.y, pv.x+nz.x*150, pv.y+nz.y*150);

    toc.mult(2);
    if(pv.mag() < N*D*1.4)
        toc.mult(0.5);
    av.add(toc);
    av.add(nz);


    vv.add(av);
    vv.mult(0.99);

    ppv = pv.copy();
    pv.add(vv);

    if(pv.y < aa && pv.y > -aa){
        if(pv.x < aa && ppv.x > aa){ // right bounce
            pv.sub(vv);
            impacty = pv.y + vv.y/2;
            impactx = pv.x + vv.x/2;
            vv.set(-vv.x, vv.y);
            if(random(100) > 70){
                vv.mult(random(1, 1.25));
                vv.x *= random(1, 1.4);
            }
            pv.add(vv);
        }
        if(pv.x > -aa && ppv.x < -aa){ // left bounce
            pv.sub(vv);
            impacty = pv.y + vv.y/2;
            impactx = pv.x + vv.x/2;
            vv.set(-vv.x, vv.y);
            if(random(100) > 70){
                vv.mult(random(1, 1.25));
                vv.x *= random(1, 1.4);
            }
            pv.add(vv);
        }
    }
    if(pv.x < aa && pv.x > -aa){
        if(pv.y < aa && ppv.y > aa){ // right bounce
            pv.sub(vv);
            impacty = pv.y + vv.y/2;
            impactx = pv.x + vv.x/2;
            vv.set(vv.x, -vv.y);
            if(random(100) > 70){
                vv.mult(random(1, 1.25));
                vv.y *= random(1, 1.4);
            }
            pv.add(vv);
        }
        if(pv.y > -aa && ppv.y < -aa){ // left bounce
            pv.sub(vv);
            impacty = pv.y + vv.y/2;
            impactx = pv.x + vv.x/2;
            vv.set(vv.x, -vv.y);
            if(random(100) > 70){
                vv.mult(random(1, 1.25));
                vv.y *= random(1, 1.4);
            }
            pv.add(vv);
        }
    }

    pg.fill(0, 80, 90);
    pg.noStroke();
    //pg.ellipse(pv.x, pv.y, 20, 20);
    pg.imageMode(CENTER);
    pg.image(alhapbImgs["A"], pv.x, pv.y);



    shaderOnCanvas(pg);
    //print(pg)
}


function drawMatrix(pg){
    pg.background(80);
    pg.noStroke();

    var tempmat = []

    var its = 0;
    if(frameCount%3 == 0)
        its = 1;
    for(var it = 0; it < its; it++){
        for(var j = 0; j < N; j++){
            var row = [];
            tempmat.push([])
            for(var i = 0; i < N; i++){
                tempmat[j][i] = matrix[j][i];
            }
            for(var i = 0; i < N; i++){
                var x = i*D - (N-1)/2*D;
                var y = j*D - (N-1)/2*D;
                matrix[j][i] = round(matrix[j][i]*0.8);


                if(i > 0 && i < N-1 && j > 0 && j < N-1){
                    var val = matrix[j+1][i+0]
                                 + matrix[j-1][i+0]
                                 + matrix[j+0][i+0]
                                 + matrix[j+1][i+1]
                                 + matrix[j-1][i+1]
                                 + matrix[j+0][i+1]
                                 + matrix[j+1][i-1]
                                 + matrix[j-1][i-1]
                                 + matrix[j+0][i-1]
                    tempmat[j][i] = tempmat[j][i] + ceil((floor(val / 9)-tempmat[j][i])*0.1);
                }
                if(i == 0 && j > 0 && j < N-1){
                    var val = matrix[j+1][i+0]
                                 + matrix[j-1][i+0]
                                 + matrix[j+0][i+0]
                                 + matrix[j+1][i+1]
                                 + matrix[j-1][i+1]
                                 + matrix[j+0][i+1];
                    tempmat[j][i] = tempmat[j][i] + ceil((floor(val / 6)-tempmat[j][i])*0.1);
                }
                if(j == 0 && i > 0 && i < N-1){
                    var val = matrix[j+1][i+0]
                                 + matrix[j+0][i+0]
                                 + matrix[j+1][i+1]
                                 + matrix[j+0][i+1]
                                 + matrix[j+1][i-1]
                                 + matrix[j+0][i-1]
                    tempmat[j][i] = tempmat[j][i] + ceil((floor(val / 6)-tempmat[j][i])*0.1);
                }
                if(i == N-1 && j > 0 && j < N-1){
                    var val = matrix[j+1][i+0]
                                 + matrix[j-1][i+0]
                                 + matrix[j+0][i+0]
                                 + matrix[j+1][i-1]
                                 + matrix[j-1][i-1]
                                 + matrix[j+0][i-1]
                    tempmat[j][i] = tempmat[j][i] + ceil((floor(val / 6)-tempmat[j][i])*0.1);
                }
                if(j == N-1 && i > 0 && i < N-1){
                    var val = matrix[j-1][i+0]
                                 + matrix[j+0][i+0]
                                 + matrix[j-1][i+1]
                                 + matrix[j+0][i+1]
                                 + matrix[j-1][i-1]
                                 + matrix[j+0][i-1]
                    tempmat[j][i] = tempmat[j][i] + ceil((floor(val / 6)-tempmat[j][i])*0.1);
                }
            }
        }
        matrix = tempmat;
    }

    for(var j = 0; j < N; j++){
        var row = [];
        for(var i = 0; i < N; i++){
            var x = i*D - (N-1)/2*D;
            var y = j*D - (N-1)/2*D;
            if(dist(x, y, impactx, impacty) < D*1.8 && (i==0 || i==N-1 || j==0 || j==N-1)){
                matrix[j][i] = alphab.length-2;
                impactx = -10000;
                impacty = -10000;
            }
        }
    }

    for(var j = 0; j < N; j++){
        var row = [];
        for(var i = 0; i < N; i++){
            var x = i*D - (N-1)/2*D;
            var y = j*D - (N-1)/2*D;
            pg.fill(0);
            if(matrix[j][i] > 0){
                pg.image(alhapbImgs[alphab[matrix[j][i]]], x, y);
                pg.fill(0, 100, matrix[j][i]);
            }
            else{
                pg.image(alhapbImgs["."], x, y);
            }
            //pg.ellipse(x, y, D, D);
        }
    }

    //pg.stroke(0);
    //pg.line(-width/2, -height/2, width/2, height/2);
    //pg.line(+width/2, -height/2, -width/2, height/2);

}

function initMatrix(){
    for(var j = 0; j < N; j++){
        var row = [];
        for(var i = 0; i < N; i++){
            row.push(0);
        }
        matrix.push(row);
    }

    var aa = N*D/2;
    var px = random(aa, width/2);
    if(random(100)<50)
        px = -random(aa, width/2);
    var py = random(aa, height/2);
    if(random(100)<50)
        py = -random(aa, height/2);

    pv = createVector(px, py);
    vv = createVector(1, 0);
    vv.rotate(random(1000));
    av = createVector(0, 0);

}

function reset(){
    randomSeed(random(millis()));
    noiseSeed(random(millis()*12.314));

    blurShader.setUniform('texelSize', [1 / width, 1 / height]);
    blurShader.setUniform('grunge', random(1.6));
    blurShader.setUniform('grunge2', random(0.3, 0.6));
    blurShader.setUniform('frq1', random(0.003, 0.008));
    blurShader.setUniform('frq2', random(0, 1));
    blurShader.setUniform('frq3', random(0, 1));
    blurShader.setUniform('frq4', random(0, 1));
    blurShader.setUniform('frq5', random(0, 1));
    blurShader.setUniform('frq6', random(0, 1));

}



function shaderOnCanvas(tex){
    blurShader.setUniform('tex0', tex);
    shader(blurShader);
    fill(255);
    rect(-width/2, -height/2, width, height);
}



var shapes = [];
var vels = [];
var isdrawing = false;

function handleMoved(){
    
}

function handleEnd(){

}

function touchMoved() {
    handleMoved();
}

function mouseDragged() {
    handleMoved();
}

function touchEnded(){
    handleEnd();
}

function mouseReleased() {
    handleEnd();
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    pg = createGraphics(width, height);
    reset();
}

function power(p, g) {
    if (p < 0.5)
        return 0.5 * pow(2*p, g);
    else
        return 1 - 0.5 * pow(2*(1 - p), g);
}