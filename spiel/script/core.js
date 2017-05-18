var game = null;
function init() {
    game = new Phaser.Game(900,600,Phaser.canvas,'',null,false,false);

    game.state.add("MainGame", MainGame);
    game.state.start("MainGame");


}

//var cursors;
var player1;
var player2;
var platforms;
var ausgabe;
var music;
var p1doubleJump = false;
var p2doubleJump = false;
var hit;
var lose;
var loseplay = false;

var MainGame = function() {

};

function MeleeWeapon(x, y, sprite, damage, knockbackAmount, knockbackDirection, game){
    this.object = game.add.sprite(x,y,sprite);
    this.object.frame = 1;
    game.physics.arcade.enable(this.object);
    this.damage = damage;
    this.knockbackAmount = knockbackAmount;
    this.knockbackDamage = knockbackDirection;

    //this.object.animations.add("meleeAttack",[1,0,1,2,1],9,false);
    this.object.animations.add("meleeAttack",[0,1,2,3],2,false);
    this.object.animations.add("idle",[0],0,false);

    this.attackFrame = 0;
    this.attackFrameTimeout = 0;
}

function Player(id,x,y,sprite,animations,game) {
    this.id = id;
    this.object = game.add.sprite(x,y,sprite);
    game.physics.arcade.enable(this.object);
    this.object.body.gravity.y = 450;
    var self = this;

    this.meleeTimeout = 0;
    this.meleeState = 0;

    animations.forEach(function(value){
        console.log(value);
        self.object.animations.add(value[0],value[1],value[2],value[3]);
    });
    this.object.direction = 'right';

    this.melee = null;
}

setMeleeWeapon = function(player, melee){
    player.melee = melee;
    player.object.addChild(melee.object);
};

