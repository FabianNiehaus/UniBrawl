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


var Fernseher = {
	preload : function(){

        game.load.spritesheet('ameisenkrieg', 'assets/ameisenkrieg.png', 900, 600, 5);
		game.load.audio('rauschen', 'assets/tvStaticNoise.wav');
	},
	create : function(){
		tvSound = game.add.audio('rauschen');
		//tvSound.play();
        tvSound.volume = 0.1;
        tvSound.loopFull(1);
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
		if(music.volume >= 0){
			music.volume -= 0.1;
		}
	},
	ausschalten : function(){
		music.stop();
		game.state.start('offscreen');
	},

};
var MainGame = {
	preload : function(){
		game.load.audio('music', 'assets/music.wav');
		game.load.image('background','assets/loading.jpg');
		game.load.image('startButton', 'assets/startButton.png');
	},
	create : function(){
		game.add.tileSprite(0, 0, 900, 600, 'background');
		music = game.add.audio('music');
		var startButton = game.add.button(240, 290,'startButton',this.start,this,2,1,0);
	},

	start : function(){
		game.state.start('spielstart');
	}
};

function RangedWeapon(noOfBullets, spriteName, bulletSpeed, fireRate, gravityDown, trackedSpriteName, knockbackAmount, hitTimeout, game)
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
    ranged.knockbackAmount = knockbackAmount;
    ranged.hitTimeout = hitTimeout;

    ranged.knockupAmount = 0;

    return ranged;
}

function MeleeWeapon(x, y, sprite, damage, knockupAmount, hitTimeout, attackTimeoutAmount, game) {
    //Erstellt Phaser-Objekt
    var melee = game.add.sprite(x,y,sprite);

    //Aktiviert Physik
    game.physics.arcade.enable(melee);

    //Waffenspezifische Eigenschaften
    melee.damage = damage;
    melee.knockbackAmount = damage * 15;
    melee.hitTimeout = hitTimeout;

    //Keine erneuter Angriff möglich
    melee.attackTimeout = 0;
    melee.attackTimeoutAmount = attackTimeoutAmount;

    melee.knockupAmount = knockupAmount;

    return melee;
}

function Stuhl(x, y, game){

    var stuhl = new MeleeWeapon(x, y, 'stuhl', 10, -150, 50, 75, game);

    stuhl.pivot.y = 70;

    //TODO Animationen für Schlagen fertigstellen

    //Idle-Animation
    var idle_right = stuhl.animations.add("idle_right",[1],1,true);
    idle_right.onStart.add(function(){
        stuhl.anchor.set(0.1, 0);
    });

    var idle_left = stuhl.animations.add("idle_left",[0],1,true);
    idle_left.onStart.add(function(){
        stuhl.anchor.set(0.9, 0);
    });

    var stuhl_attack_right = stuhl.animations.add("attack_right",[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],90,false);
    stuhl_attack_right.enableUpdate = true;
    stuhl_attack_right.step = 0;

    stuhl_attack_right.onStart.add(function(){
        stuhl.anchor.set(0,0);
    });

    stuhl_attack_right.onUpdate.add(function () {

        stuhl_attack_right.step ++;

        if(stuhl_attack_right.step < 17){
            stuhl.rotation += 0.15;
        } else {
            stuhl.rotation -= 0.15;
        }
    });

    stuhl_attack_right.onComplete.add(function (){
        stuhl.animations.play("idle_right");
        stuhl_attack_right.step = 0;
        stuhl.rotation = 0;
    });

    var stuhl_attack_left = stuhl.animations.add("attack_left",[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],90,false);
    stuhl_attack_left.enableUpdate = true;
    stuhl_attack_left.step = 0;

    stuhl_attack_left.onStart.add(function(){
        stuhl.anchor.set(1,0);
    });

    stuhl_attack_left.onUpdate.add(function () {

        stuhl_attack_left.step ++;

        if(stuhl_attack_left.step < 17){
            stuhl.rotation -= 0.15;
        } else {
            stuhl.rotation += 0.15;
        }
    });

    stuhl_attack_left.onComplete.add(function (){
        stuhl.animations.play("idle_left");
        stuhl_attack_left.step = 0;
        stuhl.rotation = 0;
    });

    return stuhl;
}

function Player(id,x,y,sprite,animations,game) {
    
    var player = players.create(x,y,sprite);
    
    player.id = id;
    
    game.physics.arcade.enable(player);

    resetGravity(player);

    animations.forEach(function(value){
        console.log(value);
        player.animations.add(value[0],value[1],value[2],value[3]);
    });
    
    player.direction = 'right';

    player.melee = null;
    player.weapon = null;
    
    player.anchor.setTo(0.5,0.5);

    player.doubleJump = false;

    player.isHit = -1;

    player.health = 0;
    player.maxHealth = 9999;

    return player;
}

setMeleeWeapon = function(player, melee){
    player.melee = melee;
    player.addChild(melee);
};

