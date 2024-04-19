let imgs = [];
let walls = [];
let selectedShape = -1;
let mouseConstraint;
let mouse;
let offSet = [];
let selectedLink;

function preload() {
  for (let i = 0; i < 14; i++) {
    imgs[i] = loadImage("assets/Asset " + (i + 1) + ".png");
    offSet[i] = { x: 0, y: 0, link: undefined };
  }
  offSet[1].link = "generator";
  offSet[2].link = "introduction";
  offSet[5].link = "collection";
  offSet[6].link = "manifesto";

  offSet[3] = { x: 0, y: 35, link: undefined };
  offSet[4] = { x: -10, y: 50, link: undefined };
  offSet[8] = { x: -10, y: -30, link: undefined };
  offSet[9] = { x: 5, y: 7, link: undefined };
  offSet[10] = { x: -15, y: -5, link: undefined };
  offSet[11] = { x: -20, y: -12, link: undefined };
  offSet[12] = { x: -5, y: 15, link: undefined };
  offSet[13] = { x: -14, y: 20, link: undefined };
  vertices = loadJSON("shapeVertices.json");
}

function setup() {
  createCanvas(800, 800).parent(select(".canvas-container"));
  pixelDensity(2); //increase pixel density
  resizeTheCanvas();
  rectMode(CENTER);
  imageMode(CENTER);
  colorPair = new ColorPair();

  //Physics setup
  engine = Matter.Engine.create();
  engine.world.gravity.y = 2;
  world = engine.world;

  //add walls
  options = { isStatic: true, label: "wall" };
  walls[0] = Matter.Bodies.rectangle(width / 2, height + 20, 2000, 40, options);
  walls[1] = Matter.Bodies.rectangle(-20, height / 2, 40, 2000, options);
  walls[2] = Matter.Bodies.rectangle(width + 20, height / 2, 40, 2000, options);
  Matter.World.add(world, walls);

  distinctPos = [];
  options = { restitution: 0.5, frictionAir: 0 };
  let offSet1 = [];
  for (let i = 0; i < imgs.length; i++) {
    let pt = getRandomPos();

    let b = Matter.Bodies.fromVertices(pt.x, pt.y, vertices[i], options);
    b.offset = offSet[i];
    b.img = imgs[i];
    Matter.World.add(world, b);
  }
  mouse = Matter.Bodies.circle(0, 0, 0, { isStatic: true });
  Matter.World.add(world, mouse);
}

let imIndex = 0;
function draw() {
  clear();
  selectedLink = undefined;
  colorPair.apply();
  fill(255, 100);
  stroke(0, 100);
  //draw every element from world
  let index = 0;
  for (let i = 0; i < world.bodies.length; i++) {
    push();
    translate(world.bodies[i].position.x, world.bodies[i].position.y);
    let bound = world.bodies[i].bounds;
    let mouseOver = false;
    if (world.bodies[i].img) {
      if (
        mouseX > bound.min.x &&
        mouseX < bound.max.x &&
        mouseY > bound.min.y &&
        mouseY < bound.max.y
      ) {
        mouseOver = true;
        if (selectedShape == -1) {
          if (mouseIsPressed) {
            selectedShape = i;
            mouseConstraint = Matter.Constraint.create({
              bodyA: mouse,
              bodyB: world.bodies[i],
            });
            Matter.World.add(world, mouseConstraint);
          }
        } else {
          if (!mouseIsPressed) {
            selectedShape = -1;
            Matter.World.remove(world, mouseConstraint);
          }
        }
      }

      rotate(world.bodies[i].angle);
      scale(0.15);
      if (mouseOver && world.bodies[i].offset.link) {
        selectedLink = world.bodies[i].offset.link;
        scale(1.05);
      }

      image(
        world.bodies[i].img,
        world.bodies[i].offset.x / 0.15 / 2,
        world.bodies[i].offset.y / 0.15 / 2
      );
      fill(255);
      textSize(200);
      //if the shape fallse of the screen?
      if (bound.min.y > height) {
        Matter.Body.setPosition(world.bodies[i], {
          x: random(100, width - 100),
          y: -(bound.max.y - bound.min.y),
        });
      }
    }
    pop();
  }
  Matter.Body.setPosition(mouse, { x: mouseX, y: mouseY });
  Matter.Engine.update(engine);
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
}
function windowResized() {
  resizeTheCanvas();
}
function doubleClicked() {
  console.log(selectedLink);
  switch (selectedLink) {
    case "generator":
      window.location.href = "./generator";
      break;
    case "collection":
      window.location.href = "./collection";
      break;
    case "introduction":
      window.location.href = "./introduction";
      break;
    case "manifesto":
      window.location.href = "./manifesto";
      break;
  }
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
  let pt = { x: random(100, width - 100), y: random(-100, -height * 1.5) };
  for (let i = 0; i < distinctPos.length; i++) {
    if (dist(pt.x, pt.y, distinctPos[i].x, distinctPos[i].y) < 200) {
      pt = getRandomPos();
      break;
    }
  }
  distinctPos.push(pt);
  return pt;
}
