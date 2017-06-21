var game = null;
function init() {
    game = new Phaser.Game(900,600,Phaser.canvas,'',null,false,false);

    game.state.add("MainGame", MainGame);
	game.state.add("spielstart", MainGame.prototype);
	game.state.add("offscreen",Fernseher);
    game.state.start("offscreen");

}

var player1;
var player2;
var players;
var platforms;
var ausgabe;
var music;
var hitSound;
var spawnSound;
var fallSound;
var lose;
var ameisenkrieg;
var tvSound;
var gameOver = false;
var menuSound;


var Fernseher = {
	preload : function(){

        game.load.spritesheet('ameisenkrieg', 'assets/ameisenkrieg.png', 900, 600, 5);
		game.load.audio('rauschen', 'assets/tvStaticNoise.wav');
		game.load.audio('menu','assets/menu.wav');
	},
	create : function(){
		menuSound = game.add.audio('menu');
		tvSound = game.add.audio('rauschen');
		//tvSound.play();
        //tvSound.volume = 0.1;
        //tvSound.loopFull(1);
        ameisenkrieg = game.add.sprite(0, 0, 'ameisenkrieg');
		var flimmern = ameisenkrieg.animations.add('flimmern');
		ameisenkrieg.animations.play('flimmern',30,true);
	},
	
	starten : function(){
		tvSound.stop();
		ameisenkrieg.animations.stop();
		game.state.start('MainGame');
	},
	volumeUp : function(){
	music.volume += 0.1;
	},
	volumeDown : function(){
		if(music.volume > 0.1){
			music.volume -= 0.1;
		}
	},
	ausschalten : function(){
		music.stop();
		menuSound.stop();
		game.state.start('offscreen');
	},

};
var MainGame = {
	preload : function(){
		game.load.audio('music', 'assets/murcielago.wav');
		game.load.image('background','assets/loading.jpg');
		game.load.image('startButton', 'assets/startButton.png');
		game.load.image('neustartButton', 'assets/neustartButton.png');

	},
	create : function(){
		menuSound.play();
		menuSound.loopFull(1);
		game.add.tileSprite(0, 0, 900, 600, 'background');
		music = game.add.audio('music');

		var startButton;
		if(gameOver){
            startButton = game.add.button(240, 290,'neustartButton',this.start,this,2,1,0);
        }   else    {
            startButton = game.add.button(240, 290,'startButton',this.start,this,2,1,0);
        }

	},

	start : function(){
		menuSound.stop();
		game.state.start('spielstart');
        gameOver = false;
	}
};

function RangedWeapon(noOfBullets, spriteName, bulletSpeed, fireRate, gravityDown, trackedSpriteName, damage, hitTimeout, game)
{
    //erstellt 20 "Kugeln" mit sprite projectile
    var ranged = game.add.weapon(noOfBullets, spriteName);
    //automatisches killen, beim erreichen der Weltgrenze
    ranged.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    ranged.bulletSpeed = bulletSpeed;
    //Schussrate
    ranged.fireRate = fireRate;
    //schuss fängt beim Spieler Sprite an
    ranged.trackSprite(trackedSpriteName);
    ranged.bulletGravity = new Phaser.Point(0, gravityDown);
    //weapon.autofire = true;

    ranged.damage = damage;
    ranged.knockbackAmount = damage * 10;
    ranged.hitTimeout = hitTimeout;

    ranged.knockupAmount = 0;

    return ranged;
}

