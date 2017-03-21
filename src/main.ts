window.onload = () => {

    var canvas = document.getElementById("app") as HTMLCanvasElement;
    var context2D = canvas.getContext("2d");

    var stage = new DisplayObjectContainer();

    setInterval(() => {
        context2D.save();
        context2D.clearRect(0, 0, canvas.width, canvas.height);
        stage.draw(context2D);
        context2D.restore();

    }, 100)

    //文字
    var name = new TextField();
    name.x = 70;
    name.y = 70;
    name.text = "Jasper";
    name.color = "#000000";
    name.size = 100;
    name.alpha = 1;

/*
    var shape = new Shape();
    shape.graphics.beginFill("#000000");

    shape.graphics.moveTo(200,200);
    shape.graphics.lineTo(100,100);
    shape.graphics.lineTo(0,200);

    shape.graphics.drawCircle(30,30,30);
    shape.graphics.drawRect(50,50,100,50);

    shape.graphics.moveTo(0,0);
    shape.graphics.lineTo(100,100);
    shape.graphics.lineTo(200,0);

    shape.graphics.endFill();
    shape.scaleX = 0.5;
*/

    name.addEventListener(TouchEventType.MOUSE_TAP, ()=>{
        name.text = "Mike";     
    },this,false);

    //图片
    var image = document.createElement("img");
    image.src = "avater.jpg";

    image.onload = () => {

        var avater = new Bitmap();
        avater.image = image;
        avater.x = 0;
        avater.width = 300;
        avater.height = 300;
        avater.alpha = 1;

        stage.touchable = true;
        name.touchable = true;
        avater.touchable = true;
        
        stage.addChild(avater);
        stage.addChild(name);
 
        avater.addEventListener(TouchEventType.MOUSE_MOVE, ()=>{
        console.log("move");
        let manager = Event_Manager.getInstance();
        stage.y += manager.currentY - manager.lastY;

        },this,false);

    }
    
    Event_Manager.eventManager = new Event_Manager();
    Event_Manager.getWindow(window);
    Event_Manager.getStage(stage);



    Event_Manager.getInstance().onMouseDown();
    Event_Manager.getInstance().onMouseMove();
    Event_Manager.getInstance().onMouseUp();
    



}

interface Drawable { 
    draw(context2D:CanvasRenderingContext2D); 
}

var TouchEventType = {

    MOUSE_DOWN:0,
    MOUSE_MOVE:1,
    MOUSE_UP:2,
    MOUSE_TAP:3

}

class Event_ {//基本事件
    type:number = null;
    ifCapture:boolean = false;
    eventFunction:Function = null;
    target:DisplayObject = null;

    public constructor (type:number,eventFunction:Function,target:DisplayObject,ifCapture:boolean) {
        this.type = type;
        this.eventFunction = eventFunction;
        this.target = target;
        this.ifCapture = ifCapture;
    }
}

class Event_Manager {//负责广播信息
    displayObjcetArray:DisplayObject[] = [];
    static eventManager : Event_Manager;

    static getInstance(){
        if(Event_Manager.eventManager == null){

            Event_Manager.eventManager = new Event_Manager();
            Event_Manager.eventManager.displayObjcetArray = new Array();
            return Event_Manager.eventManager;

        }else{

            return Event_Manager.eventManager;
        }
    }

    //记录位置
    currentX:number = null;
    currentY:number = null;
    lastX:number = null;
    lastY:number = null;

    isMouseDown = false;//检测鼠标是否按下
    hitResult : DisplayObject;//检测是否点到控件

    window:Window = null;
    stage:DisplayObjectContainer = null;

    static getWindow(window:Window) {
        Event_Manager.getInstance().window = window;
    }

    static getStage(stage:DisplayObjectContainer) {
        Event_Manager.getInstance().stage = stage;
    }

    onMouseDown() {

        let manager = Event_Manager.getInstance();
        manager.window.onmousedown = (e) => {
            manager.isMouseDown = true;
            manager.displayObjcetArray.splice(0,manager.displayObjcetArray.length);
            manager.hitResult = manager.stage.hitTest(e.offsetX, e.offsetY);
            manager.currentX = e.offsetX;
            manager.currentY = e.offsetY;
        }
    }

