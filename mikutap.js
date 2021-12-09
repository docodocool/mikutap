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
    const { color, index: colorIndex } = this.getRandomColor();
    this.curBgColorIndex = colorIndex;
    this.appBackground
      .beginFill(color)
      .drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    this.appBackground.zIndex = -1;

    this.app.stage.addChild(this.appBackground);
    console.log("appbg: ", this.appBackground);
  }
  bindEvent() {
    this.app.view.addEventListener("mousedown", (e) => {
      this.drawRect();
      this.drawSector();
      this.drawExplodeCircle();
      this.drawExplodeRect();
      this.drawRandomPolyLine();
      this.drawRotationRect();
      this.drawCircleCircle();
      this.drawRandomCircle();
      this.drawRandomRect();
      this.drawRandomPolygon();
      this.drawZoomOutPolygon();
      this.drawHelix();
      this.drawCross();
      this.drawCircleLine();
      this.drawRectLine();
      // this.changeBackground();
    });
  }
  changeBackground() {
    const newBackground = new PIXI.Graphics();
    const { color, index: colorIndex } = this.getRandomColor();
    this.curBgColorIndex = colorIndex;
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
  drawRect() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let rectangle = new PIXI.Graphics();
    rectangle.lineStyle(4, 0xff3300, 1);
    rectangle.beginFill(0x66ccff);
    // offsetX, offsetY, width, height, 相对于x, y偏移
    rectangle.drawRect(-32, -32, 64, 64);
    rectangle.position = { x: screenWidth / 2, y: screenHeight / 2 };
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
  drawSector() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
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
    sector.position = { x: screenWidth / 2, y: screenHeight / 2 };
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
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
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
      circle.x = x;
      circle.y = y;
      circle.radius = radius;
      updateCircle(circle, color, 0, 0, circle.radius);
      this.app.stage.addChild(circle);
      timeLine
        .add(
          gsap.fromTo(
            circle,
            { x: screenWidth / 2, y: screenHeight / 2, radius: 0 },
            { x: x, y: y, duration: 0.8, radius: radius, ease: Power3.easeOut }
          ),
          // position(在timeline上的位置)
          0
        )
        .set(circle, { alpha: 0 });
    }
  }
  drawExplodeRect() {
    const count = Math.floor(Math.random() * 4 + 8);
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
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
            { x: screenWidth / 2, y: screenHeight / 2, width: 0, height: 0 },
            { x: x, y: y, duration: 0.8, width: width, height: width, ease: Power3.easeOut }
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
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
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
    const count = Math.floor(random(6, 12));
    const radius = random(screenHeight / 6, screenHeight / 2);
    const width = random(10, 40);
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    let rectList = [];
    let time = 0;
    let delta = 0.15;
    let positionDelta = (Math.PI * 2) / count;
    let selfRotation = random(0, Math.PI);
    let rotation = random(Math.PI / 5, (Math.PI * 2) / 3);
    const container = new PIXI.Graphics();
    let backRotation = random(Math.PI, Math.PI * 3);
    const timeLine = gsap.timeline({
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
      timeLine.add(
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
    timeLine.add(gsap.to(container, 0.8, { rotation: rotation, ease: Bounce.easeOut }));
    time = 0.8 + ((count - 1) * delta) / 3 + delta;
    for (let rect of rectList) {
      timeLine.add(gsap.to(rect, delta, { width: 0, rotation: backRotation }), time);
      time += delta / 3;
    }
  }
  drawCircleCircle() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const num = Math.floor(Math.random() * 6 + 6);
    const radius = random(screenHeight / 6, screenHeight / 2);
    const width = random(10, 30);
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    let circles = [];
    let time = 0;
    const container = new PIXI.Graphics();
    let positionDelta = (Math.PI * 2) / num;
    let delta = 0.15;
    const timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    this.app.stage.addChild(container);
    const drawCircle = (circle, color) => {
      circle.clear();
      circle.beginFill(color);
      circle.drawCircle(0, 0, circle._radius);
      circle.position = { x: circle.pX, y: circle.pY };
      circle.endFill();
    };
    for (let i = 0; i < num; i++) {
      let circle = new PIXI.Graphics();
      let x = Math.sin(positionDelta * i) * radius + screenWidth / 2;
      let y = Math.cos(positionDelta * i) * radius + screenHeight / 2;
      circle._radius = 0;
      circle.pX = x;
      circle.pY = y;
      drawCircle(circle, color);
      container.addChild(circle);
      circles.push(circle);
      timeLine.add(
        gsap.to(circle, {
          duration: delta,
          _radius: width,
          onUpdate: drawCircle,
          onUpdateParams: [circle, color],
          ease: Bounce.easeOut,
        }),
        time
      );
      time += delta / 3;
    }
    time = ((num - 1) * delta) / 3 + delta;
    for (let circle of circles) {
      let newX = random(0, container.width);
      let newY = random(0, container.height);
      timeLine.add(
        gsap.to(circle, {
          duration: 0.3,
          _radius: 0,
          pX: newX,
          pY: newY,
          onUpdate: drawCircle,
          onUpdateParams: [circle, color],
        }),
        time
      );
      time += 0.3 / 3;
    }
  }
  drawRandomCircle() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let num = Math.floor(Math.random() * 5 + 5);
    let circles = [];
    let container = new PIXI.Graphics();
    let time = 0;
    let delta = 0.3;
    let timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    this.app.stage.addChild(container);
    const drawCircle = (circle, color) => {
      circle.clear();
      circle.beginFill(color);
      circle.drawCircle(0, 0, circle._radius);
      circle.position = { x: circle.pX, y: circle.pY };
      circle.endFill();
    };
    for (let i = 0; i < num; i++) {
      const circle = new PIXI.Graphics();
      let radius = random(15, 45);
      const { color, index: colorIndex } = this.getRandomColor();
      this.curColorIndex = colorIndex;
      let x = random(0, screenWidth);
      let y = random(0, screenHeight);
      circle.color = color;
      circle._radius = 0;
      circle.pX = x;
      circle.pY = y;
      drawCircle(circle, circle.color);
      container.addChild(circle);
      circles.push(circle);
      timeLine.add(
        gsap.to(circle, {
          duration: delta,
          _radius: radius,
          onUpdate: drawCircle,
          onUpdateParams: [circle, circle.color],
          ease: Bounce.easeOut,
        }),
        time
      );
      time += delta / 3;
    }
    time = ((num - 1) * delta) / 3 + delta + 0.2;
    for (let circle of circles) {
      timeLine.add(
        gsap.to(circle, {
          duration: delta,
          _radius: 0,
          onUpdate: drawCircle,
          onUpdateParams: [circle, circle.color],
          ease: Bounce.easeOut,
        }),
        time
      );
      time += delta / 3;
    }
  }
  drawRandomRect() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let num = Math.floor(Math.random() * 5 + 5);
    let rects = [];
    let container = new PIXI.Graphics();
    let time = 0;
    let delta = 0.3;
    const timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    this.app.stage.addChild(container);
    const drawRect = (rect) => {
      rect.clear();
      rect.lineStyle(4, rect.color);
      rect.drawRect(0, 0, rect._width, rect._width);
      rect.position = { x: rect.pX, y: rect.pY };
      rect.pivot.x = rect.pivot.y = rect._width / 2;
      rect.endFill();
    };
    for (let i = 0; i < num; i++) {
      let rect = new PIXI.Graphics();
      let width = random(30, 80);
      const { color, index: colorIndex } = this.getRandomColor();
      this.curColorIndex = colorIndex;
      let x = random(0, screenWidth);
      let y = random(0, screenHeight);
      let newX = (random(0, 1) > 0.5 ? -1 : 1) * 100 + x;
      let newY = (random(0, 1) > 0.5 ? -1 : 1) * 100 + y;
      rect._width = 0;
      rect.pX = x;
      rect.pY = y;
      rect.color = color;
      rect.lastX = (random(0, 1) > 0.5 ? -1 : 1) * 100 + newX;
      rect.lastY = (random(0, 1) > 0.5 ? -1 : 1) * 100 + newY;
      drawRect(rect, color);
      container.addChild(rect);
      rects.push(rect);
      timeLine.add(
        gsap.to(rect, {
          duration: delta,
          _width: width,
          pX: newX,
          pY: newY,
          rotation: Math.PI,
          onUpdate: drawRect,
          onUpdateParams: [rect],
          ease: Power2.easeOut,
        }),
        time
      );

      time += delta / 3;
    }
    time = ((num - 1) * delta) / 3 + delta + 0.2;
    for (let rect of rects) {
      timeLine.add(
        gsap.to(rect, {
          duration: delta,
          _width: 0,
          pX: rect.lastX,
          pY: rect.lastY,
          rotation: 0,
          onUpdate: drawRect,
          onUpdateParams: [rect],
          ease: Power2.easeIn,
        }),
        time
      );
      time += delta / 3;
    }
  }
  drawRandomPolygon() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const num = Math.floor(random(3, 10));
    const radius = random(60, 80);
    const points = this.generatePolygonPoints(radius, num);
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    const lineWidth = 3;
    const startAngle = random(0, Math.PI);
    const scale = random(2, 4);
    const direction = random(0, 1) > 0.5 ? true : false;
    const polygon = new PIXI.Graphics();
    const mask = new PIXI.Graphics();
    const updateMask = (mask, direction) => {
      mask.clear();
      mask.beginFill(0xffffff);
      mask.moveTo(0, 0);
      mask.arc(0, 0, mask._radius, mask.startAngle, mask.endAngle, direction);
      mask.position = { x: screenWidth / 2, y: screenHeight / 2 };
    };
    const timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(mask);
      },
    });
    mask._radius = radius;
    mask.startAngle = mask.endAngle = startAngle;
    updateMask(mask);
    polygon.lineStyle(lineWidth, color);
    polygon.drawPolygon(points);
    polygon.closePath();
    polygon.position = { x: screenWidth / 2, y: screenHeight / 2 };
    polygon.pivot.x = screenWidth / 2;
    polygon.pivot.y = screenHeight / 2;
    polygon.mask = mask;
    polygon.rotation = 0;
    this.app.stage.addChild(polygon);
    this.app.stage.addChild(mask);
    timeLine
      .add(
        gsap.to(mask, {
          duration: 0.8,
          endAngle: startAngle + (direction ? -2 : 2) * Math.PI,
          onUpdate: updateMask,
          onUpdateParams: [mask, direction],
        })
      )
      .add(
        gsap.to(mask, {
          duration: 0.8,
          startAngle: startAngle + (direction ? -2 : 2) * Math.PI,
          onUpdate: updateMask,
          onUpdateParams: [mask, direction],
        })
      );
    timeLine
      .add(
        gsap.to(polygon.scale, {
          duration: 1,
          x: scale,
          y: scale,
          ease: Bounce.easeOut,
        }),
        0
      )
      .add(
        gsap.to(polygon, {
          duration: 1,
          rotation: (Math.PI * 4) / 5,
          ease: Bounce.easeOut,
        }),
        0
      );
    timeLine.add(gsap.to(mask.scale, { x: scale, y: scale, duration: 1, ease: Bounce.easeOut }), 0);
  }
  drawZoomOutPolygon() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const num = Math.floor(random(3, 10));
    const radius = 100;
    const points = this.generatePolygonPoints(radius, num);
    const lineWidth = 2;
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    const polygon = new PIXI.Graphics();
    const timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(polygon);
      },
    });
    polygon.lineStyle(lineWidth, color).drawPolygon(points).closePath();
    polygon.position = { x: screenWidth / 2, y: screenHeight / 2 };
    polygon.pivot.x = screenWidth / 2;
    polygon.pivot.y = screenHeight / 2;
    polygon.rotation = 0;
    this.app.stage.addChild(polygon);
    timeLine
      .add(
        gsap.to(polygon, {
          duration: 3,
          rotation: Math.PI / 3,
          ease: Power2.easeOut,
        }),
        0
      )
      .add(
        gsap.to(polygon.scale, {
          duration: 3,
          x: (Math.max(screenWidth, screenHeight) / 100) * 2,
          y: (Math.max(screenWidth, screenHeight) / 100) * 2,
          ease: Power2.easeOut,
        }),
        0
      );
  }
  // spiral
  drawHelix() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    let rad = random(Math.PI / 8, Math.PI / 6);
    let circles = [];
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    let radius = 10;
    let num = 0;
    let container = new PIXI.Graphics();
    let time = 0;
    let delay = 0.1;
    let indicate = Math.ceil((num * rad) / Math.PI);
    let timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    this.app.stage.addChild(container);
    const drawCircle = (circle, color) => {
      circle.clear();
      circle.beginFill(color);
      circle.drawCircle(0, 0, circle._radius);
      circle.position = { x: circle.pX, y: circle.pY };
    };
    while (indicate < 8) {
      radius += indicate * 3;
      let circle = new PIXI.Graphics();
      let circleRadius = indicate;
      let x = Math.sin(num * rad) * radius + screenWidth / 2;
      let y = Math.cos(num * rad) * radius + screenHeight / 2;
      circle._radius = 0;
      circle.pX = x;
      circle.pY = y;
      drawCircle(circle, color);
      container.addChild(circle);
      circles.push(circle);
      timeLine.add(
        gsap.to(circle, delay, {
          _radius: circleRadius,
          ease: Bounce.easeOut,
          onUpdate: drawCircle,
          onUpdateParams: [circle, color],
        }),
        time
      );
      time += delay / 3;
      num++;
      indicate = Math.ceil((num * rad) / Math.PI);
    }
    time = ((delay / 3) * (num - 1)) / 2 + delay;
    for (let circle of circles) {
      timeLine.add(
        gsap.to(circle, delay, {
          _radius: 0,
          ease: Bounce.easeOut,
          onUpdate: drawCircle,
          onUpdateParams: [circle, color],
        }),
        time
      );
      time += delay / 3;
    }
  }
  drawCross() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    const width = 700;
    const height = random(30, 80);
    const x = random(250, screenWidth - 250);
    const y = random(250, screenHeight - 250);
    const container = new PIXI.Graphics();
    const shape1 = new PIXI.Graphics();
    const shape2 = new PIXI.Graphics();
    const timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    shape1._width = shape2._width = height;
    shape1.color = shape2.color = color;
    shape1.points = [
      { x: x - width / 2, y: y },
      { x: x - width / 2, y: y },
    ];
    shape2.points = [
      { x: x, y: y - width / 2 },
      { x: x, y: y - width / 2 },
    ];
    const drawShape = (shape) => {
      shape.clear();
      shape.lineStyle(shape._width, shape.color);
      shape.moveTo(shape.points[0].x, shape.points[0].y);
      shape.lineTo(shape.points[1].x, shape.points[1].y);
    };
    drawShape(shape1);
    drawShape(shape2);
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    container.addChild(shape1);
    container.addChild(shape2);
    container.position = { x: x, y: y };
    container.pivot.x = x;
    container.pivot.y = y;
    container.rotation = Math.PI;
    this.app.stage.addChild(container);
    timeLine.to(
      shape1.points[1],
      {
        duration: 0.5,
        x: x + width / 2,
        onUpdate: drawShape,
        onUpdateParams: [shape1],
        ease: Power2.easeOut,
      },
      0
    );
    timeLine.to(
      shape2.points[1],
      {
        duration: 0.5,
        y: y + width / 2,
        onUpdate: drawShape,
        onUpdateParams: [shape2],
        ease: Power2.easeOut,
      },
      0
    );
    timeLine.add(
      gsap.to(container, {
        duration: 0.5,
        rotation: ((random(0, 1) > 0.5 ? -1 : 1) * Math.PI) / 4 + (random(0, 1) * Math.PI) / 5,
        ease: Back.easeOut,
      }),
      0
    );
    timeLine.to(
      shape1.points[0],
      {
        duration: 0.3,
        x: x + width / 2,
        onUpdate: drawShape,
        onUpdateParams: [shape1],
        ease: Power2.easeOut,
      },
      0.6
    );
    timeLine.to(
      shape2.points[0],
      {
        duration: 0.3,
        y: y + width / 2,
        onUpdate: drawShape,
        onUpdateParams: [shape2],
        ease: Power2.easeOut,
      },
      0.6
    );
  }
  drawCircleLine() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    const num = Math.floor(random(3, 7));
    const lineWidth = random(20, 80);
    const radius = random(250, 350);
    const direction = random(0, 1) > 0.5 ? true : false;
    const startAngle = random(0, Math.PI);
    const width = (2 * radius) / num - lineWidth;
    const container = new PIXI.Graphics();
    const lines = [];
    let index = 0;
    const mask = new PIXI.Graphics();
    const timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    mask.beginFill(0xffffff);
    mask.drawCircle(screenWidth / 2, screenHeight / 2, radius);
    container.mask = mask;
    container.pivot.x = screenWidth / 2;
    container.pivot.y = screenHeight / 2;
    container.position = {
      x: screenWidth / 2,
      y: screenHeight / 2,
    };
    container.rotation = startAngle;
    const drawShape = (shape) => {
      shape.clear();
      shape.lineStyle(shape._width, shape.color);
      shape.moveTo(shape.points[0].x, shape.points[0].y);
      shape.lineTo(shape.points[1].x, shape.points[1].y);
    };
    while (index <= num) {
      let line = new PIXI.Graphics();
      let xBounds = screenWidth / 2 - radius;
      let yBounds = screenHeight / 2 - radius;
      line._width = lineWidth;
      line.color = color;
      line.points = [
        {
          x: direction ? xBounds : xBounds + index * (width + lineWidth),
          y: direction ? index * (width + lineWidth) + yBounds : yBounds,
        },
        {
          x: direction ? xBounds + 2 * radius : xBounds + index * (width + lineWidth),
          y: direction ? index * (width + lineWidth) + yBounds : yBounds + 2 * radius,
        },
      ];
      drawShape(line);
      lines.push(line);
      container.addChild(line);
      timeLine.to(
        line.points[0],
        {
          duration: random(0.6, 0.8),
          x: direction ? xBounds + 2 * radius : xBounds + index * (width + lineWidth),
          y: direction ? index * (width + lineWidth) + yBounds : yBounds + 2 * radius,
          onUpdate: drawShape,
          onUpdateParams: [line],
          ease: Power2.easeOut,
        },
        random(0, 1) > 0.6 ? 0.5 : 0.3
      );
      index++;
    }
    this.app.stage.addChild(container);
    timeLine.add(
      gsap.to(container, {
        duration: 0.8,
        rotation: startAngle + ((random(0, 1) > 0.5 ? -1 : 1) * Math.PI) / 2,
        ease: Back.easeOut,
      }),
      0
    );
  }
  drawRectLine() {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const { color, index: colorIndex } = this.getRandomColor();
    this.curColorIndex = colorIndex;
    let num = Math.floor(random(3, 7));
    let lineWidth = random(20, 80);
    let radius = random(250, 350);
    let direction = random(0, 1) > 0.5 ? true : false;
    let width = (2 * radius) / num - lineWidth;
    let container = new PIXI.Graphics();
    let lines = [];
    let index = 0;
    let timeLine = gsap.timeline({
      onComplete: () => {
        this.app.stage.removeChild(container);
      },
    });
    container.beginFill(0, 0);
    container.drawRect(0, 0, screenWidth, screenHeight);
    container.pivot.x = screenWidth / 2;
    container.pivot.y = screenHeight / 2;
    container.position = {
      x: screenWidth / 2,
      y: screenHeight / 2,
    };
    const drawShape = (shape) => {
      shape.clear();
      shape.lineStyle(shape._width, shape.color);
      shape.moveTo(shape.points[0].x, shape.points[0].y);
      shape.lineTo(shape.points[1].x, shape.points[1].y);
    };
    while (index <= num) {
      let line = new PIXI.Graphics();
      let xBounds = screenWidth / 2 - radius;
      let yBounds = screenHeight / 2 - radius;
      let delay = random(0.2, 0.4);
      let start = random(0.1, 0.2);
      line._width = lineWidth;
      line.color = color;
      line.points = [
        {
          x: direction ? xBounds : xBounds + index * (width + lineWidth),
          y: direction ? index * (width + lineWidth) + yBounds : yBounds,
        },
        {
          x: direction ? xBounds : xBounds + index * (width + lineWidth),
          y: direction ? index * (width + lineWidth) + yBounds : yBounds,
        },
      ];
      line.end = {
        x: direction ? xBounds + 2 * radius : xBounds + index * (width + lineWidth),
        y: direction ? index * (width + lineWidth) + yBounds : yBounds + 2 * radius,
      };
      drawShape(line);
      lines.push(line);
      container.addChild(line);
      timeLine
        .to(
          line.points[1],

          {
            duration: delay,
            x: direction ? xBounds + 2 * radius : xBounds + index * (width + lineWidth),
            y: direction ? index * (width + lineWidth) + yBounds : yBounds + 2 * radius,
            onUpdate: drawShape,
            onUpdateParams: [line],
            ease: Power2.easeOut,
          },
          start
        )
        .to(
          line.points[0],
          {
            duration: 0.2,
            x: line.end.x,
            y: line.end.y,
            onUpdate: drawShape,
            onUpdateParams: [line],
            ease: Power2.easeOut,
          },
          start + delay
        );
      index++;
    }
    this.app.stage.addChild(container);
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
  generatePolygonPoints(radius, num) {
    const { width: screenWidth, height: screenHeight } = this.app.screen;
    const deltaRad = (Math.PI * 2) / num;
    let points = [];
    for (let index = 0; index < num; index++) {
      const x = Math.sin(index * deltaRad) * radius + screenWidth / 2;
      const y = Math.cos(index * deltaRad) * radius + screenHeight / 2;
      points.push(new PIXI.Point(x, y));
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
