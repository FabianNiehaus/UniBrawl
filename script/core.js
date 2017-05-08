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
var leftBtn;
var rightBtn;
var upBtn;
var MainGame = function() {
	
}



MainGame.prototype = {
	
	preload: function() {
		game.load.spritesheet('player','assets/dude.png',32,48);
		game.load.spritesheet('player2','assets/baddie.png',32,32);
		game.load.image('ground','assets/platform.png');
	},
	
	
	create: function(){
		game.physics.startSystem(Phaser.Physics.ARCADE);
		player1 = game.add.sprite(160,game.world.height -150,'player');
		game.physics.arcade.enable(player1);
		player1.body.collideWorldBounds = true;
		player1.body.gravity.y = 450;
		player1.animations.add('left',[0,1,2,3],10,true);
		player1.animations.add('right',[5,6,7,8],10,true);
		
		player2 = game.add.sprite(708,game.world.height -150,'player2');
		game.physics.arcade.enable(player2);
		player2.body.collideWorldBounds = true;
		player2.body.gravity.y = 450;
		player2.animations.add('left',[0,1],5,true);
		player2.animations.add('right',[2,3],5,true);

		
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
		p2leftBtn = game.input.keyboard.addKey(Phaser.Keyboard.A);
		p2rightBtn = game.input.keyboard.addKey(Phaser.Keyboard.D);
		p2upBtn = game.input.keyboard.addKey(Phaser.Keyboard.W);
	},
	
	update: function() {
		game.physics.arcade.collide(player1,platforms);
		game.physics.arcade.collide(player2,platforms);
		game.physics.arcade.collide(player1,player2);
		
		player1.body.velocity.x = 0;
		player2.body.velocity.x = 0;
		
		
		if(p1cursors.left.isDown){
			player1.body.velocity.x = -150;
			player1.animations.play('left');
		}else if(p1cursors.right.isDown){
			player1.body.velocity.x = 150;
			player1.animations.play('right');
		}else{
			player1.animations.stop();
			player1.frame = 4;
		}
		
		if(p1cursors.up.isDown && player1.body.touching.down){
			player1.body.velocity.y = -350;
		}
		
		if(p2leftBtn.isDown){
			player2.body.velocity.x = -150;
			player2.animations.play('left');
		}else if(p2rightBtn.isDown){
			player2.body.velocity.x = 150;
			player2.animations.play('right');
		}else{
			player2.animations.stop();
			player2.frame = 1;
		}
		
		if(p2upBtn.isDown && player2.body.touching.down){
			player2.body.velocity.y = -350;
		}
		
	
		
		
	}

	
}
