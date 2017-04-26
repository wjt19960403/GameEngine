namespace engine {
    export namespace RES {
        var RESOURCE_PATH = "./Resources/";

        export interface Processor {

            load(url: string, callback: Function): void;

        }

        export class ImageProcessor implements Processor {

            load(url: string, callback: (data: any) => void) {
                var data = document.createElement("img");
                data.src = RESOURCE_PATH + url;
                data.onload = () => {
                    callback(data);
                }
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

        export class TextProcessor implements Processor {
            load(url: string, callback: (data: any) => void) {
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
                            callback(obj)
                            // return obj;
                        } else {
                            console.error(xhr.statusText);
                        }
                    }
                    // };
                    xhr.onerror = function (e) {
                        console.error(xhr.statusText);
                    };
                }
            }
        }

        export function mapTypeSelector(typeSelector: (url: string) => string) {
            getTypeByURL = typeSelector;
        }

        var cache = {};

        export function getRES(url: string, callback: (data: any) => void) {
            // if(cache[url] == null || 
            // ( getTypeByURL(url) == "image" && 
            //   cache[url].data == null) ){
            let type = getTypeByURL(url);
            if (cache[url] == null) {
                let processor = createProcessor(type);
                if (processor != null) {
                    processor.load(url, (data) => {
                        if (type == "image") {
                            var texture = new Texture();
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

                        if(cache[url] == null)
                            console.log(url + "文件不存在！")
                        //console.log(type + "还没读取");
                        return cache[url];
                    });
                }
            }
            //}
            else {
                callback(cache[url]);
                //console.log(type + "读取完了");
                return cache[url]
            }
        }

        export function loadConfig(preloadJson, callback: () => void) {
            preloadJson.resources.forEach((config) => {
                if (config.type == "image") {
                    var preloadResource = new Texture();
                    preloadResource.width = config.width;
                    preloadResource.height = config.height;
                    let processor = createProcessor("image");
                    if (processor != null) {
                        processor.load(config.url, (data) => {
                            preloadResource.data = data;
                        })
                    }
                }
                cache[config.url] = preloadResource;
            });
            callback();
        }

        function get(url: string): any {
            return cache[url];
        }

        var getTypeByURL = (url: string): string => {
            if (url.indexOf(".jpg") >= 0 || url.indexOf(".png") >= 0) {
                return "image";
            }
            else if (url.indexOf(".mp3") >= 0) {
                return "sound";
            }
            else if (url.indexOf(".json") >= 0) {
                return "text";
            }
        }

        let hashMap = {
            "image": new ImageProcessor(),
            "text": new TextProcessor()
        }
        function createProcessor(type: string) {
            let processor: Processor = hashMap[type];
            return processor;
        }

        export function map(type: string, processor: Processor) {
            hashMap[type] = processor;
        }

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
    }
}