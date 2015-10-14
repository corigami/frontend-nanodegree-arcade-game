/*jslint vars: true, white: true*/

/**
 * @description - represents current state of game area
 * @constructor
 * @param {number} rows - number of rows in the current game
 * @param {number} cols -  number of columns in the current game
 * @param {number} enemyStart - starting location of possible enemy placements (row)
 * @param {number} enemyStop - ending location of possible enemy placements (row)
 * TODO: add functionality to dynamically change number of enemies on the board
 */
var GameBoard = function (rows, cols, enemyStart, enemyStop) {
    'use strict';
    this.rows = rows;
    this.cols = cols;
    this.enemyStartRow = enemyStart;
    this.enemyEndRow = enemyStop;
    this.numEnemies = 3;
    this.numObstacles = 0;
    this.allEnemies = [];
    this.allObstacles = [];
    this.player = new Player();

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
GameBoard.prototype = Object.create(GameBoard.prototype);

/**
 * @description - updates level to increase difficulty
 */
GameBoard.prototype.updateLevel = function () {
    'use strict';
    //clear map
    var row;
    for (row = 0; row < this.rows; row += 1) {
        var col;
        for (col = 0; col < this.cols; col += 1) {
            this.map[row][col] = ' ';
        }
    }
    this.player.level += 1;
    this.player.col = Math.floor(this.cols / 2);
    this.player.row = this.rows - 1;
    this.player.score = this.player.score + 100;
    //update speed of enemies
    var i;
    for (i = 0; i < this.allEnemies.length; i += 1) {
        this.allEnemies[i].speed = this.allEnemies[i].speed + this.allEnemies[i].speed * 0.1;
    }

    this.generateEnemies();
    this.generateObstacles(this.numObstacles);
};

/**
 * @description - resets level after player is hit by enemy
 * TODO: update to use non-static enemy and obstacle numbers
 */
GameBoard.prototype.resetLevel = function () {
    'use strict';
    //clear map
    var row;
    for (row = 0; row < this.rows; row += 1) {
        var col;
        for (col = 0; col < this.cols; col += 1) {
            this.map[row][col] = ' ';
        }
    }
    //reset enemy speed
    var i;
    for (i = 0; i < this.allEnemies.length; i += 1) {
        this.allEnemies[i].speed = 20 + i * 20;
    }
    this.numObstacles = 3;
    this.player.reset();

    this.generateEnemies(this.numEnemies, this.enemyStartRow, this.enemyEndRow);
    this.generateObstacles();
};

/**
 * @description -  Enemy spawner.  Places enemies on a random row
 */
GameBoard.prototype.generateEnemies = function () {
    'use strict';
    var i;
    for (i = 0; i < this.numEnemies; i += 1) {
        //select a random row from a continuous block (future support of larger map)
        var randomVal = getRandomRow(this.enemyStartRow, this.enemyEndRow);
        //check to see if we already have an enemy instance
        var isEnemy = this.allEnemies[i] instanceof Enemy;
        if (!isEnemy) {
            this.allEnemies[i] = new Enemy();
            this.allEnemies[i].speed = 20 + i * 20;
        }
        this.allEnemies[i].y = 83 * randomVal - 20;
        this.allEnemies[i].row = randomVal;
    }
};

/**
 * @description -  Obstacle spawner.  Places obstacles in random locations
 * @param {number} numObstacles - how many obstacles to create
 */
GameBoard.prototype.generateObstacles = function () {
    'use strict';
    var i;
    for (i = 0; i < this.numObstacles; i += 1) {
        //check to see if we have an obstacle to reuse
        var isObstacle = this.allObstacles[i] instanceof GameObject;
        if (!isObstacle) {
            var rock = new GameObject();
            this.allObstacles[i] = rock;
            this.allObstacles[i].sprite = 'images/Rock.png';
        }
        var locSet = true;

        //make sure we don't put an obstacle over another 
        do {
            var col = 0;
            var row = 0;
            col = getRandomRow(0, board.cols - 1);
            row = getRandomRow(1, board.rows - 2);
            if (board.map[row][col] === 'r') {
                locSet = false;
            } else {
                this.allObstacles[i].col = col;
                this.allObstacles[i].row = row;
                this.allObstacles[i].x = this.allObstacles[i].col * 101;
                this.allObstacles[i].y = this.allObstacles[i].row * 83 - 15;
                this.map[row][col] = 'r';
                locSet = true;
            }
        } while (!locSet);

    }
};


/**
 * @description - represents base game object.  Will be extended by other game objects as needed.
 */
var GameObject = function () {
    'use strict';
    this.sprite = '';
    this.x = 0;
    this.y = 0;
    this.row = 0;
    this.col = 0;
    this.blocking = false;

};
GameObject.prototype = Object.create(GameObject.prototype);

/**
 * @description - Draw the obstacle on the screen, required method for game
 */
GameObject.prototype.render = function () {
    'use strict';
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description - represents enemy game object. 
 * @constructor
 */
var Enemy = function () {
    'use strict';
    GameObject.call(this);
    this.sprite = 'images/enemy-bug.png';
    this.speed = 0;
    this.speedMulti = 1;
};
Enemy.prototype = Object.create(Enemy.prototype);

/**
 * @description - Update the enemy's position, required method for game
 * @param {number} dt - a time delta between ticks
 */
Enemy.prototype.update = function (dt) {
    'use strict';
    //check to see if enemy is on screen, if not, reset it's location
    if (this.x < canvas.width) {
        this.x = this.x + this.speed * dt;
    } else {
        this.x = 0;
    }
};

/**
 * @description - Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function () {
    'use strict';
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description - represents player game object.
 * @constructor
 */
var Player = function () {
    'use strict';
    GameObject.call(this);
    this.sprite = 'images/char-boy.png';
    this.score = 0;
    this.level = 0;
};
Player.prototype = Object.create(Player.prototype);

/**
 * @description - Update the players's position, required method for game
 * @param {number} dt - a time delta between ticks (not currently used)
 */
Player.prototype.update = function (dt) {
    'use strict';
    //check for collision - since we don't want to rely on rows for enemy collisions (due to alpha transparency in sprite)
    //TODO: add offset values to enemy objects to be stored as part of the object instead of using static values
    var i;
    for (i = 0; i < board.allEnemies.length; i += 1) {
        //check for collision with left edge of player
        if (this.row === board.allEnemies[i].row) {
            if (board.allEnemies[i].x <= this.x + 20 && board.allEnemies[i].x + 100 >= this.x + 20) {
                board.resetLevel();
                //check for collision with right edge of player
            } else if (board.allEnemies[i].x <= this.x + 80 && board.allEnemies[i].x + 100 >= this.x + 80) {
                boar.resetLevel();
            }
        }
    }
    this.x = this.col * 101;
    this.y = this.row * 83 - 15;
};

/**
 * @description - Resets the player
 */
Player.prototype.reset = function () {
    'use strict';
    this.col = Math.floor(board.cols / 2);
    this.row = board.rows - 1;
    this.score = 0;
    this.level = 1;
};

/**
 * @description - Draw the player and on the screen, required method for game. Also renders score and level
 */
Player.prototype.render = function () {
    'use strict';
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

/**
 * @description - moves the player based on user input.
 * @param {string} input - direction of user input
 */
Player.prototype.handleInput = function (input) {
    'use strict';
    switch (input) {
        case 'up':
            if (this.row > 0 && this.moveBlocked(input)) {
                this.row -= 1;
            }
            break;
        case 'down':
            if (this.row < board.rows - 1 && this.moveBlocked(input)) {
                this.row += 1;
            }
            break;
        case 'left':
            if (this.col > 0 && this.moveBlocked(input)) {
                this.col -= 1;
            }
            break;
        case 'right':
            if (this.col < board.cols - 1 && this.moveBlocked(input)) {
                this.col += 1;
            }
            break;
    }
    if (this.row === 0) {
        //you win!
        board.updateLevel();
    }
};

/**
 * @description - function to check to see if a obstacle is in the way.
 * @param {string} direction - direction to check from player
 */
Player.prototype.moveBlocked = function (direction) {
    'use strict';
    switch (direction) {
        case 'up':
            if (board.map[this.row - 1][this.col] === 'r') {
                return false;
            }
            break;
        case 'down':
            if (board.map[this.row + 1][this.col] === 'r') {
                return false;
            }
            break;
        case 'left':
            if (board.map[this.row][this.col - 1] === 'r') {
                return false;
            }
            break;
        case 'right':
            if (board.map[this.row][this.col + 1] === 'r') {
                return false;
            }
            break;
    }
    return true;
};


/**
 * @description -   This listens for key presses and sends the keys to your Player.handleInput() method. 
 */
document.addEventListener('keyup', function (e) {
    'use strict';
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    board.player.handleInput(allowedKeys[e.keyCode]);
});

/**
 * @description - Helper function, generates random row number
 * @param {number} low - minimum number of range to return
 * @param {number} high - maximum number of range to return
 * @returns {number} random row
 */
function getRandomRow(low, high) {
    'use strict';
    return low + Math.floor(Math.random() * (high - low + 1));
}


//create our game objects
var board = new GameBoard(6, 5, 1, 3);
