namespace engine {

    var main;

    export function setMain(main){
        this.main = main;
        var resoucesJson = RES.getRES("RES.json",(data) => {
            resoucesJson = data;
            RES.loadConfig(resoucesJson,()=>{
                console.log("Load Complete");
                if(main != null)
                main.createGameScene();
                else
                console.log("main is not exsist");
            });
        });
    }

    export let run = (canvas: HTMLCanvasElement) => {

        var stage = engine.Stage.getInstance();
        stage.width = canvas.width;
        stage.height = canvas.height;
        let context2D = canvas.getContext("2d");
        let renderer = new CanvasRenderer(stage,context2D);
        var currentTarget;                      //鼠标点击时当前的对象
        var startTarget;                        //mouseDown时的对象
        var isMouseDown = false;
        var startPoint = new Point(-1,-1);
        var movingPoint = new Point(0,0);

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
            Ticker.getInstance().notify(deltaTime);
            context2D.clearRect(0, 0, stage.width, stage.height);
            context2D.save();
            stage.update();
            renderer.render();
            context2D.restore();
            lastNow = now;
            window.requestAnimationFrame(frameHandler);
        }

        window.requestAnimationFrame(frameHandler);

        window.onmousedown = (e) =>{
        let x = e.offsetX - 3;
        let y = e.offsetY - 3;
        TouchEventService.stageX = x;
        TouchEventService.stageY = y;
        Stage.stageX = TouchEventService.stageX;
        Stage.stageY = TouchEventService.stageY;
        startPoint.x = x;
        startPoint.y = y;
        movingPoint.x = x;
        movingPoint.y = y;
        TouchEventService.currentType = TouchEventsType.MOUSEDOWN;
        currentTarget = stage.hitTest(x,y);
        startTarget = currentTarget;
        TouchEventService.getInstance().toDo();
        isMouseDown = true;
    }

    window.onmouseup = (e) =>{
        let x = e.offsetX - 3;
        let y = e.offsetY - 3;
        TouchEventService.stageX = x;
        TouchEventService.stageY = y;
        Stage.stageX = TouchEventService.stageX;
        Stage.stageY = TouchEventService.stageY;
        var target = stage.hitTest(x,y);
        if(target == currentTarget){
            TouchEventService.currentType = TouchEventsType.CLICK;
        }
        else{
            TouchEventService.currentType = TouchEventsType.MOUSEUP
        }
        TouchEventService.getInstance().toDo();
        currentTarget = null;
        isMouseDown = false;
    }

    window.onmousemove = (e) =>{
        if(isMouseDown){
            let x = e.offsetX - 3;
            let y = e.offsetY - 3;
            TouchEventService.stageX = x;
            TouchEventService.stageY = y;
            Stage.stageX = TouchEventService.stageX;
            Stage.stageY = TouchEventService.stageY;
            TouchEventService.currentType = TouchEventsType.MOUSEMOVE;
            currentTarget = stage.hitTest(x,y);
            TouchEventService.getInstance().toDo();
            movingPoint.x = x;
            movingPoint.y = y;

        }
    }


        return stage;
        
    }

    class CanvasRenderer{
        constructor(private stage: DisplayObjectContainer, private context2D: CanvasRenderingContext2D) {

        }

        render() {
            let stage = this.stage;
            let context2D = this.context2D;
            this.renderContainer(stage);
        }

        renderContainer(container: DisplayObjectContainer) {
            for (let child of container.childArray) {
                let context2D = this.context2D;
                context2D.globalAlpha = child.globalAlpha;
                let m = child.globalMatrix;
                context2D.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);

                if (child.type == "Bitmap") {
                    this.renderBitmap(child as Bitmap);
                }
                else if (child.type == "TextField") {
                    this.renderTextField(child as TextField);
                }
                else if (child.type == "DisplayObjectContainer") {
                    this.renderContainer(child as DisplayObjectContainer);
                }
            }
        }

        renderBitmap(bitmap : Bitmap){
            if(bitmap.texture.data){
                this.context2D.drawImage(bitmap.texture.data,0,0);
            }
        }

        renderTextField(textField : TextField){
            this.context2D.fillStyle = textField.textColor;
            this.context2D.font = textField.textType;
            this.context2D.fillText(textField.text,0,0 + textField.size);
        }
    }




}
