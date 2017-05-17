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

var MainGame = function() {

};

function MeleeWeapon(x, y, sprite, damage, knockbackAmount, knockbackDirection, game){
    this.object = game.add.sprite(x,y,sprite);
    this.object.frame = 1;
    game.physics.arcade.enable(this.object);
    this.object.body.collideWorldBounds = true;
    this.damage = damage;
    this.knockbackAmount = knockbackAmount;
    this.knockbackDamage = knockbackDirection;

    this.object.animations.add("meleeAttack",[1,0,1,2,1],9,false);
}

function Player(id,x,y,sprite,animations,game) {
    this.id = id;
    this.object = game.add.sprite(x,y,sprite);
    game.physics.arcade.enable(this.object);
    this.object.body.collideWorldBounds = true;
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

/*
meleeAttack = function(player){
    player.melee.object.x = player.melee.object.x + 20;
    player.melee.object.y = player.melee.object.y + 5;

    if (player.meleeTimeout === 0) {
        if (player.id === 1) {
            game.physics.arcade.overlap(player.melee.object, player2.object);
        }
        if (player.id === 2) {
            game.physics.arcade.collide(player.melee.object, player1.object);
        }
        player.meleeTimeout = 10;
    } else {
        player.meleeTimeout--;
    }

    player.melee.object.x = player.melee.object.x - 20;
    player.melee.object.y = player.melee.object.y - 5;
};
*/

MainGame.prototype = {

    preload: function() {
        game.load.spritesheet('player','assets/dude.png',32,48);
        game.load.spritesheet('meleeAttack','assets/meleeAttack.png',60,71);
        game.load.spritesheet('projectile','assets/firstaid.png');
        game.load.spritesheet('player2','assets/baddie.png',32,32);
        game.load.image('ground','assets/platform.png');
    },


    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var animations_player1=[["left",[0,1,2,3],10,true],["right",[5,6,7,8],10,true]];
        player1 = new Player(1,160,game.world.height -150,'player',animations_player1,game);
        melee1 = new MeleeWeapon(-14,-25,'meleeAttack',0,0,null,game);
        setMeleeWeapon(player1, melee1);

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
		
    },

    update: function() {
        game.physics.arcade.collide(player1.object,platforms);
        game.physics.arcade.collide(player2.object,platforms);
        game.physics.arcade.collide(player1.object,player2.object);
        game.physics.arcade.overlap(player1.melee.object,player2.object,console.log("x"));

        player1.object.body.velocity.x = 0;
        player2.object.body.velocity.x = 0;


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
        }

        if(p1cursors.down.isDown){
            player1.melee.object.animations.play("meleeAttack");
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
		 }

        if(p2downBtn.isDown){
            player2.melee.object.animations.play("meleeAttack");
        }
    }


};

