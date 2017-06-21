Phaser.Plugin.Damage = function(game, parent) {
    Phaser.Plugin.call(this, game, parent);
    this.options = {};
    this.options.x = 50;
    this.options.y = 50;
    this.options.width = 32;
    this.options.height = 32;
};

Phaser.Plugin.Damage.prototype = Object.create(Phaser.Plugin.prototype);
//Phaser.Plugin.Damage.constructor = Phaser.Plugin.SamplePlugin;

Phaser.Plugin.Damage.prototype.text = function(char) {
    this.char = char;
    options = arguments[1] || {};

    for (option in this.options) {
        if (option in options) {
            this.options[option] = options[option];
        }
    }

    this.update();
};

Phaser.Plugin.Damage.prototype.update = function() {
    if (!this.char) {
        return;
    }

    if (this.char.health === this.oldHealth) {
        return;
    }

    var fontHealthText = {
        font: "28px monospace",
        fill: this.textColor()
    };
    if (!this.healthText) {
        this.healthText = this.game.add.text(this.options.x, this.options.y, this.healthPrint(), fontHealthText);
        this.healthText.fixedToCamera = true;
    }

    this.healthText.text = this.healthPrint();

    this.oldHealth = this.char.health;
};

Phaser.Plugin.Damage.prototype.updatePercent = function() {};


Phaser.Plugin.Damage.prototype.healthPrint = function() {
    return this.char.health + ' % ';
};


Phaser.Plugin.Damage.prototype.textColor = function() {
    if(this.char.health <= 100){
        return "#31B404";   //grün
    } else if(this.char.health > 100 && this.char.health <= 170) {
        return "#D7DF01";   //gelb
    } else if(this.char.health > 175 && this.char.health <= 250) {
        return "#DBA901";   //orange
    } else if(this.char.health > 250) {
        return "#DF0101";   //rot
    }
};