function MeleeWeapon(x, y, sprite, damage, knockupAmount, hitTimeout, attackTimeoutAmount, anchorRight, anchorY, game) {
    //Erstellt Phaser-Objekt
    var melee = game.add.sprite(x,y,sprite);

    //Aktiviert Physik
    game.physics.arcade.enable(melee);

    // melee.body.syncBounds = true;
    melee.body.moves = false;

    //Waffenspezifische Eigenschaften
    melee.damage = damage;
    melee.knockbackAmount = damage * 15;
    melee.hitTimeout = hitTimeout;

    //Keine erneuter Angriff möglich
    melee.attackTimeout = 0;
    melee.attackTimeoutAmount = attackTimeoutAmount;

    melee.knockupAmount = knockupAmount;

    melee.pivot.y = 60;
    console.log(melee.pivot.y);

    melee.anchorRight = anchorRight;
    melee.anchorLeft = 1 - anchorRight;
    melee.anchorY = anchorY;

    melee.originalAngle = 0;
    melee.maxAngleFixed = 140;

    melee.returning = false;


    melee.body.originalX = 0;

    melee.idleRight = function () {
        if (!this.frame == 1) {
            this.attacking = false;
            this.returning = false;
            this.angle = 0;
            this.frame = 1;
            this.anchor.set(melee.anchorRight, melee.anchorY);
        }
    };

    melee.idleLeft = function () {
        if (!this.frame == 0) {
            this.attacking = false;
            this.returning = false;
            this.angle = 0;
            this.frame = 0;
            this.anchor.set(melee.anchorLeft, melee.anchorY);
        }
    };

    melee.attackRight = function () {
        melee.frame = 1;
        melee.attacking = true;
        melee.anchor.set(melee.anchorRight, melee.anchorY);
        melee.maxAngle = melee.maxAngleFixed;
    };

    melee.attackLeft = function () {
        melee.frame = 0;
        melee.attacking = true;
        melee.anchor.set(melee.anchorLeft, melee.anchorY);
        melee.maxAngle = melee.maxAngleFixed * -1;
    };

    return melee;
}


function Stuhl(x, y, game){

    //x, y, sprite, damage, knockupAmount, hitTimeout, attackTimeoutAmount, anchorRight, anchorY, game
    var stuhl = new MeleeWeapon(x, y, 'stuhl', 10, -150, 50, 75, 0.05, 0.05, game);

    return stuhl;

}

function Player(id, x, y, sprite, animations, direction, game) {
    
    var player = players.create(x,y,sprite);

    player.direction = direction;

    player.id = id;
    
    game.physics.arcade.enable(player);

    resetGravity(player);

    animations.forEach(function(value){
        player.animations.add(value[0],value[1],value[2],value[3]);
    });

    player.melee = null;
    player.weapon = null;

    player.doubleJump = false;

    player.isHit = -1;

    player.health = 0;
    player.maxHealth = 9999;

    player.lives = 3;
    player.maxLives = 5;
    return player;
}

setMeleeWeapon = function(player, melee){
    player.melee = melee;
    player.addChild(melee);
    if (player.direction === "left") {
        melee.idleLeft();
    } else if (player.direction === "right") {
        melee.idleRight();
    }
};

checkRangedCollision = function(){
    players.forEach(function(currentPlayer){

        game.physics.arcade.collide(currentPlayer.weapon.bullets,platforms,function(bullet){bullet.kill();});

        players.forEach(function(otherPlayer){
            if(otherPlayer !== currentPlayer) {

                game.physics.arcade.overlap(currentPlayer.weapon.bullets, otherPlayer, function (enemy, bullet) {
                    if (currentPlayer.body.center.x > enemy.body.center.x) {
                        getHit(enemy, currentPlayer.weapon, "left");
                    } else if (currentPlayer.body.center.x < enemy.body.center.x) {
                        getHit(enemy, currentPlayer.weapon, "right");
                    }
                    bullet.kill();
                });
            }
        });
    });
};

kill = function(enemy){
    enemy.weapon.destroy();
    enemy.melee.kill();
    enemy.kill();
};

getHit = function(player, weapon, direction) {

    if (player.isHit === -1) {
        player.isHit = weapon.hitTimeout;
		hitSound.play();

        if (direction === "left") {
            player.body.velocity.y = weapon.knockupAmount + (weapon.knockupAmount * player.health * 0.005);
            player.body.velocity.x = (weapon.knockbackAmount + (weapon.knockbackAmount * player.health * 0.01)) * -1;
            player.doubleJump = true;
        } else if (direction === "right") {
            player.body.velocity.y = weapon.knockupAmount + (weapon.knockupAmount * player.health * 0.005);
            player.body.velocity.x = weapon.knockbackAmount + (weapon.knockbackAmount * player.health * 0.01);
            player.doubleJump = true;
        }

        player.health += weapon.damage;
    }
};

