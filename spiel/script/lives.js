/**
 Copyright (c) 2016 Matthias Hager <matthias@2helixtech.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

Phaser.Plugin.Lives = function(game, parent) {
    Phaser.Plugin.call(this, game, parent);
    this.options = {};
    this.options.icon = null;
    this.options.x = 50;
    this.options.y = 50;
    this.options.width = 32;
    this.options.height = 32;
    this.options.rows = 1;
};

Phaser.Plugin.Lives.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Lives.constructor = Phaser.Plugin.SamplePlugin;

Phaser.Plugin.Lives.prototype._setupOptions = function(options) {
    for (option in this.options) {
        if (option in options) {
            this.options[option] = options[option];
        }
    }
};

Phaser.Plugin.Lives.prototype.icons = function(char) {
    this.char = char;
    options = arguments[1] || {};
    this._setupOptions(options);
};

Phaser.Plugin.Lives.prototype.update = function() {
    if (!this.char) {
        return;
    }

    if (this.char.lives === this.oldLives) {
        return;
    }

    this.updateIcons();

    this.oldLives = this.char.lives;
};

Phaser.Plugin.Lives.prototype.updateIcons = function() {
    // if setting icons, you want to set maxHealth to be the max it EVER will be
    if (!this.options.icon) {
        return;
    }

    if (!this.healthIcons) {
        this.healthIcons = this.game.add.group();
        this.healthIcons.fixedToCamera = true;

            for (var i = this.char.maxLives - 1; i >= 0; i--) {
                var icon = this.healthIcons.create(
                    this.options.x + ((this.options.width + 2) * i),
                    this.options.y + ((this.options.height + 2)),
                    this.options.icon
                );
                icon.anchor.setTo(0, 0);
                icon.width = this.options.width;
                icon.height = this.options.height;
            }
    }

    while (this.healthIcons.countLiving() > this.char.lives) {
        var icon = this.healthIcons.getFirstAlive();
        icon.kill();
    }

    while (this.healthIcons.countLiving() < this.char.lives &&
    this.healthIcons.countLiving() < this.char.maxLives) {

        var index = this.healthIcons.getChildIndex(this.healthIcons.getFirstAlive());

        if (!index || index <= 0) {
            return;
        }

        var icon = this.healthIcons.getChildAt(index-1);

        if (icon) {
            icon.reset(icon.x, icon.y);
        }
    }
};

