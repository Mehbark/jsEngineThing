const leftKeys = { h: 0, a: 0 };
const downKeys = { j: 0, s: 0 };
const upKeys = { k: 0, w: 0 };
const rightKeys = { l: 0, d: 0 };
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
window.onload = function () {
  game.canvas = document.getElementById("main");
  game.ctx = game.canvas.getContext("2d");
  game.width = Math.floor(game.canvas.width / game.PIXEL);
  game.height = Math.floor(game.canvas.height / game.PIXEL);
  const gameWindow = document.getElementById("main");
  window.requestAnimationFrame(game.frame);
  window.addEventListener("keypress", (e) => {
    const k = e.key;
    if (k in leftKeys) {
      game.handleLeftPress();
    } else if (k in downKeys) {
      game.handleDownPress();
    } else if (k in upKeys) {
      game.handleUpPress();
    } else if (k in rightKeys) {
      game.handleRightPress();
    }
  });
};

class GameObject {
  constructor(id, updateFunc = pass, color = "#000", x = 0, y = 0) {
    this.id = id;
    this.updateFunc = updateFunc;
    this.color = color;
    this.x = x;
    this.y = y;
  }
}

class Controlled extends GameObject {
  constructor(
    updateFunc,
    leftPressFunc,
    downPressFunc,
    upPressFunc,
    rightPressFunc,
    id,
    color = "#000",
    x = 0,
    y = 0,
    buttonOneFunc = pass,
    buttonTwoFunc = pass
  ) {
    super(id, updateFunc, color, x, y);
    this.leftPressFunc = leftPressFunc;
    this.downPressFunc = downPressFunc;
    this.upPressFunc = upPressFunc;
    this.rightPressFunc = rightPressFunc;
    this.buttonOneFunc = buttonOneFunc;
    this.buttonTwoFunc = buttonTwoFunc;
  }
}

function pass() {
  return;
}

function moveLeft(gameObject) {
  if (gameObject.x - 1 >= 0) gameObject.x--;
}
function moveDown(gameObject) {
  if (
    gameObject.y + 1 < game.height &&
    game.isEmpty(gameObject.x, gameObject.y + 1)
  )
    gameObject.y++;
}

function randSandFall(gameObject) {
  if (game.isEmpty(gameObject.x, gameObject.y + 1)) {
    game.moveObject(gameObject, 0, 1);
  } else if (
    game.isEmpty(gameObject.x - 1, gameObject.y + 1) &&
    game.isEmpty(gameObject.x + 1, gameObject.y + 1)
  ) {
    if (getRandomIntInclusive(0, 1)) {
      game.moveObject(gameObject, -1, 1);
    } else {
      game.moveObject(gameObject, 1, 1);
    }
  } else if (game.isEmpty(gameObject.x - 1, gameObject.y + 1)) {
    game.moveObject(gameObject, -1, 1);
  } else if (game.isEmpty(gameObject.x + 1, gameObject.y + 1)) {
    game.moveObject(gameObject, 1, 1);
  }
}
function alternateSandFall(gameObject) {
  if (game.isEmpty(gameObject.x, gameObject.y + 1)) {
    game.moveObject(gameObject, 0, 1);
  } else if (
    game.isEmpty(gameObject.x - 1, gameObject.y + 1) &&
    game.isEmpty(gameObject.x + 1, gameObject.y + 1)
  ) {
    if (game.children[0].count % 2 === 0) {
      game.moveObject(gameObject, -1, 1);
    } else {
      game.moveObject(gameObject, 1, 1);
    }
  } else if (game.isEmpty(gameObject.x - 1, gameObject.y + 1)) {
    game.moveObject(gameObject, -1, 1);
  } else if (game.isEmpty(gameObject.x + 1, gameObject.y + 1)) {
    game.moveObject(gameObject, 1, 1);
  }
}
function sandFall(gameObject) {
  if (game.isEmpty(gameObject.x, gameObject.y + 1)) {
    game.moveObject(gameObject, 0, 1);
  } else if (game.isEmpty(gameObject.x - 1, gameObject.y + 1)) {
    game.moveObject(gameObject, -1, 1);
  } else if (game.isEmpty(gameObject.x + 1, gameObject.y + 1)) {
    game.moveObject(gameObject, 1, 1);
  } else {
    gameObject.updateFunc = undefined;
  }
}
function moveUp(gameObject) {
  if (gameObject.y - 1 >= 0) gameObject.y--;
}
function moveRight(gameObject) {
  if (gameObject.x + 1 < game.width) gameObject.x++;
}

let testObstacle = new GameObject(0, makeSand, "blue", -1, 0);
testObstacle.count = 0;
function makeSand(gameObject) {
  if (gameObject.count < 100000 && gameObject.count % 1 === 0) {
    game.addChild(
      new GameObject(
        1,
        sandFall,
        "hsl(" + gameObject.count / 100 + ", 100%, 50%)",
        50,
        0
      )
    );
  }
  gameObject.count++;
}

var game = {
  PIXEL: 2,
  width: undefined,
  height: undefined,
  canvas: undefined,
  ctx: undefined,
  children: [testObstacle],
  positions: {},
  addChild: function (gameObject) {
    game.children.push(gameObject);
    game.positions[`${gameObject.x} ${gameObject.y}`] = true;
  },
  moveObject: function (gameObject, moveX, moveY) {
    delete game.positions[`${gameObject.x} ${gameObject.y}`];
    gameObject.x += moveX;
    gameObject.y += moveY;
    game.positions[`${gameObject.x} ${gameObject.y}`] = gameObject.id;
  },
  drawPixel: function (x, y, color) {
    if (color !== undefined) this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.PIXEL, y * this.PIXEL, this.PIXEL, this.PIXEL);
  },
  runIfExists: function (func, arg) {
    if (func) func(arg);
  },
  frame: function () {
    game.ctx.fillStyle = "white";
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    for (let i = 0; i < game.children.length; i++) {
      let child = game.children[i];
      game.drawPixel(child.x, child.y, child.color);
      game.runIfExists(child.updateFunc, child);
    }
    window.requestAnimationFrame(game.frame);
  },
  isEmpty: function (x, y) {
    if (x >= game.width || x < 0 || y >= game.height || y < 0) return false;
    if (game.positions[`${x} ${y}`]) return false;
    return true;
  },
  handleLeftPress: function () {
    for (let i = 0; i < game.children.length; i++) {
      let child = game.children[i];
      game.runIfExists(child.leftPressFunc, child);
    }
  },
  handleDownPress: function () {
    for (let i = 0; i < game.children.length; i++) {
      let child = game.children[i];
      game.runIfExists(child.downPressFunc, child);
    }
  },
  handleUpPress: function () {
    for (let i = 0; i < game.children.length; i++) {
      let child = game.children[i];
      game.runIfExists(child.upPressFunc, child);
    }
  },
  handleRightPress: function () {
    for (let i = 0; i < game.children.length; i++) {
      let child = game.children[i];
      game.runIfExists(child.rightPressFunc, child);
    }
  },
  handleButtonOnePress: function () {
    for (let i = 0; i < game.children.length; i++) {
      let child = game.children[i];
      game.runIfExists(child.buttonePressFunc, child);
    }
  },
};
