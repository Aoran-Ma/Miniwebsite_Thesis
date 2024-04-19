let { Body, Engine, World, Bodies } = Matter;

let fonts = [];
let selectedFont = 2;

let text_size;
let text_gap;
let txt;

let started = false;
let startBodiesSetup = false;

let mouseConstraint;
let mouse;
let selectedShape;

let selectedColor = "";
let backColor = "#ffffff";
let fillColor = "#000000";
let paradeOutLines = [
  "#FF0018",
  "#FFA52C",
  "#FFFF41",
  "#008018",
  "#0000F9",
  "#86007D",
];
let paradeOn = 0;
let fragmentsOn = false;

let imgs = [];
let offSet = [];
let imgsToDraw = [];
let scaleFactor = 0.075;
let addingFragment = false;
let lastImgLength = 0;

function preload() {
  fonts[0] = loadFont("fonts/Font01-SenseOfFail.otf");
  fonts[1] = loadFont("fonts/Font02-Pricks.otf");
  fonts[2] = loadFont("fonts/Font03-WorstFontList.otf");

  for (let i = 0; i < 12; i++) {
    imgs[i] = loadImage("assets/asset" + (i + 1) + ".png");
  }
}
function setup() {
  createCanvas(600, 600).parent("canvas-container");
  colorPair = new ColorPair();
  // windowResized();

  engine = Engine.create();
  world = engine.world;
  textBox = select("#text-input");

  textAlign(CENTER, CENTER);
  lsSlider = createSlider(12, 120, 120, 1).hide();

  //Events
  select("#enter-button").mouseClicked(() => {
    if (!started && !startBodiesSetup) startBodiesSetup = true;
  });
  select("#reset-button").mouseClicked(() => {
    imgsToDraw = [];
    backColor = "#ffffff";
    fillColor = "#000000";
    started = false;
    startBodiesSetup = false;
    for (let i = 0; i < world.bodies.length; i++) {
      World.remove(world, world.bodies[i]);
      i--;
      textBox.value("");
    }
  });
  select("#font-1").mousePressed(() => {
    selectedFont = 0;
  });
  select("#font-2").mousePressed(() => {
    selectedFont = 1;
  });
  select("#font-3").mousePressed(() => {
    selectedFont = 2;
  });

  let colors = selectAll(".color");

  for (let i = 0; i < colors.length; i++) {
    colors[i].mouseClicked(() => {
      if (selectedColor.length > 0) {
        select("#" + selectedColor).style("border", "none");
      }
      selectedColor = colors[i].id();
    });
  }
  select("#fill_button").mouseClicked(() => {
    if (selectedColor.length > 0) {
      select("#" + selectedColor).style("border", "none");
      fillColor = select("#" + selectedColor).value();
      selectedColor = "";
    }
  });
  select("#back_button").mouseClicked(() => {
    if (selectedColor.length > 0) {
      select("#" + selectedColor).style("border", "none");
      backColor = select("#" + selectedColor).value();
      selectedColor = "";
    }
  });
  select("#parade").mouseClicked(() => {
    paradeOn += 1;
    if (paradeOn > 2) {
      paradeOn = 0;
    }
  });
  select("#save_still").mouseClicked(() => {
    save(txt);
  });
  select("#save_gif").mouseClicked(() => {
    if (txt.length > 0) {
      saveGif("txt", 1.5);
      let tx = txt;

      //reset
      started = false;
      startBodiesSetup = false;
      for (let i = 0; i < world.bodies.length; i++) {
        if (!world.bodies[i].type_) {
          World.remove(world, world.bodies[i]);
          i--;
        } else {
          Body.setPosition(world.bodies[i], {
            x: random(150, width - 150),
            y: -200,
          });
        }
      }
      textBox.value("");

      textBox.value(tx);
      //
      // if (distinctPos.length > 0) {
      //   addFragment();
      // }

      //add
      startBodiesSetup = true;
    }
  });
  select("#fragments_btn").mouseClicked(() => {
    // fragmentsOn = !fragmentsOn;
    // if (fragmentsOn) {
    if (!addingFragment) {
      addingFragment = true;
      lastImgLength = imgsToDraw.length;
      addFragment();
    }
    // } else {
    //   for (let i = 0; i < world.bodies.length; i++) {
    //     if (world.bodies[i].type_) {
    //       World.remove(world, world.bodies[i]);
    //       i--;
    //     }
    //   }
    // }
  });

  mouse = Matter.Bodies.circle(0, 0, 0, { isStatic: true, label: "" });
  Matter.World.add(world, mouse);
}

