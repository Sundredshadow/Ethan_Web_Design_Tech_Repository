// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

const app = new PIXI.Application(600,600);
document.body.appendChild(app.view);

//download video
// create a video texture from a path
// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
PIXI.loader.
add(["images/Spaceship.png","images/explosions.png","images/background.jpg"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;
let video;

// game variables
let startScene;
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound, startSound,fireballSound,levelLabel,scanLabel,descriptionLabel;
let instructionScene;//added scene
let gameOverScene;
let gameOverScoreLabel;

let circles = [];
let squares=[];
let ports=[];//list of ports
let filters=[];//list of filters
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let type="fin"
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let bulletInterval=60;
let color=0x00FF00;


function createLabelsAndButtons(){
    let buttonStyle=new PIXI.TextStyle({
        fill: 0x00FF00,
        fontSize: 48,
        fontZFamily: "Futura"
    });

    let startLabel1=new PIXI.Text("Hacker Man!");
    startLabel1.style=new PIXI.TextStyle({
        fill: 0x000000,
        fontSize:96,
        fontFamily: 'Futura',
        stroke: 0x00FF00,
        strokeThickness: 6
    });
    startLabel1.x=40;
    startLabel1.y=120;
    startScene.addChild(startLabel1);

    let startLabel2= new PIXI.Text("Hack em\n");
    startLabel2.style=new PIXI.TextStyle({
        fill:0x000000,
        fontSize:32,
        fontFamily:'Futura',
        fontStyle: "italic",
        stroke: 0x00FF00,
        strokeThickness:6
    });
    startLabel2.x=250;
    startLabel2.y=300;
    startScene.addChild(startLabel2);

    let startButton= new PIXI.Text("Enter, ... if you dare!");
    startButton.style=buttonStyle;
    startButton.x=80;
    startButton.y=sceneHeight-100;
    startButton.interactive=true;
    startButton.buttonMode=true;
    startButton.on("pointerup",openInstructions);
    startButton.on('pointerover',e=>e.target.alpha=0.7);
    startButton.on('pointerout', e=>e.currentTarget.alpha=1.0);
    startScene.addChild(startButton);

    let textStyle=new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0x00FF00,
        strokeThickness: 4
    });

    //exit instructions
    let startButton2= new PIXI.Text("Enter Game");
    startButton2.style=buttonStyle;
    startButton2.x=80;
    startButton2.y=sceneHeight-100;
    startButton2.interactive=true;
    startButton2.buttonMode=true;
    startButton2.on("pointerup",startGame);
    startButton2.on('pointerover',e=>e.target.alpha=0.7);
    startButton2.on('pointerout', e=>e.currentTarget.alpha=1.0);
    instructionScene.addChild(startButton2);
    //instruction text
    let instructions = new PIXI.Text("Instructions:\nObjective:Defeat all enemies or enter a valid port.\nPress W to change scan type:\nThe scan types are syn and fin\nSyn checks if the box on the top(port) is open\nFin filters the top box(port) and is indicated by bottom\nMeaning that if filter is true for a port\nIt could potentially be open or closed\nExample:");
    instructions.style=textStyle;
    instructions.x=0;
    instructions.y=0;
    instructionScene.addChild(instructions);

    let f=new Filter(0xFFFFFF,175,200,1);
    let p=new Port(0xFFFFFF,175,200,1)
    instructionScene.addChild(f);
    instructionScene.addChild(p);
    let example1 = new PIXI.Text("Unscanned");
    example1.style=textStyle;
    example1.x=170;
    example1.y=285;
    instructionScene.addChild(example1);

    f=new Filter(0x00FF00,275,200,1);
    p=new Port(0xFF0000,275,200,1)
    instructionScene.addChild(f);
    instructionScene.addChild(p);
    let example2 = new PIXI.Text("open/closed");
    example2.style=textStyle;
    example2.x=270;
    example2.y=285;
    instructionScene.addChild(example2);

    f=new Filter(0xFF0000,375,200,1);
    p=new Port(0xFF0000,375,200,1)
    instructionScene.addChild(f);
    instructionScene.addChild(p);
    let example3 = new PIXI.Text("closed");
    example3.style=textStyle;
    example3.x=385;
    example3.y=285;
    instructionScene.addChild(example3);

    f=new Filter(0xFF0000,475,200,1);
    p=new Port(0x00FF00,475,200,1)
    instructionScene.addChild(f);
    instructionScene.addChild(p)
    let example4 = new PIXI.Text("open");
    example4.style=textStyle;
    example4.x=490;
    example4.y=285;
    instructionScene.addChild(example4);

    let instructions2 = new PIXI.Text("Note:\nYou will take 20% damage on enemy hit.\nInstant death on invalid port on 2nd hit.\nFilter will disapear after 2nd hit");
    instructions2.style=textStyle;
    instructions2.x=0;
    instructions2.y=400;
    instructionScene.addChild(instructions2);

    scoreLabel = new PIXI.Text();
    scoreLabel.style=textStyle;
    scoreLabel.x=5;
    scoreLabel.y=574;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    lifeLabel=new PIXI.Text();
    lifeLabel.style=textStyle;
    lifeLabel.x=5;
    lifeLabel.y=526;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    levelLabel=new PIXI.Text();
    levelLabel.style=textStyle;
    levelLabel.x=150;
    levelLabel.y=574;
    gameScene.addChild(levelLabel);

    scanLabel=new PIXI.Text();
    scanLabel.style=textStyle;
    scanLabel.x=5;
    scanLabel.y=500;
    gameScene.addChild(scanLabel);
    scanLabel.text=`Scan Type: ${type}`;

    descriptionLabel=new PIXI.Text();
    descriptionLabel.style=textStyle;
    descriptionLabel.x=100;
    descriptionLabel.y=300;
    gameScene.addChild(descriptionLabel);

    let gameOverText= new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0x00FF00,
        strokeThickness: 6
    });
    gameOverText.style=textStyle;
    gameOverText.x=100;
    gameOverText.y=sceneHeight/2-160;
    gameOverScene.addChild(gameOverText);

    gameOverScoreLabel=new PIXI.Text("");
    gameOverScoreLabel.style=textStyle;
    gameOverScoreLabel.x=100;
    gameOverScoreLabel.y=400;
    gameOverScene.addChild(gameOverScoreLabel);

    let playAgainButton=new PIXI.Text("Play Again?");
    playAgainButton.style=buttonStyle;
    playAgainButton.x=150;
    playAgainButton.y=sceneHeight-100;
    playAgainButton.interactive=true;
    playAgainButton.buttonMode=true;
    playAgainButton.on("pointerup",startGame);
    playAgainButton.on('pointerover',e=>e.target.alpha=0.7);
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha=1.0);
    gameOverScene.addChild(playAgainButton);
}
function increaseScoreBy(value){
    score+=value;
    scoreLabel.text=`Score: ${score}`;
}
function decreaseLifeBy(value){
    if(levelNum!=1){
    life -= value;
    life =parseInt(life);
    lifeLabel.text=`Life: ${life}%`;
    }
}
function openInstructions(){
    startScene.visible=false;
    instructionScene.visible=true;
}
function startGame()
{
    startScene.visible=false;
    instructionScene.visible=false;
    gameOverScene.visible=false;
    gameScene.visible=true;
    levelNum=0;
    score=0;
    life=100;
    type="fin";
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x=300;
    ship.y=550;
    loadLevel();
}
function createCircles(numCircles){
    for(let i=0; i<numCircles;i++){
        let indicator=Math.random();//indicates what type it is as well as color
        let type="syn";
        let color=0x000000;
        if(indicator>=0.5){color=0x00FF00;}
        else{color=0xFF0000;type="fin"}
        let c=new Circle(10, color,Math.random()*(sceneWidth-50)+25,Math.random()*(sceneHeight-400)+150,type);
        circles.push(c);
        gameScene.addChild(c);
    }
}
function createSquares(numSquares){
    for(let i=0; i<numSquares;i++){
        let indicator=Math.random();//indicates what type it is as well as color
        let type="syn";
        let color=0x000000;
        if(indicator>=0.5){color=0x00FF00;}
        else{color=0xFF0000;type="fin"}
        let c=new Square(color,Math.random()*(sceneWidth-50)+25,Math.random()*(sceneHeight-400)+150,type);
        squares.push(c);
        gameScene.addChild(c);
    }
}
function createPorts(){//creates 8 ports and establishes if it is open or not
    for(let i=0; i<8;i++)
    {
        let f=createFilter(i);
        let p=new Port(0xFFFFFF,75*i,0,Math.round(Math.random()),f);//using filtered gives an indication to port wether its filter is filtered or not
        ports.push(p);
        gameScene.addChild(p);
    }
}
function createFilter(i){//creates filter for the specific port
    //return 0 or 1 which gives true or false for filtered
    let f=new Filter(0xFFFFFF,75*i,0,Math.round(Math.random()));
    filters.push(f);
    gameScene.addChild(f);
    return f.filtered;
}
function fireBullet(e){//fires onclick
    if(paused) return;
    let b =new Bullet(color, ship.x, ship.y, type);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}
