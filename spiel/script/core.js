var game = null;
function init() {
    game = new Phaser.Game(900,600,Phaser.canvas,'',null,false,false);

    game.state.add("MainGame", MainGame);
    game.state.start("MainGame");
}

//var cursors;
var player1;
var player2;
var players;
var platforms;
var ausgabe;
var music;
var hit;
var lose;
var loseplay = false;

var MainGame = function() {

};

function RangedWeapon(noOfBullets,spriteName,bulletSpeed,fireRate,gravityDown, trackedSpriteName)
{
    //erstellt 20 "Kugeln" mit sprite projectile
    var weapon = game.add.weapon(noOfBullets, spriteName);
    //automatisches killen, beim erreichen der Weltgrenze
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = bulletSpeed;
    //Schussrate
    weapon.fireRate = fireRate;
    //schuss fängt beim Spieler Sprite an
    weapon.trackSprite(trackedSpriteName);
    weapon.bulletGravity = new Phaser.Point(0, gravityDown);
    //weapon.autofire = true;

    return weapon;
}

function MeleeWeapon(x, y, sprite, damage, knockbackAmount, knockbackDirection, game){
    //Erstellt Phaser-Objekt
    var melee = game.add.sprite(x,y,sprite);
    //Setzt Frame auf neutrale Animation
    melee.frame = 0;
    //Aktiviert Physik
    game.physics.arcade.enable(melee);

    //Waffenspezifische Eigenschaften
    melee.damage = damage;
    melee.knockbackAmount = knockbackAmount;
    melee.knockbackDirection = knockbackDirection;

    melee.attackFrameTimeout = 0;

    return melee;
}

function Stuhl(x, y, game){

    var stuhl = new MeleeWeapon(x, y, 'stuhl', 5, 0.5,[-1,-1], game);
    stuhl.animations.add("stuhl_attack_right",[0,1,2,3],2,false);
    stuhl.animations.add("stuhl_attack_left",[0,1,2,3],2,false);

    return stuhl;
}

function Player(id,x,y,sprite,animations,game) {
    
    var player = players.create(x,y,sprite);
    
    player.id = id;
    
    game.physics.arcade.enable(player);
    
    player.body.gravity.y = 450;

    animations.forEach(function(value){
        console.log(value);
        player.animations.add(value[0],value[1],value[2],value[3]);
    });
    
    player.direction = 'right';

    player.melee = null;
    player.weapon = null;
    
    player.anchor.setTo(0.5,0.5);

    player.doubleJump = false;
    
    return player;
}

setMeleeWeapon = function(player, melee){
    player.melee = melee;
    player.addChild(melee);
};