resetGravity = function (Player) {
    Player.body.gravity.y = 450;
};

checkPlayerKill = function (Player) {
    if(gameOver === false) {
        if (Player.lives > 0) {
            if (Player.y > game.height + 100 || Player.x > game.width + 100 || Player.x < -100 || Player.y < -100) {

                fallSound.play();
                Player.kill();
                Player.lives--;
                var xy = getSpawnXY();
                Player.x = xy[0];
                Player.y = xy[1];
                if (Player.lives > 0) {
                    game.time.events.add(Phaser.Timer.SECOND * 3, function () {
                        Player.revive(0);
                        spawnSound.play();
                    }, game);
                }
            }
        } else {
             ausgabe.text = "GAME OVER!";
             gameOver = true;
        }
    } else{

        setTimeout(gameOverScreen(),5000);
    }
};

gameOverScreen = function() {
    music.stop();
    game.state.start('MainGame');
};

getSpawnXY = function () {

    var x = Math.random() * (823 - 14) + 14;

    if (x > 566) {
        x = Math.random() * (823 - 681) + 681;
    }

    return [x, 100];

};

playerDirection = function (Player) {

    if (Player.direction === "left") {
        Player.melee.idleLeft();
        Player.anchor.set(0.755, 0.4575);
        Player.body.velocity.x = -150;
        Player.animations.play('left');
    } else if (Player.direction === "right") {
        Player.melee.idleRight();
        Player.anchor.set(0.245, 0.4575);
        Player.body.velocity.x = 150;
        Player.animations.play('right');
    }
};