function draw() {
  colorPair.apply();
  background(backColor);
  if (selectedColor.length > 0) {
    select("#" + selectedColor).style("border", "2px solid black");
    select("#" + selectedColor).style("border-radius", "50px ");
  }

  switch (started) {
    case false:
      textFont(fonts[selectedFont]);
      text_size = lsSlider.value();
      text_gap = lsSlider.value();
      textSize(text_size);
      textLeading(text_gap);
      txt = textBox.value();
      // fill(fillColor, 100);
      text(txt, width / 2, height / 2);

      let tx = txt.split("\n");
      let physicalEntityData = [];
      for (let i = 0; i < tx.length; i++) {
        let x = width / 2;
        let g = ((tx.length - 1) * text_gap) / 2;
        let y = map(i, 0, tx.length - 1, height / 2 - g, height / 2 + g);
        if (isNaN(y)) y = height / 2;
        // circle(x, y, 10);
        let w = 0;

        let chars = {};
        for (let j = 0; j < tx[i].length; j++) {
          let ch = tx[i][j];
          let characterWidth = textWidth(ch);
          let characterHeight = textAscent() + textDescent();
          chars[ch] = { w: characterWidth, h: characterHeight };
          w += characterWidth;
        }
        if (w > 300 || txt.length == 0) {
          lsSlider.value(
            lerp(lsSlider.value(), floor(map(w, 400, 600, 120, 10)), 0.05)
          );
        }
        // fill(fillColor, 100);
        // rect(x - w / 2, y, w, 20);
        // console.log(chars, x - w / 2, x - w / 2 + w);

        let x1 = x - w / 2;

        for (let k = 0; k < tx[i].length; k++) {
          // fill(200, 100, 100, 100);
          // circle(x1 + chars[tx[i][k]].w / 2, y, 10);
          // rect(x1, y - text_size / 2, chars[tx[i][k]].w, text_size);
          physicalEntityData.push({
            ch: tx[i][k],
            x: x1 + chars[tx[i][k]].w / 2,
            y: y,
            w: chars[tx[i][k]].w,
            h: text_size,
          });

          //parade
          if (paradeOn) {
            if (paradeOn == 1) {
              let arr = fonts[selectedFont].textToPoints(
                tx[i][k],
                x1,
                y + text_size / 2,
                text_size,
                {
                  sampleFactor: 0.25,
                  simplifyThreshold: 0,
                }
              );
              for (
                let l = paradeOutLines.length + frameCount - 1;
                l > frameCount - 1;
                l--
              ) {
                fill(paradeOutLines[l % paradeOutLines.length]);
                randomSeed(l - frameCount);

                text(tx[i][k], x1 + chars[tx[i][k]].w / 2, y);
                for (let pt of arr) {
                  fill(random(paradeOutLines));
                  noStroke();
                  let t =
                    frameCount +
                    (l - frameCount) * (60 / paradeOutLines.length);
                  ellipse(pt.x, pt.y, (sin(t / 60) * text_size) / 6);
                }
              }
            } else {
              let arr = fonts[selectedFont].textToPoints(
                tx[i][k],
                x1,
                y + text_size / 2,
                text_size,
                {
                  sampleFactor: 0.25,
                  simplifyThreshold: 0,
                }
              );
              let index = 0;

              for (
                let l = paradeOutLines.length + frameCount - 1;
                l > frameCount - 1;
                l--
              ) {
                fill(paradeOutLines[l % paradeOutLines.length]);
                // randomSeed(l - frameCount);
                for (let pt of arr) {
                  // fill(random(paradeOutLines));
                  noStroke();

                  let t = frameCount + index * 2000;

                  let ptSize = (text_size / 4) * sin(t * 0.025);
                  fill(paradeOutLines[index]);
                  // let t =
                  //   frameCount + (l - frameCount) * (60 / paradeOutLines.length);
                  ellipse(pt.x, pt.y, ptSize);
                }
                index++;
              }
            }
          }

          //
          noStroke();

          fill(fillColor);
          text(tx[i][k], x1 + chars[tx[i][k]].w / 2, y);

          x1 += chars[tx[i][k]].w;
        }
      }
      if (startBodiesSetup) {
        startBodiesSetup = false;
        // console.log(physicalEntityData);
        let bodies = [];

        // console.log(physicalEntityData);
        let words = [];
        let arr = [];
        let prevK;
        for (let k of physicalEntityData) {
          // let b = Bodies.rectangle(k.x, k.y, k.w, k.h * 0.7, {
          //   restitution: 0.8,
          //   label: k.ch,
          //   H: k.h,
          //   W: k.w,
          // });
          // // console.log(k.x, k.y,k.v);
          // bodies.push(b);
          let br = false;
          if (prevK) {
            if (prevK.y != k.y) br = true;
          }
          if (k.ch == " " || br) {
            if (arr.length > 0) words.push(arr);
            arr = [];
            if (!br) continue;
          }
          arr.push(k);
          prevK = k;
        }
        if (arr.length > 0) words.push(arr);

        for (let i = 0; i < words.length; i++) {
          let x = words[i][0].x;
          let y = words[i][0].y;
          let w = 0;
          let h = -100;
          let tx = "";
          for (let j = 0; j < words[i].length; j++) {
            w += words[i][j].w;
            if (words[i][j].h > h) {
              h = words[i][j].h;
            }
            tx += words[i][j].ch;
          }
          let b = Bodies.rectangle(x, y, w, h * 0.8, {
            restitution: 0.8,
            label: tx,
            h: h,
            w: w,
          });
          bodies.push(b);
        }

        // let constraints = [];
        // for (let i = 0; i < bodies.length - 1; i++) {
        //   let b1 = bodies[i];
        //   let b2 = bodies[i + 1];
        //   if (b1.label != " " && b2.label != " ") {
        //     constraint = Matter.Constraint.create({
        //       bodyA: b1,
        //       bodyB: b2,
        //       length: dist(
        //         b1.position.x,
        //         b1.position.y,
        //         b2.position.x,
        //         b2.position.y
        //       ), // Length of the constraint
        //       stiffness: 1,
        //     });
        //     constraints.push(constraint);
        //   }
        // }
        // if(constraints.length>0){
        //   World.add(world, constraints);
        // }
        // console.log(bodies);

        if (bodies.length > 0) {
          World.add(world, bodies);
          started = true;
        }
        //walls
        let walls = [];
        walls[0] = Bodies.rectangle(width / 2, height + 15, width * 2, 30, {
          isStatic: true,
          label: "",
        });
        walls[1] = Bodies.rectangle(-15, height / 2, 30, height * 2, {
          isStatic: true,
          label: "",
        });
        walls[2] = Bodies.rectangle(width + 15, height / 2, 30, height * 2, {
          isStatic: true,
          label: "",
        });
        World.add(world, walls);
      }

      break;
    case true:
      fill(200, 100, 100, 100);
      for (let body of world.bodies) {
        // beginShape();
        // for (let v of body.vertices) {
        //   vertex(v.x, v.y);
        // }
        // endShape();
        let bound = body.bounds;

        if (body.label == "" && !body.type_) {
        } else {
          push();
          translate(body.position.x, body.position.y);
          rotate(body.angle);
          push();

          imageMode(CENTER);
          if (body.img) {
            scale(0.15);
            scale(0.5);
            image(body.img, body.offset.x / 0.15 / 2, body.offset.y / 0.15 / 2);
          }
          pop();

          push();
          translate(0, -body.h * 0.1);

          fill(20, 100);

          text(body.label, 0, 0);

          //parade
          if (paradeOn) {
            push();

            if (paradeOn == 1) {
              translate(-body.position.x - body.w / 2, -body.position.y);
              let arr = fonts[selectedFont].textToPoints(
                body.label,
                body.position.x,
                body.position.y + text_size / 2,
                text_size,
                {
                  sampleFactor: 0.25,
                  simplifyThreshold: 0,
                }
              );
              for (
                let l = paradeOutLines.length + frameCount - 1;
                l > frameCount - 1;
                l--
              ) {
                fill(paradeOutLines[l % paradeOutLines.length]);
                randomSeed(l - frameCount);

                for (let pt of arr) {
                  fill(random(paradeOutLines));
                  noStroke();
                  let t =
                    frameCount +
                    (l - frameCount) * (60 / paradeOutLines.length);
                  ellipse(pt.x, pt.y, (sin(t / 60) * text_size) / 6);
                }
              }
            } else {
              translate(-body.position.x - body.w / 2, -body.position.y);

              let arr = fonts[selectedFont].textToPoints(
                body.label,
                body.position.x,
                body.position.y + text_size / 2,
                text_size,
                {
                  sampleFactor: 0.25,
                  simplifyThreshold: 0,
                }
              );
              let index = 0;

              for (
                let l = paradeOutLines.length + frameCount - 1;
                l > frameCount - 1;
                l--
              ) {
                fill(paradeOutLines[l % paradeOutLines.length]);
                // randomSeed(l - frameCount);
                for (let pt of arr) {
                  // fill(random(paradeOutLines));
                  noStroke();

                  let t = frameCount + index * 2000;

                  let ptSize = (text_size / 4) * sin(t * 0.025);
                  fill(paradeOutLines[index]);
                  // let t =
                  //   frameCount + (l - frameCount) * (60 / paradeOutLines.length);
                  ellipse(pt.x, pt.y, ptSize);
                }
                index++;
              }
            }
            pop();
          }
          //
          fill(fillColor);

          text(body.label, 0, 0);
          pop();
          pop();
          if (bound.min.y > height) {
            Matter.Body.setPosition(body, {
              x: random(100, width - 100),
              y: -(bound.max.y - bound.min.y),
            });
          }
        }

        if (!selectedShape) {
          if (mouseIsPressed) {
            if (
              mouseX > bound.min.x &&
              mouseX < bound.max.x &&
              mouseY > bound.min.y &&
              mouseY < bound.max.y
            ) {
              selectedShape = body;
              mouseConstraint = Matter.Constraint.create({
                bodyA: mouse,
                bodyB: body,
              });
              Matter.World.add(world, mouseConstraint);
            }
          }
        } else {
          if (!mouseIsPressed) {
            selectedShape = undefined;
            Matter.World.remove(world, mouseConstraint);
          }
        }
      }

      for (let imgI = 0; imgI < imgsToDraw.length; imgI++) {
        push();
        imageMode(CENTER);
        translate(
          imgsToDraw[imgI].body.position.x,
          imgsToDraw[imgI].body.position.y
        );
        rotate(imgsToDraw[imgI].body.angle);
        scale(imgsToDraw[imgI].scale);
        image(imgsToDraw[imgI], 0, 0);
        pop();

        // strokeWeight(2);
        // noFill();
        // stroke(0, 50);
        // beginShape();
        // for (let v of imgsToDraw[imgI].body.vertices) {
        //   vertex(v.x, v.y);
        // }
        // endShape();
        // //falling off the screen?
        let bound = imgsToDraw[imgI].body.bounds;
        if (bound.min.y > height) {
          Matter.Body.setPosition(imgsToDraw[imgI].body, {
            x: random(100, width - 100),
            y: -(bound.max.y - bound.min.y),
          });
        }
        // //mouse constraint
        // if (selectedShape == -1) {
        //   if (mouseIsPressed) {
        //     if (
        //       mouseX > bound.min.x &&
        //       mouseX < bound.max.x &&
        //       mouseY > bound.min.y &&
        //       mouseY < bound.max.y
        //     ) {
        //       selectedShape = imgI;
        //       mouseConstraint = Matter.Constraint.create({
        //         bodyA: mouse,
        //         bodyB: imgsToDraw[imgI].body,
        //       });
        //       Matter.World.add(world, mouseConstraint);
        //     }
        //   }
        // } else {
        //   if (!mouseIsPressed) {
        //     selectedShape = -1;
        //     Matter.World.remove(world, mouseConstraint);
        //   }
        // }
      }
      if (addingFragment) {
        // console.log("ayp");
        if (imgsToDraw.length != lastImgLength) {
          addingFragment = false;
        }
      }

      Engine.update(engine);
      Matter.Body.setPosition(mouse, { x: mouseX, y: mouseY });
      Matter.Engine.update(engine);
  }
}
// function windowResized() {
//   let bigDiv = select("#canvas-container");
//   let w = min(bigDiv.width, bigDiv.height);
//   select("#canvasDiv").style("width", w + "px");
// }