MainGame.prototype = {

    preload: function() {
        game.load.audio('lose', 'assets/lose.wav');
        game.load.audio('music', 'assets/music.wav');
        game.load.audio('hit', 'assets/hit.wav');
        game.load.audio('shoot', 'assets/shoot.wav');
        game.load.spritesheet('player','assets/dude.png',32,48);
        game.load.spritesheet('meleeAttack','assets/firstaid.png',35,50);
        game.load.spritesheet('projectile','assets/kugel.png');
        game.load.spritesheet('player2','assets/baddie.png',62.25,100);
        game.load.spritesheet('stuhl','assets/Stuhl_Attack_Right.png',57,58);
        game.load.image('ground','assets/Mensa_Tisch.png');
        game.load.image('background','assets/Mensa1.png');
    },


    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.add.tileSprite(0, 0, 900, 600, 'background');

        //Sound
        shoot = game.add.audio('shoot');
        hit = game.add.audio('hit');
        music = game.add.audio('music');
        lose = game.add.audio('lose');
        music.play();
        music.volume = 0.7;
        music.loopFull(0.6);

        players = game.add.group();
        players.enableBody = true;

        var animations_player1=[["left",[0,1,2,3],10,true],["right",[5,6,7,8],10,true]];
        player1 = new Player(1,150,300,'player',animations_player1,game);
        setMeleeWeapon(player1, new Stuhl(-30,-75,game));
        //player.melee.anchor.setTo(0.5,0.5);
        player1.weapon = RangedWeapon(20,'projectile',300,200,15,'player');
        player1.direction = 'right';
        players.add(player1);

        var animations_player2=[["left",[0,1],5,true],["right",[2,3],5,true]];
        player2 = new Player(2,70,300,'player2',animations_player2,game);
        setMeleeWeapon(player2, new Stuhl(0,-25,game));
        player2.weapon = RangedWeapon(20,'projectile',300,200,15,'player2');
        player2.scale.setTo(0.8,0.8);
        player2.direction = 'left';
        players.add(player2);

        cursors = game.input.keyboard.createCursorKeys();

        platforms = game.add.group();
        platforms.enableBody = true;

        var ground = platforms.create(40,465,'ground');
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

        checkAttackCollision();

        if(player2.direction === 'right'){
            player2.anchor.setTo(0.5,0.5);
        }else{
            player2.anchor.setTo(0,0.5);
        }

        //Spieler soll anhalten, sobald keine Richtungstaste gedrückt ist
        player1.body.velocity.x = 0;
        player2.body.velocity.x = 0;

        //
        if(player1.melee.frame > 0) playerAttack(player1);
        if(player2.melee.frame > 0) playerAttack(player2);

        if(p1cursors.left.isDown){
            player1.body.velocity.x = -150;
            if(player1.body.touching.down){
                player1.animations.play('left');
            }else{
                player1.animations.stop();
                player1.frame = 4;
            }
            player1.direction = 'left';
        }else if(p1cursors.right.isDown){
            player1.body.velocity.x = 150;
            if(player1.body.touching.down){
                player1.animations.play('right');
            }else{
                player1.animations.stop();
                player1.frame = 4;
            }
            player1.direction = 'right';

        }else{
            player1.animations.stop();
            player1.frame = 4;
        }

        if(p1cursors.up.isDown && !player1.body.touching.down && player1.doubleJump === true){
            player1.body.velocity.y = -350;
            player1.doubleJump = false;
        }
        if(p1cursors.up.isDown && player1.body.touching.down){
            player1.body.velocity.y = -350;
            game.time.events.add(Phaser.Timer.SECOND * 1, function(){player1.doubleJump = true} ,this);
        }

        if(p1cursors.down.isDown){
            playerAttack(player1);
        }

        if(p2leftBtn.isDown){
            player2.body.velocity.x = -150;
            player2.animations.play('left');
            player2.direction = 'left';
        }else if(p2rightBtn.isDown){
            player2.body.velocity.x = 150;
            player2.animations.play('right');
            player2.direction = 'right';
        }else{
            player2.animations.stop();
            //player2.frame = 1;
        }


        if(p2upBtn.isDown && !player2.body.touching.down && player2.doubleJump === true){
            player2.body.velocity.y = -350;
            player2.doubleJump  = false;
        }
        if(p2upBtn.isDown && player2.body.touching.down){
            player2.body.velocity.y = -350;
            game.time.events.add(Phaser.Timer.SECOND * 1, function(){player2.doubleJump = true},this);
        }

        if(p2downBtn.isDown){
            playerAttack(player2);
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


        if(player1.y > game.height + 50){
            music.stop();
            if(loseplay === false){
                loseplay = true;
                lose.play();
            }
            ausgabe.text = "Spieler 1 hat die Runde verloren";
            player2.y = -9000;
            game.time.events.add(Phaser.Timer.SECOND * 2, respawnP1,this);

        }
        if(player2.y > game.height + 50){
            music.stop();
            if(loseplay === false){
                loseplay = true;
                lose.play();
            }
            ausgabe.text = "Spieler 2 hat die Runde verloren";
            player1.y = -9000;
            game.time.events.add(Phaser.Timer.SECOND * 2, respawnP2,this);

        }

        function checkAttackCollision(){
            players.forEach(function(item){

                var currentPlayer = item;

                game.physics.arcade.collide(currentPlayer.weapon.bullets,platforms,function(bullet){bullet.kill();});

                players.forEach(function(otherPlayer){
                    if(otherPlayer !== currentPlayer) {
                        game.physics.arcade.collide(currentPlayer.weapon.bullets,otherPlayer,function(enemy,bullet){bullet.kill();});
                    }
                });
            });
        }

        function playerAttack(player) {
            if (player.melee.attackFrameTimeout === 0) {
                if (player.melee.frame === 0) {
                    player.melee.x = player.melee.x + 30;
                    player.melee.y = player.melee.y + 20;
                    player.melee.frame = 1;
                    player.melee.attackFrameTimeout = 5;
                } else if (player.melee.frame === 1) {
                    player.melee.x = player.melee.x + 10;
                    player.melee.y = player.melee.y + 5;
                    player.melee.frame= 2;
                    player.melee.attackFrameTimeout = 5;
                } else if (player.melee.frame === 2) {
                    player.melee.x = player.melee.x + 5;
                    player.melee.y = player.melee.y + 35;
                    player.melee.frame = 3;
                    player.melee.attackFrameTimeout = 5;
                } else if (player.melee.frame === 3) {
                    player.melee.x = player.melee.x - 45;
                    player.melee.y = player.melee.y - 60;
                    /*
                     game.physics.arcade.overlap(player.melee, players, function () {
                     if(player.id === 1){
                     kill(player2);
                     }
                     if(player.id === 2){
                     kill(player1);
                     }
                     });
                     */
                    player.melee.frame = 0;
                    player.melee.attackFrameTimeout = 10;
                }
            } else if (player.melee.attackFrameTimeout > 0) {
                player.melee.attackFrameTimeout--;
            }
        }
    }


};
function respawnP1(){
    loseplay = false;
    player1.x = 150;
    player1.y = 300;
    player2.x = 70;
    player2.y = 300;
    ausgabe.text = "";
    music.play();
}
function respawnP2(){
    loseplay = false;
    player1.x = 150;
    player1.y = 300;
    player2.x = 70;
    player2.y = 300;
    ausgabe.text = "";
    music.play();
}