checkMeleeCollision = function(){

    players.forEach(function(currentPlayer) {
        if (currentPlayer.melee.animations.currentAnim.name.match(/attack_*/)) {
            players.forEach(function (otherPlayer) {
                if (otherPlayer !== currentPlayer) {
                    game.physics.arcade.overlap(currentPlayer.melee, otherPlayer, function (melee, enemy) {
                        if(currentPlayer.body.center.x > enemy.body.center.x){
                            getHit(enemy,melee,"left");
                            //console.log("Melee: " + (currentPlayer.melee.body.center.x - Math.sqrt(Math.pow(currentPlayer.melee.body.width, 2) + Math.pow(currentPlayer.melee.body.height, 2))));
                            //console.log("Player: " + (otherPlayer.body.center.x + otherPlayer.body.width / 2));
                        } else if (currentPlayer.body.center.x < enemy.body.center.x){
                            getHit(enemy,melee,"right");
                            //console.log("Melee: " + (currentPlayer.melee.body.center.x + Math.sqrt(Math.pow(currentPlayer.melee.body.width, 2) + Math.pow(currentPlayer.melee.body.height, 2))));
                            //console.log("Player: " + (otherPlayer.body.center.x - otherPlayer.body.width / 2));
                        }
                    });
                }
            });
        }
    });
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

    if (Player.y > game.height + 100 || Player.x > game.width + 100 || Player.x < -100 || Player.y < -100) {

        //ausgabe.text = "Fatality!";
		fallSound.play();
        Player.kill();

        var xy = getSpawnXY();
        Player.x = xy[0];
        Player.y = xy[1];

        game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            Player.revive(0);
			spawnSound.play();
        }, game);
    }
};

getSpawnXY = function () {

    var x = Math.random() * (823 - 14) + 14;

    if (x > 566) {
        x = Math.random() * (823 - 681) + 681;
    }

    return [x, 100];

};