    onMouseMove() {
        
        let manager = Event_Manager.getInstance();

        manager.window.onmousemove = (e)=>{

            if(manager.currentX == null) {
                manager.currentX = e.offsetX;
                manager.currentY = e.offsetY;
                manager.lastX = manager.currentX;
                manager.lastY = manager.currentY;  
            }else {
                manager.lastX = manager.currentX;
                manager.lastY = manager.currentY;
                manager.currentX = e.offsetX;
                manager.currentY = e.offsetY;
            }

            if (manager.isMouseDown) {

                //console.log("last X:" + manager.lastX);
                //console.log("last Y:" + manager.lastY);

                for (let i = 0; i < manager.displayObjcetArray.length; i++) {

                    for (let event of manager.displayObjcetArray[i].eventList) {
                    
                        if (event.type == TouchEventType.MOUSE_MOVE && event.ifCapture) {

                            event.eventFunction(e);
                        }
                    }
                }

                for (let i = (manager.displayObjcetArray.length - 1); i >= 0; i--) {

                    for (let event of manager.displayObjcetArray[i].eventList) {

                        if (event.type == TouchEventType.MOUSE_MOVE && !event.ifCapture) {

                            event.eventFunction(e);
                        }
                    }   
                }
            }
        }
    }

    onMouseUp() {
        
        let manager = Event_Manager.getInstance();
        manager.window.onmouseup = (e)=>{

            manager.isMouseDown = false;
            manager.displayObjcetArray.splice(0,manager.displayObjcetArray.length);
            let newHitRusult = manager.stage.hitTest(e.offsetX, e.offsetY)

            for (let i = manager.displayObjcetArray.length - 1; i >= 0; i--) {

                for (let event of manager.displayObjcetArray[i].eventList) {

                    if (event.type == TouchEventType.MOUSE_TAP && newHitRusult == manager.hitResult ) {
                        console.log("mouse up");
                        event.eventFunction(e);
                    }
                }
            }
        }
    }
    

}

class DisplayObject implements Drawable {

    x:number = 0;
    y:number = 0;
    scaleX:number = 1;
    scaleY:number = 1;
    rotation:number = 0;
    parent:DisplayObjectContainer = null;
    matrix:math.Matrix = null;
    alpha:number = 1;
    globalAlpha = 1;

    eventList:Event_[] = [];

    touchable:boolean = false;

    constructor() {
        this.matrix = new math.Matrix();
    }

    removeParent() {
        this.parent = null;
    }

    checkState() {
        this.matrix.updateFromDisplayObject(this.x,this.y,this.scaleX,this.scaleY,this.rotation);
        if(this.parent) {
            this.matrix = math.matrixAppendMatrix(this.matrix,this.parent.matrix);
            this.globalAlpha = this.parent.globalAlpha * this.alpha; 
        }else {
            this.globalAlpha = this.alpha;
        }
        
    }

    draw(context2D:CanvasRenderingContext2D) {
        this.checkState();
        context2D.globalAlpha = this.globalAlpha;
        context2D.setTransform(this.matrix.a,this.matrix.b,this.matrix.c,this.matrix.d,this.matrix.tx,this.matrix.ty);

        this.render(context2D);

    }

    render(context2D:CanvasRenderingContext2D) {

    }

    hitTest(x:number,y:number):DisplayObject {
        return null;
    }

    addEventListener(type : number, eventFunction : Function, target : DisplayObject, ifCapture : boolean){
        
        let e = new Event_(type, eventFunction, target, ifCapture);
        this.eventList.push(e);
    }

}

class DisplayObjectContainer extends DisplayObject {
    
    children:DisplayObject[] = [];

    constructor() {
        super();
    }

    checkState() {
        this.matrix.updateFromDisplayObject(this.x,this.y,this.scaleX,this.scaleY,this.rotation);
        if(this.parent) {
            this.matrix = math.matrixAppendMatrix(this.matrix,this.parent.matrix);
            this.globalAlpha = this.parent.globalAlpha * this.alpha; 
        }else {
            this.globalAlpha = this.alpha;
        }
        
    }

    draw(context2D:CanvasRenderingContext2D) {
        this.checkState();
        for (let drawable of this.children) {
            drawable.draw(context2D);
        }
    }

    render() {

    }

