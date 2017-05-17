var game = null;
function init() {
    game = new Phaser.Game(900,600,Phaser.canvas,'',null,false,false);

    game.state.add("MainGame", MainGame);
    game.state.start("MainGame");


}

var cursors;
var player1;
var player2;
var platforms;
/*
var leftBtn;
var rightBtn;
var upBtn;
*/
var MainGame = function() {

};

function MeleeWeapon(x, y, sprite, damage, knockbackAmount, knockbackDirection, game){
    this.object = game.add.sprite(x,y,sprite);
    game.physics.arcade.enable(this.object);
    this.object.body.collideWorldBounds = true;
    this.damage = damage;
    this.knockbackAmount = knockbackAmount;
    this.knockbackDamage = knockbackDirection;
}

function Player(x,y,sprite,animations,game) {
    this.object = game.add.sprite(x,y,sprite);
    game.physics.arcade.enable(this.object);
    this.object.body.collideWorldBounds = true;
    this.object.body.gravity.y = 450;
    var self = this;
    animations.forEach(function(value){
        console.log(value);
        self.object.animations.add(value);
    });
    this.object.direction = 'right';

    this.melee = null;
}

setMeleeWeapon = function(player, melee){
    player.melee = melee;
    player.object.addChild(melee.object);
};

var projectiles_player1;
var projectiles_player2;

var projectile_timeout_player1 = 0;
var projectile_timeout_player2 = 0;



MainGame.prototype = {

    preload: function() {
        game.load.spritesheet('player','assets/dude.png',32,48);
        game.load.spritesheet('projectile','assets/firstaid.png');
        game.load.spritesheet('player2','assets/baddie.png',32,32);
        game.load.image('ground','assets/platform.png');
    },


    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);

        animations_player1=[['left',[0,1,2,3],10,true],['right',[5,6,7,8],10,true]];
        player1 = new Player(160,game.world.height -150,'player',animations_player1,game);
        //melee1 = new MeleeWeapon(0,0,'projectile',0,0,null,game);
        //setMeleeWeapon(player1, melee1);

        animations_player2=[['left',[0,1],5,true],['right',[2,3],5,true]];
        player2 = new Player(708,game.world.height -150,'player2',animations_player2,game);
        //melee2 = new MeleeWeapon(0,0,'projectile',0,0,null,game);
        //setMeleeWeapon(player2, melee2);

        cursors = game.input.keyboard.createCursorKeys();

        projectiles_player1 = game.add.group();
        projectiles_player1.enableBody = true;

        projectiles_player2 = game.add.group();
        projectiles_player2.enableBody = true;

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
		p2shoot = game.input.keyboard.addKey(Phaser.Keyboard.F);
		
    },

    update: function() {
        game.physics.arcade.collide(player1.object,platforms);
        game.physics.arcade.collide(player2.object,platforms);
        game.physics.arcade.collide(player1.object,player2.object);
        game.physics.arcade.collide(projectiles_player1,platforms);
        game.physics.arcade.collide(projectiles_player2,platforms);
        game.physics.arcade.collide(projectiles_player1,player2.object);
        game.physics.arcade.collide(projectiles_player2,player1.object);
        game.physics.arcade.collide(projectiles_player1,projectiles_player2);
        game.physics.arcade.collide(projectiles_player2,projectiles_player1);
        //game.physics.arcade.collide(player1.melee.object,player2.object);

        player1.object.body.velocity.x = 0;
        player2.object.body.velocity.x = 0;

        if (projectile_timeout_player1 > 0) projectile_timeout_player1--;
        if (projectile_timeout_player2 > 0) projectile_timeout_player2--;

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

        if(p1shoot.isDown && projectile_timeout_player1 === 0){
            Projectile(player1.object.x,player1.object.y,player1.object.body.velocity.x,1);
            projectile_timeout_player1 = 10;
        }

		
		 if(p1cursors.up.isDown && player1.object.body.touching.down){
		 player1.object.body.velocity.y = -350;
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
		 

        if(p2shoot.isDown && projectile_timeout_player2 === 0){
            Projectile(player2.object.x,player2.object.y,player2.object.body.velocity.x,2);
            projectile_timeout_player2 = 10;
        }


    }


};

function Projectile(x, y, x_velocity, player) {

    var proj = null;

    //Projektil zur Gruppe der Projektile des entsprechenden Spieler hinzufügen
    switch (player) {
        case 1:

            proj = projectiles_player1.create(x, y, 'projectile');

            proj_init_vel = 500;

            //Startverktor für Projektil bestimmen
            if(player1.object.direction === 'right'){
                proj.body.velocity.x = proj_init_vel + x_velocity;
            } else {
                proj.body.velocity.x = -proj_init_vel + x_velocity;
            }

            break;

        case 2:

            proj = projectiles_player2.create(x,y,'projectile');
			
			proj_init_vel = 500;
            //Startverktor für Projektil bestimmen
            if(player2.object.direction === 'right'){
                proj.body.velocity.x = proj_init_vel + x_velocity;
            } else {
                proj.body.velocity.x = -proj_init_vel + x_velocity;
            }

            break;

        default:

            break;
    }

    //Physik für Projektil aktivieren


    //Schwerkraft für Projektil bestimmen
    proj.body.gravity.y = 50;

    //Bounce für Projektil erstellen
    proj.body.bounce = 0;

}
