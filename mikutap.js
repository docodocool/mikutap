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
    this.curColorIndex = 0;
    this.app = null;
    this.appBackground = null;
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
    this.initBackground();
    this.bindEvent();
  }
  initApp() {
    this.app = new PIXI.Application({
      width: 600,
      height: 600,
      autoDensity: true,
      // 抗锯齿
      antialias: true,
      resolution: devicePixelRatio,
    });
    console.log("app: ", this.app);
  }
  initView() {
    if (!this.app) throw new Error("fail to get app instance");
    this.appWrapper.appendChild(this.app.view);
    this.app.stage.sortableChildren = true;
  }
  initBackground() {
    if (this.appBackground) {
      this.app.stage.removeChild(this.appBackground);
    }
    this.appBackground = new PIXI.Graphics();
    this.appBackground
      .beginFill(this.getRandomColor())
      .drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    this.appBackground.zIndex = -1;

    this.app.stage.addChild(this.appBackground);
    console.log("appbg: ", this.appBackground);
  }
  bindEvent() {
    this.app.view.addEventListener("mousedown", (e) => {
      const { width, height } = this.app.screen;
      const offsetX = width / 2;
      const offsetY = height / 2;
      this.drawRect(offsetX, offsetY);
      this.drawSector(offsetX, offsetY);
      this.changeBackground();
    });
  }
  changeBackground() {
    const newBackground = new PIXI.Graphics();
    const newBackgroundColor = this.getRandomColor();
    const randomSeed = Math.random();
    const { width, height } = this.app.screen;
    newBackground.beginFill(newBackgroundColor).drawRect(0, 0, width, height);
    let position = { x: 0, y: 0 };
    switch (true) {
      case randomSeed < 0.25:
        position = { x: -2 * width, y: -2 * height };
        break;
      case randomSeed >= 0.25 && randomSeed < 0.5:
        position = { x: 2 * width, y: -2 * height };
        break;
      case randomSeed >= 0.5 && randomSeed < 0.75:
        position = { x: -2 * width, y: 2 * height };
        break;
      case randomSeed >= 0.75:
        position = { x: 2 * width, y: 2 * height };
        break;
    }
    newBackground.position = position;
    newBackground.zIndex = -1;
    this.app.stage.addChild(newBackground);
    const rotation = random(0, 2 * Math.PI);
    const timeLine = gsap.timeline();
    timeLine.set(newBackground, { rotation }).to(newBackground, {
      duration: 0.8,
      rotation: 0,
      x: 0,
      y: 0,
      onComplete: () => {
        this.appBackground
          .beginFill(newBackgroundColor)
          .drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.app.stage.removeChild(newBackground);
      },
    });
  }
  getRandomColor() {
    // "0x" + Math.floor(Math.random() * 16777215).toString(16);
    let randomIndex = Math.floor(Math.random() * (colorList.length - 1));
    if (randomIndex === this.curColorIndex) {
      if (randomIndex === colorList.length - 1) {
        randomIndex -= 1;
      } else {
        randomIndex += 1;
      }
    }
    this.curColorIndex = randomIndex;
    return colorList[randomIndex];
  }
  drawRect(x, y) {
    let rectangle = new PIXI.Graphics();
    rectangle.lineStyle(4, 0xff3300, 1);
    rectangle.beginFill(0x66ccff);
    // offsetX, offsetY, width, height, 相对于x, y偏移
    rectangle.drawRect(-32, -32, 64, 64);
    rectangle.position = { x: x, y: y };
    rectangle.endFill();
    gsap.to(rectangle, {
      rotation: Math.PI * 2,
      width: rectangle.width * 2,
      height: rectangle.height * 2,
      alpha: 0,
      duration: 0.5,
      onComplete: () => {
        this.app.stage.removeChild(rectangle);
      },
    });
    this.app.stage.addChild(rectangle);
  }
  drawSector(x, y) {
    const color = this.getRandomColor();
    let startAngle = random(0, 2 * Math.PI);
    let radius = random(60, 100);
    let direction = Math.random() > 0.5 ? true : false;
    const updateSector = (sector, color, radius, direction) => {
      sector.clear();
      sector.beginFill(color);
      sector.moveTo(0, 0);
      // cx, cy, radius, startAngle, endAngle, 逆时针;
      sector.arc(0, 0, radius, sector.startAngle, sector.endAngle, direction);
    };
    let sector = new PIXI.Graphics();
    sector.startAngle = sector.endAngle = startAngle;
    updateSector(sector, color, radius, direction);
    sector.position = { x: x, y: y };
    this.app.stage.addChild(sector);

    const timeLine = gsap.timeline();
    timeLine
      .to(sector, {
        duration: 0.8,
        endAngle: startAngle + (direction ? -2 : 2) * Math.PI,
        onUpdateParams: [sector, color, radius, direction],
        onUpdate: updateSector,
        ease: Power3.easeOut,
      })
      .to(sector, {
        duration: 0.8,
        startAngle: startAngle + (direction ? -2 : 2) * Math.PI,
        onUpdateParams: [sector, color, radius, direction],
        onUpdate: updateSector,
        ease: Power3.easeOut,
        onComplete: () => {
          this.app.stage.removeChild(sector);
        },
      });
  }
}
const random = (min, max) => Math.random() * (max - min) + min;
const colorList = [
  0x88cccc, 0xfc3e77, 0xd49e9e, 0xcceeee, 0x594f57, 0x888899, 0xec5685,
  0x312b2d, 0x8ad9ec, 0x109fb1, 0x0eaa9d, 0x9ccfe7, 0x977fd7, 0xf5a9cb,
  0xf5d4c8, 0xffffc2, 0xfa6d6f, 0xfa8f6f,
];
// @pixi/graphics-extras
const drawRegularPolygon = (x, y, radius, sides, rotation = 0) => {
  sides = Math.max(sides | 0, 3);
  let startAngle = (-1 * Math.PI) / 2 + rotation;
  let delta = (Math.PI * 2) / sides;
  let polygon = [];
  for (let i = 0; i < sides; i++) {
    let angle = i * delta + startAngle;
    polygon.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
  }
  return PIXI.drawPolygon(polygon);
};
