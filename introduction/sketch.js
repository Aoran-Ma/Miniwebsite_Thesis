let imgs = [];
let offsets = [];
let imIndex = 13;
let vertices;

let walls = [];
let selectedShape = -1;
let mouseConstraint;
let mouse;
let text_font;
let selectedLink;

let gifLoaded;
function preload() {
  for (let i = 0; i < 14; i++) {
    imgs[i] = loadImage("assets/Asset " + (i + 1) + ".png");
  }
  vertices = loadJSON("introductionShapesVertex.json");
  offsets[0] = { x: 0, y: 0 };
  offsets[1] = { x: 0, y: 0 };
  offsets[2] = { x: 0, y: 150 };
  offsets[3] = { x: 0, y: 0 };
  offsets[4] = { x: 0, y: 0 };
  offsets[5] = { x: 0, y: 0 };
  offsets[6] = { x: 0, y: 0 };
  offsets[7] = { x: 80, y: -80 };
  offsets[8] = { x: 120, y: 60 };
  offsets[9] = { x: 0, y: 110 };
  offsets[10] = {
    x: 0,
    y: 0,
    link: "https://drive.google.com/drive/folders/1IpvY4vh5VSeMLR_qjHzFrpWiirJTwpcl",
  };
  offsets[11] = { x: 140, y: 0, link: "https://aoranmagd.com/" };
  offsets[12] = { x: 230, y: 200 };
  offsets[13] = { x: 0, y: -220 };
  text_font = loadFont("font/PPFragment-SansRegular.ttf");
  // gifLoaded = createImg("assets/myGif.gif","portrait gif").size(150,250).hide();
}

function setup() {
  createCanvas(800, 800).parent(select(".canvas-container"));
  pixelDensity(2); //increase pixel density
  textFont(text_font);
  resizeTheCanvas();
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(LEFT, CENTER);
  colorPair = new ColorPair();

  engine = Matter.Engine.create();
  world = engine.world;

  options = { isStatic: true, label: "wall" };
  walls[0] = Matter.Bodies.rectangle(width / 2, height + 20, 2000, 40, options);
  walls[1] = Matter.Bodies.rectangle(-20, height / 2, 40, 2000, options);
  walls[2] = Matter.Bodies.rectangle(width + 20, height / 2, 40, 2000, options);
  Matter.World.add(world, walls);

  distinctPos = [];
  options = { restitution: 0.5, frictionAir: 0 };

  for (let i = 0; i < imgs.length; i++) {
    let pt = getRandomPos();

    let b = Matter.Bodies.fromVertices(pt.x, pt.y, vertices[i], options);
    b.img = imgs[i];
    b.offsetX = offsets[i].x;
    b.offsetY = offsets[i].y;
    if (offsets[i].link) b.link = offsets[i].link;
    Matter.World.add(world, b);
  }
  mouse = Matter.Bodies.circle(0, 0, 0, { isStatic: true });
  Matter.World.add(world, mouse);
}

