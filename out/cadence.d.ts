declare namespace cadence {
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }
    class Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
        isPointInRectangle(x: number, y: number): boolean;
    }
    function pointAppendMatrix(point: Point, m: Matrix): Point;
    /**
     * 使用伴随矩阵法求逆矩阵
     * http://wenku.baidu.com/view/b0a9fed8ce2f0066f53322a9
     */
    function invertMatrix(m: Matrix): Matrix;
    function matrixAppendMatrix(m1: Matrix, m2: Matrix): Matrix;
    class Matrix {
        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
        toString(): string;
        updateFromDisplayObject(x: number, y: number, scaleX: number, scaleY: number, rotation: number): void;
    }
}
declare namespace cadence {
    namespace RES {
        interface Processor {
            load(url: string, callback: Function): void;
        }
        class ImageProcessor implements Processor {
            load(url: string, callback: (data: any) => void): void;
        }
        class TextProcessor implements Processor {
            load(url: string, callback: (data: any) => void): void;
        }
        function mapTypeSelector(typeSelector: (url: string) => string): void;
        function getRES(url: string, callback: (data: any) => void): any;
        function loadConfig(preloadJson: any, callback: () => void): void;
        function map(type: string, processor: Processor): void;
    }
}
declare namespace cadence {
    type Ticker_Listener_Type = (deltaTime: number) => void;
    function setTimeout(func: Function, delayTime: number): void;
    function setInterval(func: Function, delayTime: number): number;
    function clearInterval(key: number): void;
    class Ticker {
        private static instance;
        static getInstance(): Ticker;
        listeners: Ticker_Listener_Type[];
        register(listener: Ticker_Listener_Type): number;
        unregister(input: Ticker_Listener_Type | number): void;
        notify(deltaTime: number): void;
    }
}
declare namespace cadence {
    enum TouchEventsType {
        MOUSEDOWN = 0,
        MOUSEUP = 1,
        CLICK = 2,
        MOUSEMOVE = 3,
    }
    class TouchEventService {
        private static instance;
        private performerList;
        static currentType: TouchEventsType;
        static stageX: number;
        static stageY: number;
        static getInstance(): TouchEventService;
        addPerformer(performer: DisplayObject): void;
        clearList(): void;
        toDo(): void;
    }
    class TouchEventData {
        stageX: number;
        stageY: number;
        type: TouchEventsType;
        func: Function;
        obj: any;
        capture: boolean;
        priority: number;
        constructor(type: TouchEventsType, func: Function, obj: any, capture?: boolean, priority?: number);
    }
}
declare namespace cadence {
    type MovieClipData = {
        name: string;
        frames: MovieClipFrameData[];
    };
    type MovieClipFrameData = {
        "image": string;
    };
    interface Drawable {
        update(context2D: CanvasRenderingContext2D): any;
    }
    abstract class DisplayObject implements Drawable {
        type: string;
        parent: DisplayObjectContainer;
        alpha: number;
        globalAlpha: number;
        protected scaleX: number;
        protected scaleY: number;
        x: number;
        y: number;
        rotation: number;
        localMatrix: Matrix;
        globalMatrix: Matrix;
        listeners: TouchEventData[];
        width: number;
        height: number;
        touchEnabled: boolean;
        normalWidth: number;
        normalHeight: number;
        constructor(type: string);
        ScaleX: any;
        ScaleY: any;
        update(): void;
        addEventListener(type: TouchEventsType, touchFunction: Function, object: any, ifCapture?: boolean, priority?: number): void;
        abstract hitTest(x: number, y: number): DisplayObject;
    }
    class DisplayObjectContainer extends DisplayObject {
        childArray: DisplayObject[];
        constructor();
        update(): void;
        addChild(child: DisplayObject): void;
        removeChild(child: DisplayObject): void;
        hitTest(x: number, y: number): DisplayObject;
    }
    class Stage extends cadence.DisplayObjectContainer {
        static stageX: number;
        static stageY: number;
        static instance: Stage;
        static getInstance(): Stage;
    }
    class TextField extends DisplayObject {
        text: string;
        textColor: string;
        size: number;
        typeFace: string;
        textType: string;
        constructor();
        hitTest(x: number, y: number): this;
        setText(text: any): void;
        setX(x: any): void;
        setY(y: any): void;
        setTextColor(color: any): void;
        setSize(size: any): void;
        setTypeFace(typeFace: any): void;
    }
    class Bitmap extends DisplayObject {
        imageID: string;
        protected _texture: Texture;
        constructor();
        texture: Texture;
        hitTest(x: number, y: number): this;
        setX(x: any): void;
        setY(y: any): void;
    }
    class Shape extends DisplayObjectContainer {
        graphics: Graphics;
        constructor();
    }
    class Graphics extends DisplayObjectContainer {
        fillColor: string;
        alpha: number;
        globalAlpha: number;
        strokeColor: string;
        lineWidth: number;
        lineColor: string;
        constructor();
        beginFill(color: any, alpha: any): void;
        endFill(): void;
        drawRect(x1: any, y1: any, x2: any, y2: any, context2D: CanvasRenderingContext2D): void;
        drawCircle(x: any, y: any, rad: any, context2D: CanvasRenderingContext2D): void;
        drawArc(x: any, y: any, rad: any, beginAngle: any, endAngle: any, context2D: CanvasRenderingContext2D): void;
    }
    class MovieClip extends Bitmap {
        private advancedTime;
        private static FRAME_TIME;
        private static TOTAL_FRAME;
        private currentFrameIndex;
        private data;
        constructor(data: MovieClipData);
        ticker: (deltaTime: any) => void;
        play(): void;
        stop(): void;
        setMovieClipData(data: MovieClipData): void;
    }
    class Texture {
        data: HTMLImageElement;
        width: number;
        height: number;
    }
}
declare namespace cadence {
    function setMain(main: any): void;
    let run: (canvas: HTMLCanvasElement) => Stage;
}
