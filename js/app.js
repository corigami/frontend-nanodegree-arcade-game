/*jslint sloppy: true, vars: true*/
//defines game parameters.  Allows for gameboard size to be upgraded in future versions.
var GameBoard = function (rows, cols, enemyStart, enemyStop) {
    this.rows = rows;
    this.cols = cols;
    this.enemyStartRow = enemyStart;
    this.enemyEndRow = enemyStop;
    this.numEnemies = 3;
    this.numObstacles = 0;

    //the map is used to make checking or objects at certain positions rather than checking for collisions.  Can be used to store gem locations in future versions as well.
    var map = [],
        row;
    for (row = 0; row < rows; row += 1) {
        map[row] = [];
        var col;
        for (col = 0; col < cols; col += 1) {
            map[row][col] = ' ';
        }
    }
    this.map = map;
};

//Base game object.  All other objects extend this functionality if needed.
var GameObject = function () {
    this.sprite = '';
    this.x = 0;
    this.y = 0;
    this.row = 0;
    this.col = 0;
    this.blocking = false;

};
GameObject.prototype = Object.create(GameObject.prototype);

// Draw the obstacle on the screen, required method for game
GameObject.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Enemies our player must avoid
var Enemy = function () {
    GameObject.call(this);
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.speed = 0;
    this.speedMulti = 1;
};
Enemy.prototype = Object.create(Enemy.prototype);

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    //check to see if enemy is on screen, if not, reset it's location
    if (this.x < canvas.width) {
        this.x = this.x + this.speed * dt;
    } else {
        this.x = 0;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player, our Hero
var Player = function () {
    GameObject.call(this);
    this.sprite = 'images/char-boy.png';
    this.score = 0;
    this.level = 0;
};
Player.prototype = Object.create(Player.prototype);

Player.prototype.update = function (dt) {
    //check for collision
    var i;
    for (i = 0; i < allEnemies.length; i += 1) {
        //check for collision with left edge of player
        if (player.row === allEnemies[i].row) {
            if (allEnemies[i].x <= player.x + 20 && allEnemies[i].x + 100 >= player.x + 20) {
                resetLevel();
                //check for collision with right edge of player
            } else if (allEnemies[i].x <= player.x + 80 && allEnemies[i].x + 100 >= player.x + 80) {
                resetLevel();
            }
        }
    }
    this.x = this.col * 101;
    this.y = this.row * 83 - 15;
};

// Draw the enemy on the screen, required method for game
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    var level = 'Level: ' + this.level;
    var score = 'Score: ' + this.score;
    ctx.textAlign = "left";
    ctx.fillText(score, 10, 100);
    ctx.strokeText(score, 10, 100);
    ctx.textAlign = "right";
    ctx.fillText(level, canvas.width - 10, 100);
    ctx.strokeText(level, canvas.width - 10, 100);
};

//handle input from user and check that move is valid
Player.prototype.handleInput = function (input) {

    switch (input) {
    case 'up':
        if (this.row > 0 && moveBlocked(input)) {
            this.row -= 1;
        }
        break;
    case 'down':
        if (this.row < board.rows - 1 && moveBlocked(input)) {
            this.row += 1;
        }
        break;
    case 'left':
        if (this.col > 0 && moveBlocked(input)) {
            this.col -= 1;
        }
        break;
    case 'right':
        if (this.col < board.cols - 1 && moveBlocked(input)) {
            this.col += 1;
        }
        break;
    }
    if (this.row === 0) {
        //you win!
        updateLevel();
    }
};

//Function to check to see if a obstacle is in the way.
var moveBlocked = function (direction) {
    switch (direction) {
    case 'up':
        if (board.map[player.row - 1][player.col] === 'r') {
            return false;
        }
        break;
    case 'down':
        if (board.map[player.row + 1][player.col] === 'r') {
            return false;
        }
        break;
    case 'left':
        if (board.map[player.row][player.col - 1] === 'r') {
            return false;
        }
        break;
    case 'right':
        if (board.map[player.row][player.col + 1] === 'r') {
            return false;
        }
        break;
    }
    return true;
};

//updates level to increase difficulty
var updateLevel = function () {
    var row;
    for (row = 0; row < board.rows; row += 1) {
        var col;
        for (col = 0; col < board.cols; col += 1) {
            board.map[row][col] = ' ';
        }
    }
    player.level += 1;
    player.col = Math.floor(board.cols / 2);
    player.row = board.rows - 1;
    player.score = player.score + 100;
    //update speed 
    var i;
    for (i = 0; i < allEnemies.length; i += 1) {
        allEnemies[i].speed = allEnemies[i].speed + allEnemies[i].speed * 0.1;
    }

    generateEnemies();
    generateObstacles(board.numObstacles);
};

//resets level after player is hit by enemy
var resetLevel = function () {
    var row;
    for (row = 0; row < board.rows; row += 1) {
        var col;
        for (col = 0; col < board.cols; col += 1) {
            board.map[row][col] = ' ';
        }
    }
    var i;
    for (i = 0; i < allEnemies.length; i += 1) {
        allEnemies[i].speed = 20 + i * 20;
    }

    generateEnemies(3, 1, 3);
    board.numObstacles = 3;

    generateObstacles(board.numObstacles);
    player.col = Math.floor(board.cols / 2);
    player.row = board.rows - 1;
    player.score = 0;
    player.level = 1;
};

// Enemy spawner.  Places enemies on a random row based on 
function generateEnemies() {
    var i;
    for (i = 0; i < board.numEnemies; i += 1) {
        //select a random row from a continuous block (future support of larger map
        var randomVal = getRandomInt(board.enemyStartRow, board.enemyEndRow);
            //check to see if we already have an enemy instance
        var isEnemy = allEnemies[i] instanceof Enemy;
        if (!isEnemy) {
            allEnemies[i] = new Enemy();
            allEnemies[i].speed = 20 + i * 20;
        }

        allEnemies[i].y = 83 * randomVal - 20;
        allEnemies[i].row = randomVal;
    }
}

function generateObstacles(numObstacles) {
    var d = new Date(),
        i;
    for (i = 0; i < numObstacles; i += 1) {
        var isObstacle = allObstacles[i] instanceof GameObject;
        if (!isObstacle) {
            var rock = new GameObject();
            allObstacles[i] = rock;
            allObstacles[i].sprite = 'images/Rock.png';
        }
        var locSet = true;
        do {
            var col = 0;
            var row = 0;
            col = getRandomInt(0, board.cols - 1);
            row = getRandomInt(1, board.rows - 2);
            if (board.map[row][col] === 'r') {
                locSet = false;
            } else {
                allObstacles[i].col = col;
                allObstacles[i].row = row;
                allObstacles[i].x = allObstacles[i].col * 101;
                allObstacles[i].y = allObstacles[i].row * 83 - 15;
                board.map[row][col] = 'r';
                locSet = true;
            }
        } while (!locSet);

    }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

var getRandomInt = function (low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
};


//create our game objects
var board = new GameBoard(6, 5, 1, 3),
    allObstacles = [],
    allEnemies = [],
    player = new Player();