/*
function fireBullet(){//fires on regular intervals
    if(paused) return;
    let b =new Bullet(0xFFFFFF, ship.x, ship.y,type);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}*/
function onKeyDown(key){//on w key change type of bullet
    color=0x00FF00;
    if(key.keyCode===87)
    {   
        if(type=="syn")
        {
            type="fin";
            color=0xFF0000;
        }
        else{type="syn"}
    }
    scanLabel.text=`Scan Type: ${type}`;
    scoreLabel.style.stroke=color;
}
function loadSpriteSheet(){
    let spriteSheet=PIXI.BaseTexture.fromImage("images/explosions.png");
    let width=32;
    let height=32;
    let numFrames=8;
    let textures=[];
    for(let i=0; i<numFrames; i++){
        let frame= new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 32, width,height));
        textures.push(frame);
    }
    return textures;
}
function createExplosion(x,y,frameWidth,frameHeight){
    let w2=frameWidth/2;
    let h2=frameHeight/2;
    let expl=new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x=x-w2;
    expl.y=y-h2;
    expl.animationSpeed=1/7;
    expl.loop=false;
    expl.onComplete=e=>gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}
function loadLevel(){
    ports.forEach(p=>gameScene.removeChild(p));
    ports=[];
    filters.forEach(f=>gameScene.removeChild(f));
    filters=[];
    bullets.forEach(b=>gameScene.removeChild(b));
    bullets=[];
    circles.forEach(c=>gameScene.removeChild(c));
    circles=[];
    squares.forEach(s=>gameScene.removeChild(s));
    squares=[];
    levelNum++;
    createPorts();
    if(levelNum==1)
    {
        //demo level shows how filter mechanic works
        descriptionLabel.text=`Description: Most Basic Firewall: Stateless\nBlocks and masks traffic as indicated cannot block malicous ip's.\n(cannot lose)`;
    }
    else if(levelNum==2)
    {
        descriptionLabel.text=`Description: Stateful firewall:\nRecords info on what has happened reacts to traffic,\nbut only when provoked.`;
        createSquares(levelNum * 5);
    }
    else if(levelNum==3)
    {
        descriptionLabel.text=`Description: Application Layer Gateway:\nReacts to application being used in the request.\n`;
        createCircles(levelNum*5);
    }
    else
    {
        descriptionLabel.text="";
        createCircles(20);
        createSquares(20);
    }
    /*for automatic shooting
    if(levelNum%5==0)
    {
        if(bulletInterval-10>0)
        {
            bulletInterval-=10;
        }
    }*/
    levelLabel.text=`Level: ${levelNum-1}`;
	paused = false;
}
function end(){
    paused=true;

    score+=100*(levelNum-1);
    gameOverScoreLabel.text="Your score: "+score;

    circles.forEach(c=>gameScene.removeChild(c));
    circles=[];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets=[];

    explosions.forEach(e=>gameScene.removeChild(e));
    explosions=[];

    ports.forEach(p=>gameScene.removeChild(p));
    ports=[];

    filters.forEach(f=>gameScene.removeChild(f));
    filters=[];

    gameOverScene.visible=true;
    gameScene.visible=false;
}
//let count=0;for firing at regular interval
function setup() {
    stage = app.stage;
	// #1 - Create the `start` scene
    startScene=new PIXI.Container();
    stage.addChild(startScene);
    let spriteBackground= new PIXI.Sprite(PIXI.loader.resources["images/background.jpg"].texture);
    startScene.addChild(spriteBackground);
    //instruction scene
    instructionScene=new PIXI.Container();
    instructionScene.visible=false;
    stage.addChild(instructionScene);
    // #2 - Create the main `game` scene and make it invisible
    gameScene=new PIXI.Container();
    gameScene.visible=false;
    stage.addChild(gameScene);
	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene=new PIXI.Container();
    gameOverScene.visible=false;
    stage.addChild(gameOverScene);
	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();
	// #5 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);
	// #6 - Load Sounds
	shootSound= new Howl({
        src:['sounds/SoundEffect-Laser.mp3']
    });
    hitSound=new Howl({
        src:['sounds/hit.mp3']
    });
    fireballSound=new Howl({
        src:['sounds/ShortCircuitSoundEffect.mp3']
    });
    startSound=new Howl({
        src:['sounds/Hackerman-KungFury.mp3']
    });
	// #7 - Load sprite sheet
	explosionTextures = loadSpriteSheet();
	// #8 - Start update loop
	app.ticker.add(gameLoop);
	// #9 - Start listening for click events on the canvas
    app.view.onclick=fireBullet;
    //listen to keyevent
    document.addEventListener('keydown',onKeyDown);
	// Now our `startScene` is visible
    // Clicking the button calls startGame()
    startSound.play();
}
function gameLoop(){
	if (paused) return; // keep this commented out for now
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	// #2 - Move Ship
	let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //ship.position = mousePosition;
    
    let amt = 6*dt;

    let newX=lerp(ship.x, mousePosition.x,amt);
    let newY=lerp(ship.y, mousePosition.y, amt);

    let w2=ship.width/2;
    let h2=ship.height/2;
    ship.x=clamp(newX,0+w2,sceneWidth-w2);
    ship.y=clamp(newY,400+h2,sceneHeight-h2);
	
	// #3 - Move Circles
	for(let c of circles){
        c.seekOrFlee(ship.x,ship.y,type,dt);
        if(c.x<=c.radius){
            c.x=c.radius+1;
        }
        else if(c.x>=sceneWidth-c.radius)
        {
            c.x=sceneWidth-c.radius-1;
        }
        if(c.y<=c.radius+85){
            c.y=c.radius+86
        }
        else if(c.y>=sceneHeight-c.radius)
        {
            c.y=sceneHeight-c.radius-1;
        }
    }
    for(let s of squares){
        s.move(dt);
        if(s.x<=10|| s.x>=sceneWidth-10){
            s.reflectX();
            s.move(dt);
        }
        if(s.y<=10+85||s.y>=sceneHeight-10){
            s.reflectY();
            s.move(dt);
        }
    }
    /*for firing at regular interval
    count++;
    if(bulletInterval<count)
    {
        fireBullet();
        count=0;
    }*/
	// #4 - Move Bullets
    for (let b of bullets){
		b.move(dt);
	}
	
    // #5 - Check for Collisions
    if(ship.y<75){
        ship.y=75;
    }
	for(let c of circles){
        for(let b of bullets){
            if(rectsIntersect(c,b)&&c.type==type){
                fireballSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive=false;
                gameScene.removeChild(b);
                b.isAlive=false;
                increaseScoreBy(1);
            }
            if(b.y<-10) b.isAlive=false;
        }
        if(c.isAlive && rectsIntersect(c,ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive=false;
            decreaseLifeBy(20);
        }
    }
    for(let s of squares){
        for(let b of bullets){
            if(rectsIntersect(s,b)&&s.type==type){
                if(0.5>=Math.random())
                {
                    createSquares(10);
                }
                fireballSound.play();
                createExplosion(s.x,s.y,64,64);
                gameScene.removeChild(s);
                s.isAlive=false;
                gameScene.removeChild(b);
                b.isAlive=false;
                increaseScoreBy(1);
            }
            if(b.y<-10) b.isAlive=false;
        }
        if(s.isAlive && rectsIntersect(s,ship)){
            hitSound.play();
            gameScene.removeChild(s);
            s.isAlive=false;
            decreaseLifeBy(20);
        }
    }
    //check for collision between port and bullet
    for(let p of ports){
        for(let b of bullets){
            if(rectsIntersect(p,b)&&b.type=="syn"){
                gameScene.removeChild(b);
                if(p.open==true&&p.hit)//checks if already scanned if it is and open nextlevel
                {
                    loadLevel();
                }
                else if(p.open==true&&p.filtered==false&&b.isAlive)
                {
                    fireballSound.play();
                    let newP=new Port(0x00FF00,p.x,p.y,true);//changes color to green
                    gameScene.removeChild(p);
                    gameScene.addChild(newP);
                    filters.push(newP);
                    b.isAlive=false;
                    p.hit=true;
                }
                if(p.open==false&&p.hit)//checks if already scanned if it is user is punished
                {
                    decreaseLifeBy(100);
                }
                else if(p.open==false||p.filtered==true)//p.open==TrueorFalse (don't know if open or not so gives false negative)  p.filtered==true
                {
                    fireballSound.play();
                    let newP=new Port(0xFF0000,p.x,p.y,true);//changes color to green
                    gameScene.removeChild(p);
                    gameScene.addChild(newP);
                    filters.push(newP);
                    b.isAlive=false;
                    p.hit=true;
                }

            }
        }
    }
    
    //check for collision between filter and bullet

    for(let f of filters){
        for(let b of bullets){
            if(rectsIntersect(f,b)&&b.type=="fin"){
                gameScene.removeChild(b);
                if(f.hit)
                {
                    let newF=new Filter(0x000000,f.x,f.y,true);//changes color to green
                    gameScene.removeChild(f);
                    gameScene.addChild(newF);
                    filters.push(newF);
                    b.isAlive=false;
                    f.hit=true;
                }
                else if(f.filtered==true&&b.isAlive)
                {
                    fireballSound.play();
                    let newF=new Filter(0x00FF00,f.x,f.y,true);//changes color to green
                    gameScene.removeChild(f);
                    gameScene.addChild(newF);
                    filters.push(newF);
                    b.isAlive=false;
                    f.hit=true;
                }
                else if(f.filtered==false&&b.isAlive)//changes color to red
                {
                    fireballSound.play();
                    let newF=new Filter(0xFF0000,f.x,f.y,true);//changes color to green
                    gameScene.removeChild(f);
                    gameScene.addChild(newF);
                    filters.push(newF);
                    b.isAlive=false;
                    f.hit=true;
                }
            }
        }
    }
    
	// #6 - Now do some clean up
    bullets =bullets.filter(b=>b.isAlive);
    circles=circles.filter(c=>c.isAlive);
    explosions=explosions.filter(e=>e.playing);
	
	// #7 - Is game over?
	if (life <= 0){
        end();
        return; // return here so we skip #8 below
    }
	
    // #8 - Load next level
    if (circles.length == 0&&squares.length==0&&levelNum!=1){
        levelNum ++;
        loadLevel();
    }
}