MainGame.prototype = {

    preload: function() {
		game.load.audio('lose', 'assets/lose.wav');
		game.load.audio('music', 'assets/music.wav');
		game.load.audio('hit', 'assets/hit.wav');
		game.load.audio('shoot', 'assets/shoot.wav');
        game.load.spritesheet('player','assets/dude.png',32,48);
        game.load.spritesheet('meleeAttack','assets/firstaid.png',32,32);
        game.load.spritesheet('projectile','assets/firstaid.png');
        game.load.spritesheet('player2','assets/baddie.png',32,32);
        game.load.image('ground','assets/platform.png');
    },


    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);
		
		//Sound
		shoot = game.add.audio('shoot');
		hit = game.add.audio('hit');
		music = game.add.audio('music');
		lose = game.add.audio('lose');
		music.play();
		music.volume = 0.7;
		music.loopFull(0.6);

        var animations_player1=[["left",[0,1,2,3],10,true],["right",[5,6,7,8],10,true]];
        player1 = new Player(1,160,game.world.height -150,'player',animations_player1,game);
        melee1 = new MeleeWeapon(0,-25,'meleeAttack',0,0,null,game);
        setMeleeWeapon(player1, melee1);
        //player.melee.object.anchor.setTo(0.5,0.5);

        var animations_player2=[["left",[0,1],5,true],["right",[2,3],5,true]];
        player2 = new Player(2,708,game.world.height -150,'player2',animations_player2,game);
        melee2 = new MeleeWeapon(0,0,'meleeAttack',0,0,null,game);
        setMeleeWeapon(player2, melee2);

        cursors = game.input.keyboard.createCursorKeys();

        platforms = game.add.group();
        platforms.enableBody = true;

        var ground = platforms.create(130,game.world.height - 35, 'ground');
        ground.scale.setTo(1.6,2);
        ground.body.immovable = true;

        var pcenter1 = platforms.create(290,game.world.height - 160, 'ground');
        pcenter1.scale.setTo(0.8,1);
        pcenter1.body.immovable = true;

        var pright = platforms.create(190,game.world.height - 285, 'ground');
        pright.scale.setTo(0.5,1);
        pright.body.immovable = true;

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
        game.physics.arcade.collide(player1.object,platforms);
        game.physics.arcade.collide(player2.object,platforms);
        game.physics.arcade.collide(player1.object,player2.object);


        player1.object.body.velocity.x = 0;
        player2.object.body.velocity.x = 0;

        if(player1.melee.attackFrame > 0) player1attack();

        function player1attack() {
            if (player1.melee.attackFrameTimeout === 0) {
                if (player1.melee.attackFrame === 0) {
                    player1.melee.object.x = player1.melee.object.x + 32;
                    player1.melee.object.y = player1.melee.object.y + 32;
                    game.physics.arcade.overlap(player1.melee.object, player2.object, function () {
                        kill(player2);
						hit.play();
                    });
                    player1.melee.attackFrame = 1;
                    player1.melee.attackFrameTimeout = 7;
                } else if (player1.melee.attackFrame === 1) {
                    player1.melee.object.x = player1.melee.object.x - 32;
                    player1.melee.object.y = player1.melee.object.y - 32;
                    game.physics.arcade.overlap(player1.melee.object, player2.object, function () {
                        kill(player2);
						
                    });
                    player1.melee.attackFrame = 2;
                    player1.melee.attackFrameTimeout = 7;
                } else if (player1.melee.attackFrame === 2) {
                    player1.melee.object.x = player1.melee.object.x - 32;
                    player1.melee.object.y = player1.melee.object.y + 32;
                    game.physics.arcade.overlap(player1.melee.object, player2.object, function () {
                        kill(player2)
                    });
                    player1.melee.attackFrame = 3;
                    player1.melee.attackFrameTimeout = 7;
                } else if (player1.melee.attackFrame === 3) {
                    player1.melee.object.x = player1.melee.object.x + 32;
                    player1.melee.object.y = player1.melee.object.y - 32;
                    game.physics.arcade.overlap(player1.melee.object, player2.object, function () {
                        kill(player2)
                    });
                    player1.melee.attackFrame = 0;
                    //player1.melee.attackFrameTimeout = 10;
                }
            } else if (player1.melee.attackFrameTimeout > 0) {
                player1.melee.attackFrameTimeout--;
            }
        }

        if(p1cursors.left.isDown){
            player1.object.body.velocity.x = -150;
            player1.object.animations.play('left');
            player1.object.direction = 'left';
        }else if(p1cursors.right.isDown){
            player1.object.body.velocity.x = 150;
            player1.object.animations.play('right');
            player1.object.direction = 'right';

        }else{
            player1.object.animations.stop();
            player1.object.frame = 4;
        }

		 
		
        if(p1cursors.up.isDown && player1.object.body.touching.down){
            player1.object.body.velocity.y = -350;
			game.time.events.add(Phaser.Timer.SECOND * 1, function(){p1doubleJump = true} ,this);
        }
		if(p1cursors.up.isDown && !player1.object.body.touching.down && p1doubleJump == true){
		 	player1.object.body.velocity.y = -350;
			p1doubleJump = false;
		 }

        if(p1cursors.down.isDown){
            player1attack();
        }
		 

        if(p2leftBtn.isDown){
            player2.object.body.velocity.x = -150;
            player2.object.animations.play('left');
            player2.object.direction = 'left';
        }else if(p2rightBtn.isDown){
            player2.object.body.velocity.x = 150;
            player2.object.animations.play('right');
            player2.object.direction = 'right';
        }else{
            player2.object.animations.stop();
            //player2.object.frame = 1;
        }

		
		 if(p2upBtn.isDown && player2.object.body.touching.down){
		 	player2.object.body.velocity.y = -350;
		 	game.time.events.add(Phaser.Timer.SECOND * 1, function(){p2doubleJump = true},this);
        }
		if(p2upBtn.isDown && !player2.object.body.touching.down && p2doubleJump == true){
		 	player2.object.body.velocity.y = -350;
			p2doubleJump = false;
		 }

        if(p2downBtn.isDown){
            player2.melee.object.animations.play("meleeAttack");
        }

        function kill(player){
            player.object.kill();
        }
		
		
		if(player1.object.y > game.height + 50){
			music.stop();
			if(loseplay == false){
				loseplay = true;
				lose.play();
			}
			ausgabe.text = "Spieler 1 hat die Runde verloren";
			player2.object.y = -9000;
			game.time.events.add(Phaser.Timer.SECOND * 2, respawnP1,this);
			
		}
		if(player2.object.y > game.height + 50){
			music.stop();
			if(loseplay == false){
				loseplay = true;
				lose.play();
			}
			ausgabe.text = "Spieler 2 hat die Runde verloren";
			player1.object.y = -9000;
			game.time.events.add(Phaser.Timer.SECOND * 2, respawnP2,this);
			
		}
    }


};
function respawnP1(){
	loseplay = false;
	player1.object.x = 160;
	player1.object.y = game.world.height - 155;
	player2.object.x = 708
	player2.object.y = game.world.height -155;
	ausgabe.text = "";	
	music.play();
}
function respawnP2(){
	loseplay = false;
	player1.object.x = 160;
	player1.object.y = game.world.height - 155;
	player2.object.x = 708
	player2.object.y = game.world.height -155;
	ausgabe.text = "";
	music.play();
}


