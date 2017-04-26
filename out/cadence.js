"use strict";
var cadence;
(function (cadence) {
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    cadence.Point = Point;
    class Rectangle {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.width = 1;
            this.height = 1;
        }
        isPointInRectangle(x, y) {
            var point = new Point(x, y);
            var rect = this;
            if (point.x < rect.x + rect.width &&
                point.x > rect.x &&
                point.y < rect.y + rect.height &&
                point.y > rect.y) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    cadence.Rectangle = Rectangle;
    function pointAppendMatrix(point, m) {
        var x = m.a * point.x + m.c * point.y + m.tx;
        var y = m.b * point.x + m.d * point.y + m.ty;
        return new Point(x, y);
    }
    cadence.pointAppendMatrix = pointAppendMatrix;
    /**
     * 使用伴随矩阵法求逆矩阵
     * http://wenku.baidu.com/view/b0a9fed8ce2f0066f53322a9
     */
    function invertMatrix(m) {
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
    cadence.invertMatrix = invertMatrix;
    function matrixAppendMatrix(m1, m2) {
        var result = new Matrix();
        result.a = m1.a * m2.a + m1.b * m2.c;
        result.b = m1.a * m2.b + m1.b * m2.d;
        result.c = m2.a * m1.c + m2.c * m1.d;
        result.d = m2.b * m1.c + m1.d * m2.d;
        result.tx = m2.a * m1.tx + m2.c * m1.ty + m2.tx;
        result.ty = m2.b * m1.tx + m2.d * m1.ty + m2.ty;
        return result;
    }
    cadence.matrixAppendMatrix = matrixAppendMatrix;
    var PI = Math.PI;
    var HalfPI = PI / 2;
    var PacPI = PI + HalfPI;
    var TwoPI = PI * 2;
    var DEG_TO_RAD = Math.PI / 180;
    class Matrix {
        // constructor() {
        //     //a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0
        //     this.a = 1;
        //     this.b = 0;
        //     this.c = 0;
        //     this.d = 1;
        //     this.tx = 0;
        //     this.ty = 0;
        // }
        constructor(a, b, c, d, tx, ty) {
            if (a != null)
                this.a = a;
            else
                this.a = 1;
            if (b != null)
                this.b = b;
            else
                this.b = 0;
            if (c != null)
                this.c = c;
            else
                this.c = 0;
            if (d != null)
                this.d = d;
            else
                this.d = 1;
            if (tx != null)
                this.tx = tx;
            else
                this.tx = 0;
            if (ty != null)
                this.ty = ty;
            else
                this.ty = 0;
        }
        toString() {
            return "(a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", d=" + this.d + ", tx=" + this.tx + ", ty=" + this.ty + ")";
        }
        updateFromDisplayObject(x, y, scaleX, scaleY, rotation) {
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
    cadence.Matrix = Matrix;
})(cadence || (cadence = {}));
"use strict";
var cadence;
(function (cadence) {
    var RES;
    (function (RES) {
        var RESOURCE_PATH = "./Resources/";
        class ImageProcessor {
            load(url, callback) {
                var data = document.createElement("img");
                data.src = RESOURCE_PATH + url;
                data.onload = () => {
                    callback(data);
                };
                // let image = document.createElement("img");
                // image.src = url;
                // image.onload = () => {
                //     callback();
                // }
                // return new Promise(function (resolve, reject) {
                //     var result = document.createElement("img");
                //     result.src = RESOURCE_PATH + url;
                //     result.onload = () => {
                //         resolve(result);
                //         callback(result);
                //     }
                // });
            }
        }
        RES.ImageProcessor = ImageProcessor;
        class TextProcessor {
            load(url, callback) {
                var xhr = new XMLHttpRequest();
                // xhr.open("get", RESOURCE_PATH + url);
                // xhr.send();
                // xhr.onload = () => {
                xhr.open('GET', RESOURCE_PATH + url, true);
                xhr.send();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var obj = eval('(' + xhr.responseText + ')');
                            callback(obj);
                            // return obj;
                        }
                        else {
                            console.error(xhr.statusText);
                        }
                    }
                    // };
                    xhr.onerror = function (e) {
                        console.error(xhr.statusText);
                    };
                };
            }
        }
        RES.TextProcessor = TextProcessor;
        function mapTypeSelector(typeSelector) {
            getTypeByURL = typeSelector;
        }
        RES.mapTypeSelector = mapTypeSelector;
        var cache = {};
        function getRES(url, callback) {
            // if(cache[url] == null || 
            // ( getTypeByURL(url) == "image" && 
            //   cache[url].data == null) ){
            let type = getTypeByURL(url);
            if (cache[url] == null) {
                let processor = createProcessor(type);
                if (processor != null) {
                    processor.load(url, (data) => {
                        if (type == "image") {
                            var texture = new cadence.Texture();
                            texture.data = data;
                            texture.width = data.width;
                            texture.height = data.height;
                            cache[url] = texture;
                            callback(texture);
                        }
                        else {
                            cache[url] = data;
                            callback(data);
                        }
                        if (cache[url] == null)
                            console.log(url + "文件不存在！");
                        //console.log(type + "还没读取");
                        return cache[url];
                    });
                }
            }
            else {
                callback(cache[url]);
                //console.log(type + "读取完了");
                return cache[url];
            }
        }
        RES.getRES = getRES;
        function loadConfig(preloadJson, callback) {
            preloadJson.resources.forEach((config) => {
                if (config.type == "image") {
                    var preloadResource = new cadence.Texture();
                    preloadResource.width = config.width;
                    preloadResource.height = config.height;
                    let processor = createProcessor("image");
                    if (processor != null) {
                        processor.load(config.url, (data) => {
                            preloadResource.data = data;
                        });
                    }
                }
                cache[config.url] = preloadResource;
            });
            callback();
        }
        RES.loadConfig = loadConfig;
        function get(url) {
            return cache[url];
        }
        var getTypeByURL = (url) => {
            if (url.indexOf(".jpg") >= 0 || url.indexOf(".png") >= 0) {
                return "image";
            }
            else if (url.indexOf(".mp3") >= 0) {
                return "sound";
            }
            else if (url.indexOf(".json") >= 0) {
                return "text";
            }
        };
        let hashMap = {
            "image": new ImageProcessor(),
            "text": new TextProcessor()
        };
        function createProcessor(type) {
            let processor = hashMap[type];
            return processor;
        }
        function map(type, processor) {
            hashMap[type] = processor;
        }
        RES.map = map;
        // export function getRes(path: string) {
        //     return new Promise(function (resolve, reject) {
        //         var result = new Image();
        //         result.src = RESOURCE_PATH + path;
        //         result.onload = () => {
        //             resolve(result);
        //         }
        //     });
        //     // var result = new Image();
        //     // result.src = path;
        //     // result.onload = () => {
        //     //         return(result);
        //     // }
        // }
    })(RES = cadence.RES || (cadence.RES = {}));
})(cadence || (cadence = {}));
"use strict";
var cadence;
(function (cadence) {
    function setTimeout(func, delayTime) {
        var ticker = Ticker.getInstance();
        var passedTime = 0;
        var delayFunc = (delta) => {
            passedTime += delta;
            if (passedTime >= delayTime) {
                func();
                ticker.unregister(delayFunc);
            }
        };
        ticker.register(delayFunc);
    }
    cadence.setTimeout = setTimeout;
    function setInterval(func, delayTime) {
        var passedTime = 0;
        var ticker = Ticker.getInstance();
        var delayFunc = (delta) => {
            passedTime += delta;
            if (passedTime >= delayTime) {
                func();
                passedTime -= delayTime;
            }
        };
        return ticker.register(delayFunc);
    }
    cadence.setInterval = setInterval;
    function clearInterval(key) {
        Ticker.getInstance().unregister(key);
    }
    cadence.clearInterval = clearInterval;
    class Ticker {
        constructor() {
            this.listeners = [];
        }
        static getInstance() {
            if (!Ticker.instance) {
                Ticker.instance = new Ticker();
            }
            return Ticker.instance;
        }
        register(listener) {
            this.listeners.push(listener);
            return this.listeners.indexOf(listener);
        }
        unregister(input) {
            if (input instanceof Number) {
                this.listeners.splice(input, 1);
            }
            else {
                var index = this.listeners.indexOf(input);
                this.listeners.splice(index, 1);
            }
        }
        notify(deltaTime) {
            for (let listener of this.listeners) {
                listener(deltaTime);
            }
        }
    }
    cadence.Ticker = Ticker;
})(cadence || (cadence = {}));
"use strict";
var cadence;
(function (cadence) {
    var TouchEventsType;
    (function (TouchEventsType) {
        TouchEventsType[TouchEventsType["MOUSEDOWN"] = 0] = "MOUSEDOWN";
        TouchEventsType[TouchEventsType["MOUSEUP"] = 1] = "MOUSEUP";
        TouchEventsType[TouchEventsType["CLICK"] = 2] = "CLICK";
        TouchEventsType[TouchEventsType["MOUSEMOVE"] = 3] = "MOUSEMOVE";
    })(TouchEventsType = cadence.TouchEventsType || (cadence.TouchEventsType = {}));
    class TouchEventService {
        constructor() {
            this.performerList = [];
        }
        static getInstance() {
            if (TouchEventService.instance == null) {
                TouchEventService.instance = new TouchEventService();
            }
            return this.instance;
        }
        addPerformer(performer) {
            this.performerList.push(performer);
        }
        clearList() {
            this.performerList.splice(0, this.performerList.length); //清空列表
        }
        toDo() {
            //console.log(this.performerList);
            for (var i = 0; i <= this.performerList.length - 1; i++) {
                for (var listner of this.performerList[i].listeners) {
                    if (listner.type == TouchEventService.currentType) {
                        if (listner.capture) {
                            listner.func();
                            continue;
                        }
                    }
                }
            }
            for (var i = this.performerList.length - 1; i >= 0; i--) {
                for (var listner of this.performerList[i].listeners) {
                    if (listner.type == TouchEventService.currentType) {
                        if (!listner.capture) {
                            //console.log("2");
                            listner.func();
                            continue;
                        }
                    }
                }
            }
            this.clearList();
        }
    }
    TouchEventService.stageX = -1;
    TouchEventService.stageY = -1;
    cadence.TouchEventService = TouchEventService;
    class TouchEventData {
        constructor(type, func, obj, capture, priority) {
            this.capture = false;
            this.priority = 0;
            this.stageX = TouchEventService.stageX;
            this.stageY = TouchEventService.stageY;
            this.type = type;
            this.func = func;
            this.obj = obj;
            this.capture = capture || false;
            this.priority = priority || 0;
        }
    }
    cadence.TouchEventData = TouchEventData;
})(cadence || (cadence = {}));
"use strict";
var cadence;
(function (cadence) {
    class DisplayObject {
        constructor(type) {
            this.type = "DisplayObject";
            this.alpha = 1;
            this.globalAlpha = 1;
            this.scaleX = 1;
            this.scaleY = 1;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.localMatrix = new cadence.Matrix();
            this.globalMatrix = new cadence.Matrix();
            this.listeners = [];
            this.width = 0;
            this.height = 0;
            this.touchEnabled = true;
            this.normalWidth = -1;
            this.normalHeight = -1;
            this.type = type;
        }
        // set Width(width : number){
        //     this.width = width;
        // }
        // set Height(height : number){
        //     this.height = height;
        // }
        set ScaleX(scalex) {
            this.scaleX = scalex;
            this.width = this.width * this.scaleX;
        }
        set ScaleY(scaley) {
            this.scaleY = scaley;
            this.height = this.height * this.scaleY;
        }
        // get Width(){
        //     return this.width;
        // }
        // get Height(){
        //     return this.height;
        // }
        update() {
            if (this.normalWidth > 0) {
                this.scaleX = this.width / this.normalWidth;
            }
            if (this.normalHeight > 0) {
                this.scaleY = this.height / this.normalHeight;
            }
            this.localMatrix.updateFromDisplayObject(this.x, this.y, this.scaleX, this.scaleY, this.rotation);
            if (this.parent) {
                this.globalAlpha = this.parent.globalAlpha * this.alpha;
                this.globalMatrix = cadence.matrixAppendMatrix(this.localMatrix, this.parent.globalMatrix);
            }
            if (this.parent == null) {
                this.globalAlpha = this.alpha;
                this.globalMatrix = this.localMatrix;
            }
            // context2D.globalAlpha = this.globalAlpha;
            // context2D.setTransform(this.globalMatrix.a,this.globalMatrix.b,this.globalMatrix.c,this.globalMatrix.d,this.globalMatrix.tx,this.globalMatrix.ty);
            // this.render(context2D);
        }
        addEventListener(type, touchFunction, object, ifCapture, priority) {
            var touchEvent = new cadence.TouchEventData(type, touchFunction, object, ifCapture, priority);
            this.listeners.push(touchEvent);
        }
    }
    cadence.DisplayObject = DisplayObject;
    class DisplayObjectContainer extends DisplayObject {
        constructor() {
            super("DisplayObjectContainer");
            this.childArray = [];
        }
        update() {
            super.update();
            for (let child of this.childArray) {
                child.update();
            }
        }
        addChild(child) {
            this.childArray.push(child);
            child.parent = this;
        }
        removeChild(child) {
            console.log(child);
            let index = this.childArray.indexOf(child);
            if (index >= 0) {
                this.childArray.splice(index, 1);
            }
            else {
                console.log("child is not in the parent");
            }
        }
        // render(context2D : CanvasRenderingContext2D){
        //     for(let displayObject of this.childArray){
        //         displayObject.draw(context2D);
        //     }
        // }
        hitTest(x, y) {
            if (this.touchEnabled) {
                var rect = new cadence.Rectangle();
                rect.x = rect.y = 0;
                rect.width = this.width;
                rect.height = this.height;
                var result = null;
                if (rect.isPointInRectangle(x, y)) {
                    result = this;
                    cadence.TouchEventService.getInstance().addPerformer(this); //从父到子把相关对象存入数组
                    for (let i = this.childArray.length - 1; i >= 0; i--) {
                        var child = this.childArray[i];
                        var point = new cadence.Point(x, y);
                        var invertChildenLocalMatirx = cadence.invertMatrix(child.localMatrix);
                        var pointBasedOnChild = cadence.pointAppendMatrix(point, invertChildenLocalMatirx);
                        var hitTestResult = child.hitTest(pointBasedOnChild.x, pointBasedOnChild.y);
                        if (hitTestResult) {
                            result = hitTestResult;
                            break;
                        }
                    }
                    return result;
                }
                return null;
            }
        }
    }
    cadence.DisplayObjectContainer = DisplayObjectContainer;
    class Stage extends cadence.DisplayObjectContainer {
        static getInstance() {
            if (this.instance == null) {
                Stage.instance = new Stage();
            }
            return Stage.instance;
        }
    }
    Stage.stageX = 0;
    Stage.stageY = 0;
    cadence.Stage = Stage;
    class TextField extends DisplayObject {
        constructor() {
            super("TextField");
            this.text = "";
            this.textColor = "#000000";
            this.size = 18;
            this.typeFace = "Arial";
            this.textType = "18px Arial";
        }
        // render(context2D : CanvasRenderingContext2D){
        //     context2D.fillStyle = this.textColor;
        //     context2D.font = this.textType;
        //     context2D.fillText(this.text,0,0 + this.size);
        // }
        hitTest(x, y) {
            if (this.touchEnabled) {
                var rect = new cadence.Rectangle();
                rect.x = rect.y = 0;
                rect.width = this.size * this.text.length;
                rect.height = this.size;
                if (rect.isPointInRectangle(x, y)) {
                    cadence.TouchEventService.getInstance().addPerformer(this);
                    return this;
                }
                else {
                    return null;
                }
            }
        }
        setText(text) {
            this.text = text;
        }
        setX(x) {
            this.x = x;
        }
        setY(y) {
            this.y = y;
        }
        setTextColor(color) {
            this.textColor = color;
        }
        setSize(size) {
            this.size = size;
            this.textType = this.size.toString() + "px " + this.typeFace;
        }
        setTypeFace(typeFace) {
            this.typeFace = typeFace;
            this.textType = this.size.toString() + "px " + this.typeFace;
        }
    }
    cadence.TextField = TextField;
    class Bitmap extends DisplayObject {
        constructor() {
            super("Bitmap");
            this.imageID = "";
            this._texture = new Texture();
            // if (imageID) {
            //     this.imageID = imageID;
            //     this._texture = RES.getRES(imageID, (textureData) => {
            //         this._texture = textureData;
            //         this.width = textureData.width;
            //         this.height = textureData.height;
            //     });
            // }
            // this.texture = new Image();
            // this.texture.src = this.imageID;
            // this.texture.onload = () =>{
            //     this.width = this.texture.width;
            //     this.height = this.texture.height;
            // }
            // RES.getRes(imageID).then((value)=>{
            //     this.texture = value;
            //     this.setWidth(this.texture.width);
            //     this.setHeight(this.texture.height);
            //     this.normalWidth = this.texture.width;
            //     this.normalHeight = this.texture.height;
            //     // this.width = this.texture.width;
            //     // this.height = this.texture.height;
            //     // this.image = this.texture.data;
            //     console.log("load complete "+value);
            // console.log(this.width + " hi! " + this.height);
            // })
        }
        set texture(data) {
            this._texture = data;
            if (this.width <= 0) {
                this.width = data.width;
            }
            if (this.height <= 0) {
                this.height = data.height;
            }
            this.normalWidth = data.width;
            this.normalHeight = data.height;
        }
        get texture() {
            return this._texture;
        }
        // render(context2D : CanvasRenderingContext2D){
        //     if(this.texture){
        //         this.normalWidth = this.texture.width;
        //         this.normalHeight = this.texture.height;
        //         context2D.drawImage(this.texture,0,0);
        //     }
        //     // else{
        //     //     this.texture.onload = () =>{
        //     //         context2D.drawImage(this.texture,0,0);
        //     //     }
        //     // }
        // }
        hitTest(x, y) {
            if (this.touchEnabled) {
                var rect = new cadence.Rectangle();
                rect.x = rect.y = 0;
                rect.width = this.width;
                rect.height = this.height;
                if (rect.isPointInRectangle(x, y)) {
                    cadence.TouchEventService.getInstance().addPerformer(this);
                    return this;
                }
                else {
                    return null;
                }
            }
        }
        // setImage(text){
        //     this.imageID = text;
        // }
        setX(x) {
            this.x = x;
        }
        setY(y) {
            this.y = y;
        }
    }
    cadence.Bitmap = Bitmap;
    class Shape extends DisplayObjectContainer {
        constructor() {
            super();
            this.graphics = new Graphics();
        }
    }
    cadence.Shape = Shape;
    class Graphics extends DisplayObjectContainer {
        constructor() {
            super();
            this.fillColor = "#000000";
            this.alpha = 1;
            this.globalAlpha = 1;
            this.strokeColor = "#000000";
            this.lineWidth = 1;
            this.lineColor = "#000000";
        }
        beginFill(color, alpha) {
            this.fillColor = color;
            this.alpha = alpha;
        }
        endFill() {
            this.fillColor = "#000000";
            this.alpha = 1;
        }
        drawRect(x1, y1, x2, y2, context2D) {
            context2D.globalAlpha = this.alpha;
            context2D.fillStyle = this.fillColor;
            context2D.fillRect(x1, y1, x2, y2);
            context2D.fill();
        }
        drawCircle(x, y, rad, context2D) {
            context2D.fillStyle = this.fillColor;
            context2D.globalAlpha = this.alpha;
            context2D.beginPath();
            context2D.arc(x, y, rad, 0, Math.PI * 2, true);
            context2D.closePath();
            context2D.fill();
        }
        drawArc(x, y, rad, beginAngle, endAngle, context2D) {
            context2D.strokeStyle = this.strokeColor;
            context2D.globalAlpha = this.alpha;
            context2D.beginPath();
            context2D.arc(x, y, rad, beginAngle, endAngle, true);
            context2D.closePath();
            context2D.stroke();
        }
    }
    cadence.Graphics = Graphics;
    class MovieClip extends Bitmap {
        constructor(data) {
            super();
            this.advancedTime = 0;
            this.ticker = (deltaTime) => {
                // this.removeChild();
                this.advancedTime += deltaTime;
                if (this.advancedTime >= MovieClip.FRAME_TIME * MovieClip.TOTAL_FRAME) {
                    this.advancedTime -= MovieClip.FRAME_TIME * MovieClip.TOTAL_FRAME;
                }
                this.currentFrameIndex = Math.floor(this.advancedTime / MovieClip.FRAME_TIME);
                let data = this.data;
                let frameData = data.frames[this.currentFrameIndex];
                let url = frameData.image;
            };
            this.setMovieClipData(data);
            this.play();
        }
        play() {
            cadence.Ticker.getInstance().register(this.ticker);
        }
        stop() {
            cadence.Ticker.getInstance().unregister(this.ticker);
        }
        setMovieClipData(data) {
            this.data = data;
            this.currentFrameIndex = 0;
            // 创建 / 更新 
        }
    }
    MovieClip.FRAME_TIME = 20;
    MovieClip.TOTAL_FRAME = 10;
    cadence.MovieClip = MovieClip;
    class Texture {
    }
    cadence.Texture = Texture;
})(cadence || (cadence = {}));
"use strict";
var cadence;
(function (cadence) {
    var main;
    function setMain(main) {
        this.main = main;
        var resoucesJson = cadence.RES.getRES("RES.json", (data) => {
            resoucesJson = data;
            cadence.RES.loadConfig(resoucesJson, () => {
                console.log("Load Complete");
                if (main != null)
                    main.createGameScene();
                else
                    console.log("main is not exsist");
            });
        });
    }
    cadence.setMain = setMain;
    cadence.run = (canvas) => {
        var stage = cadence.Stage.getInstance();
        stage.width = canvas.width;
        stage.height = canvas.height;
        let context2D = canvas.getContext("2d");
        let renderer = new CanvasRenderer(stage, context2D);
        var currentTarget; //鼠标点击时当前的对象
        var startTarget; //mouseDown时的对象
        var isMouseDown = false;
        var startPoint = new cadence.Point(-1, -1);
        var movingPoint = new cadence.Point(0, 0);
        // var resoucesJson = RES.getRES("RES.json",(data) => {
        //     resoucesJson = data;
        //     RES.loadConfig(resoucesJson,()=>{
        //         console.log("Load Complete");
        //         if(main != null)
        //         main.createGameScene();
        //         else
        //         console.log("main is not exsist");
        //     });
        // });
        let lastNow = Date.now();
        let frameHandler = () => {
            let now = Date.now();
            let deltaTime = now - lastNow;
            cadence.Ticker.getInstance().notify(deltaTime);
            context2D.clearRect(0, 0, stage.width, stage.height);
            context2D.save();
            stage.update();
            renderer.render();
            context2D.restore();
            lastNow = now;
            window.requestAnimationFrame(frameHandler);
        };
        window.requestAnimationFrame(frameHandler);
        window.onmousedown = (e) => {
            let x = e.offsetX - 3;
            let y = e.offsetY - 3;
            cadence.TouchEventService.stageX = x;
            cadence.TouchEventService.stageY = y;
            cadence.Stage.stageX = cadence.TouchEventService.stageX;
            cadence.Stage.stageY = cadence.TouchEventService.stageY;
            startPoint.x = x;
            startPoint.y = y;
            movingPoint.x = x;
            movingPoint.y = y;
            cadence.TouchEventService.currentType = cadence.TouchEventsType.MOUSEDOWN;
            currentTarget = stage.hitTest(x, y);
            startTarget = currentTarget;
            cadence.TouchEventService.getInstance().toDo();
            isMouseDown = true;
        };
        window.onmouseup = (e) => {
            let x = e.offsetX - 3;
            let y = e.offsetY - 3;
            cadence.TouchEventService.stageX = x;
            cadence.TouchEventService.stageY = y;
            cadence.Stage.stageX = cadence.TouchEventService.stageX;
            cadence.Stage.stageY = cadence.TouchEventService.stageY;
            var target = stage.hitTest(x, y);
            if (target == currentTarget) {
                cadence.TouchEventService.currentType = cadence.TouchEventsType.CLICK;
            }
            else {
                cadence.TouchEventService.currentType = cadence.TouchEventsType.MOUSEUP;
            }
            cadence.TouchEventService.getInstance().toDo();
            currentTarget = null;
            isMouseDown = false;
        };
        window.onmousemove = (e) => {
            if (isMouseDown) {
                let x = e.offsetX - 3;
                let y = e.offsetY - 3;
                cadence.TouchEventService.stageX = x;
                cadence.TouchEventService.stageY = y;
                cadence.Stage.stageX = cadence.TouchEventService.stageX;
                cadence.Stage.stageY = cadence.TouchEventService.stageY;
                cadence.TouchEventService.currentType = cadence.TouchEventsType.MOUSEMOVE;
                currentTarget = stage.hitTest(x, y);
                cadence.TouchEventService.getInstance().toDo();
                movingPoint.x = x;
                movingPoint.y = y;
            }
        };
        return stage;
    };
    class CanvasRenderer {
        constructor(stage, context2D) {
            this.stage = stage;
            this.context2D = context2D;
        }
        render() {
            let stage = this.stage;
            let context2D = this.context2D;
            this.renderContainer(stage);
        }
        renderContainer(container) {
            for (let child of container.childArray) {
                let context2D = this.context2D;
                context2D.globalAlpha = child.globalAlpha;
                let m = child.globalMatrix;
                context2D.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                if (child.type == "Bitmap") {
                    this.renderBitmap(child);
                }
                else if (child.type == "TextField") {
                    this.renderTextField(child);
                }
                else if (child.type == "DisplayObjectContainer") {
                    this.renderContainer(child);
                }
            }
        }
        renderBitmap(bitmap) {
            if (bitmap.texture.data) {
                this.context2D.drawImage(bitmap.texture.data, 0, 0);
            }
        }
        renderTextField(textField) {
            this.context2D.fillStyle = textField.textColor;
            this.context2D.font = textField.textType;
            this.context2D.fillText(textField.text, 0, 0 + textField.size);
        }
    }
})(cadence || (cadence = {}));