    hitTest(x,y):DisplayObject {
        console.log("container");

        if(!this.touchable){
            console.log("container untouchable");
            return null;
        }

        for(var i = this.children.length - 1; i >= 0; i--){

            var child = this.children[i];
            var pointBaseOnChild = math.pointAppendMatrix(new math.Point(x, y), math.invertMatrix(child.matrix));
            var hitTestResult = child.hitTest(pointBaseOnChild.x, pointBaseOnChild.y);
            
            if(hitTestResult){
                                
                return hitTestResult;
            }
        }

        console.log("all children untouchable");
        return null;
    }

    addChild(displayObject:DisplayObject){

        this.removeChild(displayObject);
        this.children.push(displayObject);
        displayObject.parent = this;
        
    }

    removeChild(child:DisplayObject) {
        var tempArr = this.children.concat();

        for(let each of tempArr){
            if(each == child){
                var index = this.children.indexOf(child);
                tempArr.splice(index,1);
                this.children = tempArr;
                child.removeParent();
                break;
            }
        }
    
    }


}

class Bitmap extends DisplayObject {
    
    image:HTMLImageElement = null;
    width:number;
    height:number;
    src:string;
    rect:math.Rectangle = null;

    constructor() {
        super();
    }


    render(context2D:CanvasRenderingContext2D) {
        context2D.drawImage(this.image,0,0,this.width,this.height);  
    }

    hitTest(x,y):DisplayObject {

        if(!this.touchable){
            console.log("bitMap untouchable");
            return null;
        }

        this.rect = new math.Rectangle(0,0,this.width,this.height);
        var localHitPoint = new math.Point(x,y);
        //var invertMatrix = math.invertMatrix(this.matrix);
        //var pointAppendMatrix = math.pointAppendMatrix(hitPoint,invertMatrix);
        if(this.rect.isPointInRectangle(localHitPoint)) {
            console.log("hit bitMap");
            if(this.eventList.length != 0){
                Event_Manager.getInstance().displayObjcetArray.push(this);
            }
            return this;
        } else {
            return null;
        }
    }

}

class TextField extends DisplayObject {
    
    text:string = "";
    color:string = "";
    size:number = 40;
    font:string = "Arial";
    rect:math.Rectangle = null;

    render(context2D:CanvasRenderingContext2D) {
        this.rect = new math.Rectangle(0,-this.size,this.text.length*this.size/2,this.size);
        context2D.fillStyle = this.color;
        context2D.font = this.size +"px" + " " + this.font;
        context2D.fillText(this.text,0,0);

    }

    hitTest(x,y):DisplayObject {

        if(!this.touchable){
            console.log("textfield untouchable");
            return null;
        }

        if(this.rect == null) {
            this.rect = new math.Rectangle(0,-this.size,this.text.length*this.size/2,this.size);
        }
        var hitPoint = new math.Point(x,y);
        //var invertMatrix = math.invertMatrix(this.matrix);
        //var pointAppendMatrix = math.pointAppendMatrix(hitPoint,invertMatrix);
        if(this.rect.isPointInRectangle(hitPoint)) {
            console.log("hit textField");
            if(this.eventList.length != 0){
                Event_Manager.getInstance().displayObjcetArray.push(this);
            }
            return this;
        }else{

            return null;
        }
    }

}




/*

class Shape extends DisplayObject {

    graphics = new Graphics();
    
    public constructor() {
        super();
    }

    render(context2D:CanvasRenderingContext2D) {
        
        for(let info of this.graphics.shapeInfo){
            context2D.fillStyle = this.graphics.color;
            context2D.globalAlpha = info.alpha;

            switch(info.type) {

                case ShapeType.LINE:
                    context2D.moveTo(info.x,info.y);
                    context2D.lineTo(info.endx,info.endy);
                    context2D.stroke();
                    break;

                case ShapeType.RECT:
                    context2D.fillRect(info.x,info.y,info.width,info.height);
                    break;
                
                case ShapeType.CIRCLE:
                    context2D.beginPath();
                    context2D.arc(info.x,info.y,info.radius,0,Math.PI*2,true);
                    context2D.closePath();
                    context2D.fill();
                    break;

            }
        }
        
        
    }

    

}

var ShapeType = {

    LINE:0,
    RECT:1,
    CIRCLE:2
 
}

class Graphics {

    _x:number;
    _y:number;

    color:string = "";
    shapeInfo:ShapeInfo[] = [];

    public beginFill(color:string) {
        this.color = color;
    }

    public endFill() {

    }

    public drawCircle(x:number,y:number,radius:number) {

        this.shapeInfo.push(new CircleInfo(x,y,radius));
    }

    public drawRect(x:number,y:number,width:number,height:number) {

        this.shapeInfo.push(new RectInfo(x,y,width,height));
    }

    public lineTo(x:number,y:number) {
        this.shapeInfo.push(new LineInfo(this._x,this._y,x,y));
        this._x = x;
        this._y = y;
    }

    public moveTo(x:number,y:number) {
        this._x = x;
        this._y = y;
    }


}

class ShapeInfo {
    type:number;
    x:number;
    y:number;
    alpha:number = 1;
    
    radius:number;
    width:number;
    height:number;
       
    endx:number;
    endy:number;
}

class CircleInfo extends ShapeInfo {
    type = ShapeType.CIRCLE;

    public constructor(x:number,y:number,radius:number) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

}

class RectInfo extends ShapeInfo {
    type = ShapeType.RECT;

    public constructor(x:number,y:number,width:number,height:number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }


}

class LineInfo extends ShapeInfo {
    type = ShapeType.LINE;

    public constructor(_x:number,_y:number,x:number,y:number) {
        super();
        this.x = _x;
        this.y = _y;
        this.endx = x;
        this.endy = y;
      
    }
 
}

*/


