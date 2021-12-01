// import * as PIXI from "./resources/pixi.min.js";
// import gsap from "./resources/gsap.min.js";
console.log("PIXI: ", PIXI);

class MikuTap {
  constructor(container, colors, animations, audios, bgm) {
    this.appWrapper = container;
    this.colors = colors;
    this.animations = animations;
    this.audios = audios;
    this.bgm = bgm;
    this.app = null;
    this.init();
  }

  init() {
    let type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
      type = "canvas";
    }
    PIXI.utils.sayHello(type);
    this.initApp();
    this.initView();
  }
  initApp() {
    this.app = new PIXI.Application({
      autoDensity: true,
      // 抗锯齿
      antialias: true,
      resolution: devicePixelRatio,
    });
  }
  initView() {
    if (!this.app) throw new Error("fail to get app instance");
    this.appWrapper.appendChild(this.app.view);
    this.app.stage.sortableChildren = true;
    let rectangle = new PIXI.Graphics();
    rectangle.lineStyle(4, 0xff3300, 1);
    rectangle.beginFill(0x66ccff);
    rectangle.drawRect(0, 0, 64, 64);
    rectangle.endFill();
    rectangle.x = 170;
    rectangle.y = 170;
    this.app.stage.addChild(rectangle);
    gsap.to(rectangle, {
      rotation: Math.PI * 2,
      width: rectangle.width * 2,
      height: rectangle.height * 2,
      alpha: 0,
      duration: 1,
      x: 50,
      onComplete: () => {
        app.stage.removeChild(shape);
      },
    });
  }
}