MainGame.prototype = {

    preload: function() {
        game.load.audio('lose', 'assets/lose.wav');

        game.load.audio('hit', 'assets/hit.wav');
        game.load.audio('shoot', 'assets/shoot.wav');
		game.load.audio('fall','assets/fall.wav');
		game.load.audio('spawn','assets/spawn.wav');
        game.load.spritesheet('player', 'assets/Spritesheet_Fabian.png', 39, 100);
        game.load.spritesheet('projectile', 'assets/Teller.png');
        game.load.spritesheet('player2', 'assets/Spritesheet_Mathis.png', 39, 100);
        game.load.spritesheet('stuhl', 'assets/Stuhl_Sprite2.png', 78, 68);
        game.load.image('ground','assets/world/Tisch2_2.png');
        game.load.image('ground2','assets/world/Tisch3.png');
        game.load.image('background', 'assets/world/Mensa2_4_klein.png');
        game.load.image('ground3','assets/world/kasse.png');
        game.load.image('heart','assets/heart.png')

    },


    create: function(){
		music.play();
        game.add.tileSprite(0, 0, 900, 600, 'background');

        //Sound
        shoot = game.add.audio('shoot');
        hitSound = game.add.audio('hit');
		fallSound = game.add.audio('fall');
		spawnSound = game.add.audio('spawn');
        lose = game.add.audio('lose');
        
        music.volume = 0.7;
        music.loopFull(0.6);

        players = game.add.group();
        players.enableBody = true;

        var animations_player1 = [["left", [0, 1], 5, true], ["right", [2, 3], 5, true]];
		var spawnxy = getSpawnXY();
        player1 = new Player(1, spawnxy[0], spawnxy[1], 'player', animations_player1, "right", game);
        setMeleeWeapon(player1, new Stuhl(0,0,game));
        player1.melee.idleLeft();
        //noOfBullets, spriteName, bulletSpeed, fireRate, gravityDown, trackedSpriteName, damage, hitTimeout, game
        player1.weapon = RangedWeapon(20, 'projectile', 300, 300, 15, 'player', 5, 10, game);
        playerDirection(player1);
        players.add(player1);

        player1Damage = game.add.plugin(Phaser.Plugin.Damage);
        player1Damage.text(
            player1,
            {x: 20, y: 43, width: 100, height: 20}
        );
        player1Lives = game.add.plugin(Phaser.Plugin.Lives);
        player1Lives.icons(
            player1,
            {icon: 'heart', x: 20, y: 65}
        );


        var animations_player2=[["left",[0,1],5,true],["right",[2,3],5,true]];
		spawnxy = getSpawnXY();
        player2 = new Player(2, spawnxy[0], spawnxy[1], 'player2', animations_player2, "left", game);
        setMeleeWeapon(player2, new Stuhl(0,0,game));
        player2.melee.idleRight();
        player2.weapon = RangedWeapon(20, 'projectile', 300, 300, 15, 'player2', 5, 10, game);
        playerDirection(player2);
        players.add(player2);
        player2Damage = game.add.plugin(Phaser.Plugin.Damage);
        player2Damage.text(
            player2,
            {x: game.world.width - 120, y: 43, width: 100, height: 20, rows: 1}
        );

        player2Lives = game.add.plugin(Phaser.Plugin.Lives);
        player2Lives.icons(
            player2,
            {icon: 'heart', x: game.world.width - 120, y: 65}
        );

        cursors = game.input.keyboard.createCursorKeys();

        platforms = game.add.group();
        platforms.enableBody  = true;

        var ground = platforms.create(148,553,'ground');
        ground.body.immovable = true;
        ground = platforms.create(683,425,'ground2');
        ground.body.immovable = true;
        ground = platforms.create(14,344,'ground3');
        ground.body.immovable = true;

        p1cursors = game.input.keyboard.createCursorKeys();
        p1shoot = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_0);
        p2leftBtn = game.input.keyboard.addKey(Phaser.Keyboard.A);
        p2rightBtn = game.input.keyboard.addKey(Phaser.Keyboard.D);
        p2upBtn = game.input.keyboard.addKey(Phaser.Keyboard.W);
        p2downBtn = game.input.keyboard.addKey(Phaser.Keyboard.S);
        p2shoot = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);

        ausgabe = game.add.text(game.world.width/2, game.world.height/2, '', { fontSize: '32px', fill: '#FFFFFF' });
        ausgabe.anchor.setTo(0.5,0.5);

    },

    update: function() {

        players.forEach(function (Player) {
            checkPlayerKill(Player);
        });

        players.forEach(function (Player) {
            var melee = Player.melee;
            if (melee.attacking) {
                //Check if weapon should start returning to original position
                if (melee.angle >= melee.maxAngle - 5 && melee.angle <= melee.maxAngle + 5) {
                    melee.returning = true;
                }
                //Swing Animation
                if (melee.returning === false) {
                    melee.angle += melee.maxAngle / 20;
                    if (melee.maxAngle < 0) {
                        melee.body.x = Player.centerX - melee.body.width;
                    } else {
                        melee.body.x = Player.centerX;
                    }
                } else {
                    melee.angle -= melee.maxAngle / 20;
                    if (melee.maxAngle < 0) {
                        melee.body.x = Player.centerX - melee.body.width;
                    } else {
                        melee.body.x = Player.centerX;
                    }
                }
                //End Animation on return to original position
                if (melee.angle >= melee.originalAngle - 5 && melee.angle <= melee.originalAngle + 5) {
                    melee.returning = false;
                    melee.attacking = false;
                    if (melee.maxAngle > 0) {
                        melee.idleRight();
                    } else {
                        melee.idleLeft();
                    }
                }
            }
        });

        game.physics.arcade.collide(player1,platforms);
        game.physics.arcade.collide(player2,platforms);
        game.physics.arcade.collide(player1,player2);

        players.forEach(function (currentPlayer) {
            if (currentPlayer.melee.attacking) {
                players.forEach(function (otherPlayer) {
                    if (otherPlayer !== currentPlayer) {
                        game.physics.arcade.overlap(currentPlayer.melee, otherPlayer, function (melee, enemy) {
                            if (currentPlayer.body.center.x > enemy.body.center.x) {
                                getHit(enemy, melee, "left");
                            } else if (currentPlayer.body.center.x < enemy.body.center.x) {
                                getHit(enemy, melee, "right");
                            }
                        });
                    }
                });
            }
        });

        players.forEach(function(currentPlayer){
            if (currentPlayer.isHit > -1) {
                currentPlayer.isHit--;
                if (currentPlayer.isHit === -1) {
                    currentPlayer.isHit = -30;
                    resetGravity(currentPlayer);
                }
            }
            if (currentPlayer.isHit < -1) {
                currentPlayer.isHit++;
            }
            if (currentPlayer.melee.attackTimeout > 0) {
                currentPlayer.melee.attackTimeout--;
            }
        });

        checkRangedCollision();


        if (player1.isHit <= -1) {
            player1.body.velocity.x = 0;

            if (p1cursors.left.isDown) {
                player1.direction = 'left';
                playerDirection(player1);
            } else if (p1cursors.right.isDown) {
                player1.direction = 'right';
                playerDirection(player1);
            } else {
                player1.animations.stop();
            }

            if (p1cursors.up.isDown && !player1.body.touching.down && player1.doubleJump === true) {
                player1.body.velocity.y = -350;
                player1.doubleJump = false;
            }

            if (p1cursors.up.isDown &&
                player1.body.touching.down) {
                player1.body.velocity.y = -350;
                game.time.events.add(Phaser.Timer.SECOND * 1, function () {
                    player1.doubleJump = true
                }, this);
            }
        }

        if (player2.isHit <= -1) {
            player2.body.velocity.x = 0;

            if(p2leftBtn.isDown){
                player2.direction = 'left';
                playerDirection(player2);

            }else if(p2rightBtn.isDown){
                player2.direction = 'right';
                playerDirection(player2);
            }else{
                player2.animations.stop();
            }

            if(p2upBtn.isDown && !player2.body.touching.down && player2.doubleJump === true){
                player2.body.velocity.y = -350;
                player2.doubleJump  = false;
            }

            if(p2upBtn.isDown &&
                player2.body.touching.down){
                player2.body.velocity.y = -350;
                game.time.events.add(Phaser.Timer.SECOND * 1, function(){player2.doubleJump = true},this);
            }
        }

        getHit = function (player, weapon, direction) {
            if (player.isHit === -1) {
                player.isHit = weapon.hitTimeout;

                if (direction === "left") {
                    player.body.velocity.y = weapon.knockupAmount + (weapon.knockupAmount * player.health * 0.005);
                    player.body.velocity.x = (weapon.knockbackAmount + (weapon.knockbackAmount * player.health * 0.01)) * -1;
                    player.doubleJump = true;
                } else if (direction === "right") {
                    player.body.velocity.y = weapon.knockupAmount + (weapon.knockupAmount * player.health * 0.005);
                    player.body.velocity.x = weapon.knockbackAmount + (weapon.knockbackAmount * player.health * 0.01);
                    player.doubleJump = true;
                }

                player.health += weapon.damage;
            }
        };

        startMelee = function (Player) {
            if (!Player.melee.attacking && Player.melee.attackTimeout === 0) {
                if (Player.direction === 'right') {
                    Player.melee.attackRight();
                    Player.melee.attackTimeout = Player.melee.attackTimeoutAmount;
                } else if (player1.direction === 'left') {
                    Player.melee.attackLeft();
                    Player.melee.attackTimeout = Player.melee.attackTimeoutAmount;
                }
            }
        };

        if (p1cursors.down.isDown) {
            startMelee(player1);
        }

        if(p2downBtn.isDown){
            startMelee(player2);
        }

        if (p1shoot.isDown)
        {
            shoot(player1);
        }

        if (p2shoot.isDown)
        {
            shoot(player2);
        }

        function kill(player){
            player.kill();

        }

        function shoot(player){
            if(player.direction === 'right') {
                player.weapon.fire(player, player.x + 10, player.y);
            }
            if(player.direction === 'left') {
                player.weapon.fire(player, player.x - 10, player.y);
            }
        }

    },

    render: function () {
        // game.debug.body(player1.melee);
        //game.debug.body(player2.melee);
        // game.debug.body(player1);
        // game.debug.body(player2);

        game.debug.body(player1.melee, 'red', false);
        game.debug.spriteBounds(player1.melee, 'pink', false);

        // game.debug.geom(player1.melee.anchor, 'rgba(255,255,255,1)' ) ;
        // game.debug.spriteInfo(player1.melee,32,32);
    }
};









