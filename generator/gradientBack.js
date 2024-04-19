

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

    let backDiv = select("#wrappper");
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