module math {

    export class Rectangle {

        x = 0;
        y = 0;
        width = 1
        height = 1;

        public constructor(x,y,width,height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }   

        isPointInRectangle(point:Point) {
            let rect = this;
            if(point.x < rect.x + rect.width  &&
               point.y < rect.y + rect.height &&
               point.x > rect.x &&
               point.y > rect.y) {
                return true;
            }

        }
    }


    export class Point {
        x: number;
        y: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    export function pointAppendMatrix(point: Point, m: Matrix): Point {
        var x = m.a * point.x + m.c * point.y + m.tx;
        var y = m.b * point.x + m.d * point.y + m.ty;
        return new Point(x, y);

    }

    /**
     * 使用伴随矩阵法求逆矩阵
     * http://wenku.baidu.com/view/b0a9fed8ce2f0066f53322a9
     */
    export function invertMatrix(m: Matrix): Matrix {


        var a = m.a;
        var b = m.b;
        var c = m.c;
        var d = m.d;
        var tx = m.tx;
        var ty = m.ty;

        var determinant = a * d - b * c;
        var result = new Matrix(1, 0, 0, 1, 0, 0);
        if (determinant == 0) {
            throw new Error("no invert");
        }

        determinant = 1 / determinant;
        var k = result.a = d * determinant;
        b = result.b = -b * determinant;
        c = result.c = -c * determinant;
        d = result.d = a * determinant;
        result.tx = -(k * tx + c * ty);
        result.ty = -(b * tx + d * ty);
        return result;

    }

    export function matrixAppendMatrix(m1: Matrix, m2: Matrix): Matrix {

        var result = new Matrix();
        result.a = m1.a * m2.a + m1.b * m2.c;
        result.b = m1.a * m2.b + m1.b * m2.d;
        result.c = m2.a * m1.c + m2.c * m1.d;
        result.d = m2.b * m1.c + m1.d * m2.d;
        result.tx = m2.a * m1.tx + m2.c * m1.ty + m2.tx;
        result.ty = m2.b * m1.tx + m2.d * m1.ty + m2.ty;
        return result;
    }

    var PI = Math.PI;
    var HalfPI = PI / 2;
    var PacPI = PI + HalfPI;
    var TwoPI = PI * 2;
    var DEG_TO_RAD: number = Math.PI / 180;


    export class Matrix {

        constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }

        public a: number;

        public b: number;

        public c: number;

        public d: number;

        public tx: number;

        public ty: number;

        public toString(): string {
            return "(a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", d=" + this.d + ", tx=" + this.tx + ", ty=" + this.ty + ")";
        }

        updateFromDisplayObject(x: number, y: number, scaleX: number, scaleY: number, rotation: number) {
            this.tx = x;
            this.ty = y;
            var skewX, skewY;
            skewX = skewY = rotation / 180 * Math.PI;

            var u = Math.cos(skewX);
            var v = Math.sin(skewX);
            this.a = Math.cos(skewY) * scaleX;
            this.b = Math.sin(skewY) * scaleX;
            this.c = -v * scaleY;
            this.d = u * scaleY;

        }
    }
}