MainGame.prototype = {

    preload: function() {
        game.load.audio('lose', 'assets/lose.wav');

        game.load.audio('hit', 'assets/hit.wav');
        game.load.audio('shoot', 'assets/shoot.wav');
		game.load.audio('fall','assets/fall.wav');
		game.load.audio('spawn','assets/spawn.wav');
        game.load.spritesheet('player', 'assets/Spritesheet_Fabian.png', 39, 100);
        game.load.spritesheet('meleeAttack','assets/firstaid.png',35,50);
        game.load.spritesheet('projectile', 'assets/Teller.png');
        game.load.spritesheet('player2', 'assets/Spritesheet_Mathis.png', 39, 100);
        //game.load.spritesheet('stuhl', 'assets/Waffe1_Stuhl1_5.png',35,50);
        game.load.spritesheet('stuhl', 'assets/Stuhl_Sprite2.png', 78, 68);
        game.load.image('ground','assets/world/Tisch2_2.png');
        game.load.image('ground2','assets/world/Tisch3.png');
        game.load.image('background', 'assets/world/Mensa2_4_klein.png');
        game.load.image('ground3','assets/world/kasse.png');
		
    },


    create: function(){

        game.add.tileSprite(0, 0, 900, 600, 'background');

        //Sound
        shoot = game.add.audio('shoot');
        hitSound = game.add.audio('hit');
		fallSound = game.add.audio('fall');
		spawnSound = game.add.audio('spawn');
        lose = game.add.audio('lose');
        music.play();
        music.volume = 0.7;
        music.loopFull(0.6);

        players = game.add.group();
        players.enableBody = true;

        var animations_player1 = [["left", [0, 1], 5, true], ["right", [2, 3], 5, true]];
		var spawnxy = getSpawnXY();
        player1 = new Player(1,spawnxy[0],spawnxy[1],'player',animations_player1,game);
        setMeleeWeapon(player1, new Stuhl(0,0,game));
        player1.anchor.setTo(0.45, 0.5);
        player1.weapon = RangedWeapon(20, 'projectile', 300, 600, 15, 'player', 50, 10, game);
        player1.melee.animations.play("idle_right");
        player1.direction = 'right';
        players.add(player1);

        player1Damage = game.add.plugin(Phaser.Plugin.Damage);
        player1Damage.text(
            player1,
            {x: 20, y: 43, width: 100, height: 20}
        );


        var animations_player2=[["left",[0,1],5,true],["right",[2,3],5,true]];
		spawnxy = getSpawnXY();
        player2 = new Player(2,spawnxy[0],spawnxy[1],'player2',animations_player2,game);
        setMeleeWeapon(player2, new Stuhl(0,0,game));
        player2.anchor.setTo(0.5, 0.5);
        player2.weapon = RangedWeapon(20, 'projectile', 300, 200, 15, 'player2', 50, 10, game);
        //player2.scale.setTo(0.8,0.8);
        //player2.melee.scale.setTo(1,1);
        player2.melee.animations.play("idle_left");
        player2.direction = 'left';
        players.add(player2);

        player2Damage = game.add.plugin(Phaser.Plugin.Damage);
        player2Damage.text(
            player2,
            {x: game.world.width - 120, y: 43, width: 100, height: 20}
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
        p1shoot = game.input.keyboard.addKey(Phaser.Keyboard.M);
        p2leftBtn = game.input.keyboard.addKey(Phaser.Keyboard.A);
        p2rightBtn = game.input.keyboard.addKey(Phaser.Keyboard.D);
        p2upBtn = game.input.keyboard.addKey(Phaser.Keyboard.W);
        p2downBtn = game.input.keyboard.addKey(Phaser.Keyboard.S);
        p2shoot = game.input.keyboard.addKey(Phaser.Keyboard.F);

        ausgabe = game.add.text(game.world.width/2, game.world.height/2, '', { fontSize: '32px', fill: '#FFFFFF' });
        ausgabe.anchor.setTo(0.5,0.5);
    },

    update: function() {
        game.physics.arcade.collide(player1,platforms);
        game.physics.arcade.collide(player2,platforms);
        game.physics.arcade.collide(player1,player2);

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
        checkMeleeCollision();

        //Spieler soll anhalten, sobald keine Richtungstaste gedrückt ist
        /*

         if (player1.isHit <= -1) {
            player1.body.velocity.x = 0;

            if (p1cursors.left.isDown) {
                player1.body.velocity.x = -150;
                if (player1.body.touching.down) {
                    player1.animations.play('left');
                } else {
                    player1.animations.stop();
                    player1.frame = 4;
                }

                player1.direction = 'left';
                if (player1.melee.animations.currentAnim.name === "idle_right") {
                    player1.melee.animations.play("idle_left");
                }
            } else if (p1cursors.right.isDown) {
                player1.body.velocity.x = 150;
                if (player1.body.touching.down) {
                    player1.animations.play('right');
                } else {
                    player1.animations.stop();
                    player1.frame = 4;
                }
                player1.direction = 'right';
                if (player1.melee.animations.currentAnim.name === "idle_left") {
                    player1.melee.animations.play("idle_right");
                }
            } else {
                player1.animations.stop();
                player1.frame = 4;
            }

            if (p1cursors.up.isDown && !player1.body.touching.down && player1.doubleJump === true) {
                player1.body.velocity.y = -350;
                player1.doubleJump = false;
            }
            if (p1cursors.up.isDown && player1.body.touching.down) {
                player1.body.velocity.y = -350;
                game.time.events.add(Phaser.Timer.SECOND * 1, function () {
                    player1.doubleJump = true
                }, this);
            }
        }
         */
        if (player1.isHit <= -1) {
            player1.body.velocity.x = 0;

            if (p1cursors.left.isDown) {
                player1.body.velocity.x = -150;
                player1.animations.play('left');
                player1.direction = 'left';
                if (player1.melee.animations.currentAnim.name === "idle_right") {
                    player1.melee.animations.play("idle_left");
                }
            } else if (p1cursors.right.isDown) {
                player1.body.velocity.x = 150;
                player1.animations.play('right');
                player1.direction = 'right';
                if (player1.melee.animations.currentAnim.name === "idle_left") {
                    player1.melee.animations.play("idle_right");
                }
            } else {
                player1.animations.stop();
                //player2.frame = 1;
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
                player2.body.velocity.x = -150;
                player2.animations.play('left');
                player2.direction = 'left';
                if(player2.melee.animations.currentAnim.name === "idle_right") {
                    player2.melee.animations.play("idle_left");
                }
            }else if(p2rightBtn.isDown){
                player2.body.velocity.x = 150;
                player2.animations.play('right');
                player2.direction = 'right';
                if(player2.melee.animations.currentAnim.name === "idle_left") {
                    player2.melee.animations.play("idle_right");
                }
            }else{
                player2.animations.stop();
                //player2.frame = 1;
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


        players.forEach(function (Player) {
            checkPlayerKill(Player);
        });

        if(p1cursors.down.isDown){
            if(player1.melee.animations.currentAnim.name.match(/idle_*/)) {
                if (player1.direction === 'right') {
                    player1.melee.animations.play("attack_right");
                    player1.melee.attackTimeout = player1.melee.attackTimeoutAmount;
                } else if (player1.direction === 'left') {
                    player1.melee.animations.play("attack_left");
                    player1.melee.attackTimeout = player1.melee.attackTimeoutAmount;
                }
            }
        }

        if(p2downBtn.isDown){
            if (player2.melee.animations.currentAnim.name.match(/idle_*/) && player2.melee.attackTimeout === 0) {
                if (player2.direction === 'right') {
                    player2.melee.animations.play("attack_right");
                    player2.melee.attackTimeout = player2.melee.attackTimeoutAmount;
                } else if (player2.direction === 'left') {
                    player2.melee.animations.play("attack_left");
                    player2.melee.attackTimeout = player2.melee.attackTimeoutAmount;
                }
            }
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

    }
};