function draw() {
  clear();
  colorPair.apply();

  push();
  fill(100, 100, 200, 100);
  for (let body of world.bodies) {
    if (!body.img) continue;
    // beginShape();
    // for (let v of body.vertices) {
    //   vertex(v.x, v.y);
    // }
    // endShape();
    push();
    translate(body.position.x, body.position.y);
    scale(0.15);
    if (body.sc) scale(body.sc);
    rotate(body.angle);
    image(body.img, body.offsetX, body.offsetY);
    pop();

    let bound = body.bounds;
    if (bound.min.y > height) {
      Matter.Body.setPosition(body, {
        x: random(100, width - 100),
        y: -(bound.max.y - bound.min.y),
      });
    }
    if (
      mouseX > bound.min.x &&
      mouseX < bound.max.x &&
      mouseY > bound.min.y &&
      mouseY < bound.max.y
    ) {
      selectedLink = body.link;
      if (selectedLink) body.sc = 1.05;
      if (selectedShape == -1) {
        if (mouseIsPressed) {
          selectedShape = 1;
          mouseConstraint = Matter.Constraint.create({
            bodyA: mouse,
            bodyB: body,
          });
          Matter.World.add(world, mouseConstraint);
        }
      } else {
        if (!mouseIsPressed) {
          selectedShape = -1;
          Matter.World.remove(world, mouseConstraint);
        }
      }
    } else {
      body.sc = 1;
    }
  }
  pop();
  push();
  scale(0.15);
  pop();

  Matter.Body.setPosition(mouse, { x: mouseX, y: mouseY });
  Matter.Engine.update(engine);
}
function doubleClicked() {
  if (selectedLink) window.location.href = selectedLink;
}
function resizeTheCanvas() {
  let w = min(windowWidth, windowHeight);
  let newWidth, newHeight;
  if (windowWidth < windowHeight) {
    //them its verticall
    newWidth = 800;
    newHeight = floor(800 * (windowHeight / windowWidth));
  } else {
    newHeight = 800;
    newWidth = floor(800 * (windowWidth / windowHeight));
  }
  resizeCanvas(newWidth, newHeight);
  //reposition walls
  if (walls.length != 0) {
    Matter.Body.setPosition(walls[0], { x: width / 2, y: height + 20 });
    Matter.Body.setPosition(walls[1], { x: -20, y: height / 2 });
    Matter.Body.setPosition(walls[2], { x: width + 20, y: height / 2 });
  }
  // gifLoaded.show();
  // let s=100;
  // gifLoaded.position(windowWidth/2 +s*3.2,windowHeight/2 - s*1.6);
  // gifLoaded.size(s,s*(4/3));
}
function windowResized() {
  resizeTheCanvas();
}
let colorswatch = [
  "#ed1c24",
  "#f58220",
  "#fdb913",
  "#ffe600",
  "#00a651",
  "#00aeef",
  "#005baa",
  "#812990",
  "#e1058c",
  "#f8c1d9",
];

class ColorPair {
  constructor() {
    this.applied = false;

    this.colPoint = map(mouseX, 0, width, 0, colorswatch.length);

    this.color1 = color(random(colorswatch));
    this.color2 = color(random(colorswatch));

    this.panx = 0;
    this.pany = 0;
  }

  apply() {
    this.colPointX = (this.panx + 5 + frameCount / 60) % colorswatch.length;
    this.colPointY = (this.pany + frameCount / 60) % colorswatch.length;

    this.color1 = findColorInBetween(this.colPointX);
    this.color2 = findColorInBetween(this.colPointY);

    let backDiv = select(".canvas-container");
    backDiv.style(
      "background-image",
      "linear-gradient(to top, " +
        this.color1 +
        ",white,white," +
        this.color2 +
        ")"
    );

    this.panx = map(mouseX, 0, width, 0, 2);
    this.pany = map(mouseY, 0, height, 0, 2);
  }
}
function findColorInBetween(n) {
  let col1 = color(colorswatch[floor(n)]);
  let col2 = color(colorswatch[(floor(n) + 1) % colorswatch.length]);
  let diff = n - floor(n);
  res = [];

  return (
    "rgb(" +
    map(diff, 0, 1, col1.levels[0], col2.levels[0]).toFixed(1) +
    "," +
    map(diff, 0, 1, col1.levels[1], col2.levels[1]).toFixed(1) +
    "," +
    map(diff, 0, 1, col1.levels[2], col2.levels[2]).toFixed(1) +
    ")"
  );
}
function getRandomPos() {
  let pt = { x: random(100, width - 100), y: random(-100, -height * 2) };
  for (let i = 0; i < distinctPos.length; i++) {
    if (dist(pt.x, pt.y, distinctPos[i].x, distinctPos[i].y) < 200) {
      pt = getRandomPos();
      break;
    }
  }
  distinctPos.push(pt);
  return pt;
}
function setLineDash() {
  drawingContext.setLineDash([15, 20]);
}
