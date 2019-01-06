const blockWidth = 101;
const blockHeight = 83;
const numberOfRows = 6;
const numberOfColumns = 5;

var Enemy = function() {
    this.minVelocity = 200;
    this.maxVelocity = 600;
    this.sprite = 'images/enemy-bug.png';
    this.setInitialPosition();
};

Enemy.prototype.setInitialPosition = function() {
    // NOTE: Both row and column indexes are zero based.
    // The enemy only moves on stone blocks, that is, only moves at the rows with index [1, 3] randomly,
    // the top water block row is the first row and its row index is 0.
    this.rowIndex = Math.floor(Math.random() * 3) + 1;
    this.columnIndex = -1;
    // The X coordinate of the initial position, let it be out side of canvas.
    this.x = -blockWidth;
    // The offset in Y axis to make sure enemy-bug displays at the center of the block.
    this.yOffset = 20;
    this.y = blockHeight * this.rowIndex - this.yOffset;
    this.velocity = this.minVelocity + (this.maxVelocity - this.minVelocity) * Math.random();
}

Enemy.prototype.update = function(dt) {
    this.x += this.velocity * dt;
    // When the enemy bug moves into any stone block completely, then we think its columnIndex changes to
    // correspond to that block
    this.columnIndex = Math.floor(this.x / blockWidth);
    // If enemy-bug moves out side of the right of canvas, reset its position to the initial position.
    if (this.columnIndex > (numberOfColumns - 1)) {
        this.setInitialPosition();
    }
};

Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Player = function() {
    this.sprite = 'images/char-boy.png';
    // The offset in X axis is to take into account the fact that char-boy is centered at the image,
    // taking this account can help us detect collision better.
    this.xOffsetInImage = 20;
    this.setInitialPosition();
};

Player.prototype.setInitialPosition = function() {
    // The player's initial position is centered at the bottom row
    this.rowIndex = numberOfRows - 1;
    this.columnIndex = Math.floor(numberOfColumns / 2);
    this.x = blockWidth * this.columnIndex;
    this.y = blockHeight * this.rowIndex;
}

Player.prototype.update = function(dt) {
    // Ideally the collision detection logic shouldn't be here, violate OOP principles,
    // Player object shouldn't have any knowledge of enemies. Personally perfer to move
    // the logic to engine.js but don't want to change engine.js file as the instructor
    // note says.
    for (const enemy of allEnemies) {
        if ((this.rowIndex === enemy.rowIndex) &&
            // Detect if the enemy hits the left edge of the player
            ((((this.columnIndex - 1) === enemy.columnIndex) && ((enemy.x + blockWidth) >= (this.x + this.xOffsetInImage))) ||
            // Detect if the enemy hits the right edge of the player
            ((this.columnIndex === enemy.columnIndex) && (enemy.x <= (this.x + blockWidth - this.xOffsetInImage))))) {
            this.setInitialPosition();
            break;
        }
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(key) {
    switch(key) {
        case 'left':
            if (this.columnIndex > 0) {
                this.columnIndex--;
                this.x = blockWidth * this.columnIndex;
            }
            break;
        case 'up':
            if (this.rowIndex > 0) {
                this.rowIndex--;
                if (this.rowIndex === 0) {
                    // Move to water block successfully, so we reset to initial position.
                    this.setInitialPosition();
                }
                else {
                    this.y = blockHeight * this.rowIndex;
                }
            }
            break;
        case 'right':
            if (this.columnIndex < (numberOfColumns - 1)) {
                this.columnIndex++;
                this.x = blockWidth * this.columnIndex;
            }
            break;
        case 'down':
            if (this.rowIndex < (numberOfRows - 1)) {
                this.rowIndex++;
                this.y = blockHeight * this.rowIndex;
            }
            break;
    }
}

var allEnemies = [];
for (var i = 0; i < 3; i++) {
    var enemy = new Enemy();
    allEnemies.push(enemy);
}

var player = new Player();

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
