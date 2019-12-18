class Ship extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.1);
        this.x=x;
        this.y=y;
    }
}
class Circle extends PIXI.Graphics{
    constructor(radius,color=0xFF0000,x=0, y=0,type="syn"){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.type=type;
        this.fwd=getRandomUnitVector();
        this.speed=50;
        this.isAlive=true;
        this.accX=0;
        this.accY=0;
        this.velX=0;
        this.velY=0;
    }


    seekOrFlee(shipX,shipY,bullettype,dt=1/60)//x and y are the coordinates of the ship
    {
        if(bullettype==this.type)//if type equals the current bullet type
        {
            this.flee(shipX,shipY);
        }
        else{this.seek(shipX,shipY);}

    }
    flee(shipX,shipY,dt=1/60)
    {
        let distance=Math.sqrt(Math.pow((shipX-this.x),2)+Math.pow((shipY-this.y),2));
        this.x+=-1*(shipX-this.x)/distance*this.speed*dt;
        this.y+=-1*(shipY-this.y)/distance*this.speed*dt;
    }
    seek(shipX,shipY,dt=1/60)
    {
        let distance=Math.sqrt(Math.pow((shipX-this.x),2)+Math.pow((shipY-this.y),2));
        this.x+=(shipX-this.x)/distance*this.speed*dt;
        this.y+=(shipY-this.y)/distance*this.speed*dt;   
    }
    /*Old but useful code from circle blast
    move(dt=1/60){
        this.x+=this.fwd.x*this.speed*dt;
        this.y+=this.fwd.y*this.speed*dt;
    }*/
}
class Square extends PIXI.Graphics{
    constructor(color=0xFF0000,x=0, y=0,type="syn"){
        super();
        this.beginFill(color);
        this.drawRect(0,0,10,10);
        this.endFill();
        this.x=x;
        this.y=y;
        this.type=type;
        this.fwd=getRandomUnitVector();
        this.speed=50;
        this.isAlive=true;
    }

    move(dt=1/60){
        let direction= Math.random();
        if(direction>=0.5)
        {
            this.x+=this.fwd.x*this.speed*(dt*2);

        }
        else{this.y+=this.fwd.y*this.speed*(dt*2);}
    }

    reflectX(){
        this.fwd.x*=-1;
    }

    reflectY(){
        this.fwd.y*=-1;
    }
}


class Bullet extends PIXI.Graphics{
    constructor(color=0xFFFFFF, x=0, y=0,type="fin"){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.x=x;
        this.y=y;
        this.fwd={x:0, y:-1};
        this.type=type
        this.speed=400;
        this.isAlive=true;
        Object.seal(this);
    }
    move(dt=1/60){
        this.x+=this.fwd.x*this.speed*dt;
        this.y+=this.fwd.y*this.speed*dt;
    }
}

class Filter extends PIXI.Graphics{
    constructor(color=0xFFFFFF,x=0,y=0,filtered=1){
        super();
        this.beginFill(color);
        this.lineStyle(5,0x000000,1);
        this.drawRect(0,75,75,10);
        this.endFill();
        this.x=x;
        this.y=y;
        this.filtered=filtered;
        this.hit=false;
        Object.seal(this);
    }
}
class Port extends PIXI.Graphics{
    constructor(color=0xFFFFFF,x=0,y=0,open=true,filtered=true){//has knowledge if it is filtered or not(does have a filtered object)
        super();
        this.color=color;
        this.beginFill(color);
        this.lineStyle(5,0x000000,1);
        this.drawRect(0,0,75,75);
        this.endFill();
        this.x=x;
        this.y=y;
        this.open=open;
        this.filtered=filtered;
        this.hit=false;
        Object.seal(this);
    }
}