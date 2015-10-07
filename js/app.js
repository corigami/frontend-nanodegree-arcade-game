// Enemies our player must avoid
var Enemy = function () {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    this.y = 50;
    this.row = 0;
    this.speed = 0
    this.speedMulti = 1;

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    if (this.x < 500) {
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
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/char-boy.png';
    this.x = 200;
    this.y = 400;
    this.score = 0;
    this.level = 1;
    this.row = 5;

};

Player.prototype.update = function (dt) {
    //check for collision
    for (i in allEnemies) {
        //check for collision with left edge of player
        if (player.row == allEnemies[i].row) {
            if (allEnemies[i].x <= player.x + 20 && allEnemies[i].x + 100 >= player.x + 20) {
                resetLevel();
                //check for collision with right edge of player
            } else if (allEnemies[i].x <= player.x + 80 && allEnemies[i].x + 100 >= player.x + 80) {
                resetLevel();
            }
        }
    }
};

// Draw the enemy on the screen, required method for game
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function (input) {

    switch (input) {
        case 'up':
            if (this.y > 0) {
                this.y = this.y - 83;
                this.row--;
            }
            break;
        case 'down':
            if (this.y <= 350) {
                this.y = this.y + 83;
                this.row++;
            }
            break;
        case 'left':
            if (this.x >= 100) {
                this.x = this.x - 100;
            }
            break;
        case 'right':
            if (this.x <= 300) {
                this.x = this.x + 100;
            }
    }
    if (this.y < 0) {
        //you win!
        updateLevel()
    }
};

//updates level to increase difficulty
var updateLevel = function () {
    player.level++;
    player.x = 200;
    player.y = 400;
    player.row = 5;
    player.score = player.score + 1000;
    //update speed 
    for (var i = 0; i < allEnemies.length; i++) {
        allEnemies[i].speed = allEnemies[i].speed + allEnemies[i].speed * .1
    }
    console.log('score: ' + player.score);

};

//resets level after player is hit by enemy
var resetLevel = function () {
    //reset enemies
    for (var i = 0; i < 3; i++) {
        allEnemies[i].y = 230 - 83 * i;
        allEnemies[i].speed = 20 + i * 20;
        allEnemies[i].row = 3 - i;
    }
    //reset player
    player.x = 200;
    player.y = 400;
    player.score = 0;
    player.level = 1;
    player.row = 5;

}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i = 0; i < 3; i++) {
    allEnemies[i] = new Enemy();
    allEnemies[i].y = 230 - 83 * i;
    allEnemies[i].speed = 20 + i * 20;
    allEnemies[i].row = 3 - i;

}
var player = new Player();

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
