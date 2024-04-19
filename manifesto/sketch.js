let imgs = [];
let walls = [];
let scaleFactor = 0.15; //scale down images
let selectedShape = -1;
let mouseConstraint;
let manifestoImgs;
function preload() {
  for (let i = 0; i < 6; i++) {
    imgs[i] = loadImage("assets/Manifesto_Letter_0" + (i + 1) + ".png");
  }
  imgs.push(loadImage("assets/Manifesto_Shape_01.png"));

  manifestoImgs = loadStrings("manifesto_images/file_list.txt");
}
function setup() {
  createCanvas(800, 800).parent(select(".canvas-container"));
  imageMode(CENTER);

  engine = Matter.Engine.create();
  engine.world.gravity.y = 2;
  world = engine.world;
  //scale down
  distinctPos = [];
  for (let img of imgs) {
    // img.resize(img.width * scaleFactor, img.height * scaleFactor);
    //
    let points = [];
    img.loadPixels();
    let index;

    for (let x = 0; x < img.width; x += 10) {
      for (let y = 0; y < img.height; y += 10) {
        index = (x + y * img.width) * 4;
        if (img.pixels[index + 3] != 0 && img.pixels[index + 3] != 255) {
          points.push({ x, y });
        }
      }
    }
    img.points = convexHull(points);
    let pt = getRandomPos();
    img.body = Matter.Bodies.fromVertices(pt.x, pt.y, img.points);
    img.scale = scaleFactor;
    Matter.Body.scale(img.body, scaleFactor, scaleFactor);
    Matter.World.add(world, img.body);
  }

  //add walls
  options = { isStatic: true, label: "wall" };
  walls[0] = Matter.Bodies.rectangle(width / 2, height + 20, 2000, 40, options);
  walls[1] = Matter.Bodies.rectangle(-20, height / 2, 40, 2000, options);
  walls[2] = Matter.Bodies.rectangle(width + 20, height / 2, 40, 2000, options);
  Matter.World.add(world, walls);
  mouse = Matter.Bodies.circle(0, 0, 0, { isStatic: true });
  Matter.World.add(world, mouse);
  resizeTheCanvas();

  colorPair = new ColorPair();

  //add manifestor image on html
  let div_ = createElement("div").class("image-wrapper").id("svg-text");
  let img = createElement("img");
  div_.child(img);
  img.elt.src = "assets/Asset 199.svg";
  select("#image-container").child(div_);
  let arr = shuffle(manifestoImgs);
  for (let i = 0; i < arr.length; i++) {
    div_ = createElement("div").class("image-wrapper");
    img = createElement("img");
    div_.child(img);
    img.elt.src = "manifesto_images/" + arr[i];
    select("#image-container").child(div_);
  }
}

function draw() {
  clear();
  colorPair.apply();

  for (let imgI = 0; imgI < imgs.length; imgI++) {
    push();
    translate(imgs[imgI].body.position.x, imgs[imgI].body.position.y);
    rotate(imgs[imgI].body.angle);
    scale(imgs[imgI].scale);
    image(imgs[imgI], 0, 0);
    pop();

    strokeWeight(2);
    noFill();
    stroke(0, 0);
    beginShape();
    for (let v of imgs[imgI].body.vertices) {
      vertex(v.x, v.y);
    }
    endShape();
    //falling off the screen?
    let bound = imgs[imgI].body.bounds;
    if (bound.min.y > height) {
      Matter.Body.setPosition(imgs[imgI].body, {
        x: random(100, width - 100),
        y: -(bound.max.y - bound.min.y),
      });
    }
    //mouse constraint
    if (selectedShape == -1) {
      if (mouseIsPressed) {
        if (
          mouseX > bound.min.x &&
          mouseX < bound.max.x &&
          mouseY > bound.min.y &&
          mouseY < bound.max.y
        ) {
          selectedShape = imgI;
          mouseConstraint = Matter.Constraint.create({
            bodyA: mouse,
            bodyB: imgs[imgI].body,
          });
          Matter.World.add(world, mouseConstraint);
        }
      }
    } else {
      if (!mouseIsPressed) {
        selectedShape = -1;
        Matter.World.remove(world, mouseConstraint);
      }
    }
  }

  imgI = floor(frameCount / 60) % imgs.length;
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
  //reposition walls
  let div = select("#marquee");
  let h_ = map(div.height, 0, windowHeight, 0, newHeight);
  if (walls.length != 0) {
    Matter.Body.setPosition(walls[0], { x: width / 2, y: height + 20 - h_ });
    Matter.Body.setPosition(walls[1], { x: -20, y: height / 2 });
    Matter.Body.setPosition(walls[2], { x: width + 20, y: height / 2 });
  }
}
function windowResized() {
  resizeTheCanvas();
}

function convexHull(points) {
  let hull = [];

  // Find the point with the lowest y-coordinate (and the leftmost one if there are ties)
  let startPoint = points[0];
  for (let i = 1; i < points.length; i++) {
    if (
      points[i].y < startPoint.y ||
      (points[i].y === startPoint.y && points[i].x < startPoint.x)
    ) {
      startPoint = points[i];
    }
  }

  let currentPoint = startPoint;
  let nextPoint;
  do {
    hull.push(currentPoint);
    nextPoint = points[0];
    for (let i = 1; i < points.length; i++) {
      if (
        nextPoint === currentPoint ||
        orientation(currentPoint, points[i], nextPoint) === 2
      ) {
        nextPoint = points[i];
      }
    }
    currentPoint = nextPoint;
  } while (currentPoint !== startPoint);

  return hull;
}

function orientation(p, q, r) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0; // colinear
  return val > 0 ? 1 : 2; // clockwise or counterclockwise
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