function getRandomPos() {
  let pt = { x: random(100, width - 100), y: random(-100, -height * 3) };
  return pt;
}
function addFragment() {
  if (!started) return;
  options = { restitution: 0.5, frictionAir: 0, label: "" };
  // if (random(1) < 0.5) {
  // let offSet1 = [];
  // let arr = [3, 4, 7, 8, 9, 10, 11, 12, 13];
  // let i = random(arr);
  // let pt = getRandomPos();
  // let verts = vertices[i];
  // let b = Matter.Bodies.fromVertices(pt.x, pt.y, verts, options);
  // b.offset = offSet[i];
  // b.img = imgs[i];
  // b.label = "";
  // b.type_ = "frag";
  // Body.scale(b, 0.5, 0.5);
  // Matter.World.add(world, b);

  // for (let img of imgs) {

  let img = random(imgs).get();
  // img.resize(img.width * scaleFactor, img.height * scaleFactor);
  //
  let points = [];
  img.loadPixels();
  let index;

  for (let x = 0; x < img.width; x += 1) {
    for (let y = 0; y < img.height; y += 1) {
      index = (x + y * img.width) * 4;
      if (img.pixels[index + 3] != 0 && img.pixels[index + 3] != 255) {
        points.push({ x, y });
      }
    }
  }
  img.points = convexHull(points);
  let pt = getRandomPos();
  img.body = Matter.Bodies.fromVertices(pt.x, pt.y, img.points, options);
  img.body.type_ = "frag";
  img.scale = scaleFactor;
  Matter.Body.scale(img.body, scaleFactor, scaleFactor);
  Matter.World.add(world, img.body);
  imgsToDraw.push(img);
  // }

  // }
  // else {
  //   console.log("from home");
  //   let i = floor(random(9));
  //   let ob = shapesFromHome[i];
  //   let pt = getRandomPos();
  //   let b = Matter.Bodies.fromVertices(pt.x, pt.y, ob.verts, options);
  //   b.offset = ob.offset;
  //   b.img = ob.img;
  //   b.type_ = "frag";
  //   b.label = "";
  //   Body.scale(b, 0.5, 0.5);
  //   Matter.World.add(world, b);
  // }
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
