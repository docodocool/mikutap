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
    this.curBgColor = 0;
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
    const { color, index } = this.getRandomColor();
    this.curBgColorIndex = index;
    this.appBackground
      .beginFill(color)
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
      // this.drawRect(offsetX, offsetY);
      // this.drawSector(offsetX, offsetY);
      // this.drawExplodeCircle();
      // this.drawExplodeRect();
      // this.drawRandomPolyLine();
      this.drawRotationRect();
      // this.changeBackground();
    });
  }
  changeBackground() {
    const newBackground = new PIXI.Graphics();
    const { color, index } = this.getRandomColor();
    this.curBgColorIndex = index;
    const randomSeed = Math.random();
    const { width, height } = this.app.screen;
    newBackground.beginFill(color).drawRect(0, 0, width, height);
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
    if (randomIndex === this.curColorIndex || randomIndex === this.curBgColorIndex) {
      if (randomIndex === colorList.length - 1) {
        randomIndex -= 1;
      } else {
        randomIndex += 1;
      }
    }
    return { color: colorList[randomIndex], index: randomIndex };
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
      width: rectangle.width * 4,
      height: rectangle.height * 4,
      alpha: 0,
      duration: 0.8,
      onComplete: () => {
        this.app.stage.removeChild(rectangle);
      },
    });
    this.app.stage.addChild(rectangle);
  }
  drawSector(x, y) {
    const { color, index } = this.getRandomColor();
    this.curColorIndex = index;
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
  drawExplodeCircle() {
    const count = Math.floor(Math.random() * 4 + 8);
    const { color, index } = this.getRandomColor();
    this.curColorIndex = index;
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let circleList = [];
    let timeLine = gsap.timeline({
      onComplete: () => {
        circleList.forEach((circle) => {
          this.app.stage.removeChild(circle);
        });
      },
    });
    const updateCircle = (circle, color, x, y, radius) => {
      circle.clear();
      circle.lineStyle(5, color);
      circle.drawCircle(x, y, radius);
    };
    for (let i = 0; i < count; i++) {
      let circle = new PIXI.Graphics();
      let x = random(0, screenWidth);
      let y = random(0, screenHeight);
      let radius = random(10, 25);
      updateCircle(circle, color, 0, 0, radius);
      this.app.stage.addChild(circle);
      timeLine
        .add(
          gsap.fromTo(
            circle,
            0.8,
            { x: screenWidth / 2, y: screenHeight / 2, radius: 0 },
            { x: x, y: y, radius: radius, ease: Power3.easeOut }
          ),
          // position(在timeline上的位置)
          0
        )
        .set(circle, { alpha: 0 });
    }
  }
  drawExplodeRect() {
    const count = Math.floor(Math.random() * 4 + 8);
    const { color, index } = this.getRandomColor();
    this.curColorIndex = index;
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let rectList = [];
    let timeLine = gsap.timeline({
      onComplete: () => {
        rectList.forEach((rect) => {
          this.app.stage.removeChild(rect);
        });
      },
    });
    const updateRect = (rect, color, x, y, width, rotation) => {
      rect.clear();
      rect.lineStyle(5, color);
      rect.drawRect(x, y, width, width);
      rect.rotation = rotation;
    };
    for (let i = 0; i < count; i++) {
      let rect = new PIXI.Graphics();
      let x = random(0, screenWidth);
      let y = random(0, screenHeight);
      let width = random(20, 50);
      let rotation = random(0, Math.PI * 2);
      updateRect(rect, color, 0, 0, width, rotation);
      this.app.stage.addChild(rect);
      timeLine
        .add(
          gsap.fromTo(
            rect,
            0.8,
            { x: screenWidth / 2, y: screenHeight / 2, radius: 0 },
            { x: x, y: y, width: width, height: width, ease: Power3.easeOut }
          ),
          // position(在timeline上的位置)
          0
        )
        .set(rect, { alpha: 0 });
    }
  }
  drawRandomPolyLine() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let direction = Math.floor(Math.random() * 4);
    let num = Math.floor(random(2, 4));
    let points = this.generatePoints(direction, num);
    let lineWidth = random(2, 6);
    const { color, index } = this.getRandomColor();
    this.curColorIndex = index;
    let polyline = new PIXI.Graphics();
    let mask = new PIXI.Graphics();
    let arr = [
      [0, 0, screenWidth, 0, screenWidth, 0, 0, 0],
      [screenWidth, 0, screenWidth, 0, screenWidth, screenHeight, screenWidth, screenHeight],
      [0, screenHeight, screenWidth, screenHeight, screenWidth, screenHeight, 0, screenHeight],
      [0, 0, 0, 0, 0, screenHeight, 0, screenHeight],
    ];
    let updateMask = (mask) => {
      mask.clear();
      mask.beginFill(0, 1);
      let points = mask.points;
      mask.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        mask.lineTo(points[i].x, points[i].y);
      }
      mask.endFill();
    };
    let timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(polyline);
      },
      onUpdate: updateMask,
      onUpdateParams: [mask],
    });
    let duration = 0.7;
    let target =
      direction % 2 === 0
        ? {
            duration,
            y: direction === 0 ? screenHeight : 0,
            ease: Power3.easeOut,
          }
        : {
            duration,
            x: direction === 1 ? 0 : screenWidth,
            ease: Power3.easeOut,
          };
    let startPoint = (direction + 2) % 4;
    mask.beginFill(0, 0);
    mask.points = [];
    for (let i = 0; i < 4; i++) {
      mask.points.push({
        x: arr[direction][i * 2],
        y: arr[direction][i * 2 + 1],
      });
    }
    polyline.points = points;
    let drawLine = (polyline, width, color) => {
      polyline.clear();
      polyline.lineStyle(width, color);
      let points = polyline.points;
      polyline.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        polyline.lineTo(points[i].x, points[i].y);
      }
      polyline.endFill();
    };
    drawLine(polyline, lineWidth, color);
    polyline.mask = mask;
    this.app.stage.addChild(polyline);
    timeLine
      .add(gsap.to(mask.points[startPoint], target), 0)
      .add(gsap.to(mask.points[(startPoint + 1) % 4], target), 0)
      .add(gsap.to(mask.points[(startPoint + 2) % 4], target), 0.7)
      .add(gsap.to(mask.points[(startPoint + 3) % 4], target), 0.7);
  }
  drawRotationRect() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let count = Math.floor(random(6, 12));
    let radius = random(screenHeight / 6, screenHeight / 2);
    let width = random(10, 40);
    const { color, index } = this.getRandomColor();
    this.curColorIndex = index;
    let rectList = [];
    let time = 0;
    let delta = 0.15;
    let positionDelta = (Math.PI * 2) / count;
    let selfRotation = random(0, Math.PI);
    let rotation = random(Math.PI / 5, (Math.PI * 2) / 3);
    let container = new PIXI.Graphics();
    let backRotation = random(Math.PI, Math.PI * 3);
    let tl = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    // 旋转轴心
    container.pivot.x = screenWidth / 2;
    container.pivot.y = screenHeight / 2;
    container.position = {
      x: screenWidth / 2,
      y: screenHeight / 2,
    };
    this.app.stage.addChild(container);
    const drawRect = (rect, color, width, x, y) => {
      rect.clear();
      rect.beginFill(color);
      rect.drawRect(0, 0, width, width);
      rect.position = { x: x, y: y };
      rect.pivot.x = rect.pivot.y = width / 2;
      rect.endFill();
    };
    for (let i = 0; i < count; i++) {
      let rect = new PIXI.Graphics();
      let x = Math.sin(positionDelta * i) * radius + screenWidth / 2;
      let y = Math.cos(positionDelta * i) * radius + screenHeight / 2;
      drawRect(rect, color, 0, x, y);
      container.addChild(rect);
      rectList.push(rect);
      tl.add(
        gsap.to(rect, delta, {
          width: width,
          rotation: selfRotation,
          onUpdate: drawRect,
          onUpdateParams: [rect, color, width, x, y],
        }),
        time
      );
      time += delta / 3;
    }
    tl.add(gsap.to(container, 0.8, { rotation: rotation, ease: Bounce.easeOut }));
    time = 0.8 + ((count - 1) * delta) / 3 + delta;
    for (let rect of rectList) {
      tl.add(gsap.to(rect, delta, { width: 0, rotation: backRotation }), time);
      time += delta / 3;
    }
  }
  generatePoints(direction, num) {
    let points = [];
    const { width, height } = this.app.screen;
    if (direction % 2 === 0) {
      let minX = 0;
      let maxX = width;
      let delta = height / num;
      points.push({ x: random(minX, maxX), y: 0 });
      for (let i = 0; i < num; i++) {
        let x = random(minX, maxX);
        let y = random(i * delta, (i + 1) * delta);
        points.push({ x: x, y: y });
      }
      points.push({ x: random(minX, maxX), y: height });
      if (direction === 2) {
        points = points.sort((a, b) => b.y - a.y);
      }
    } else {
      let minY = 0;
      let maxY = height;
      let delta = width / num;
      points.push({ x: 0, y: random(minY, maxY) });
      for (let i = 0; i < num; i++) {
        let y = random(minY, maxY);
        let x = random(i * delta, (i + 1) * delta);
        points.push({ x: x, y: y });
      }
      points.push({ x: width, y: random(minY, maxY) });
      if (direction === 1) {
        points = points.sort((a, b) => b.x - a.x);
      }
    }
    return points;
  }
}

const random = (min, max) => Math.random() * (max - min) + min;
const colorList = [
  0x88cccc, 0xfc3e77, 0xd49e9e, 0xcceeee, 0x594f57, 0x888899, 0xec5685, 0x312b2d, 0x8ad9ec,
  0x109fb1, 0x0eaa9d, 0x9ccfe7, 0x977fd7, 0xf5a9cb, 0xf5d4c8, 0xffffc2, 0xfa6d6f, 0xfa8f6f,
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
