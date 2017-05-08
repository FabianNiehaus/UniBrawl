var game = null;
function init() {
	game = new Phaser.Game(300,200,Phaser.canvas,'',null,false,false);
	
	game.state.add("MainGame", MainGame);
	game.state.start("MainGame");



}
var cursors;
var player1;
var MainGame = function() {
	
}



MainGame.prototype = {
	
	preload: function() {
		game.load.spritesheet('player','assets/dude.png',32,48);
		
	},
	
	
	create: function(){
		game.physics.startSystem(Phaser.Physics.ARCADE);
		player1 = game.add.sprite(32,game.world.height -150,'player');
		game.physics.arcade.enable(player1);
		player1.body.collideWorldBounds = true;
		player1.body.gravity.y = 250;
		player1.animations.add('left',[0,1,2,3],10,true);
		player1.animations.add('right'[5,6,7,8],10,true);
		
		cursors = game.input.keyboard.createCursorKeys();
	},
	
	update: function() {
		player1.body.velocity.x = 0;
		
		if(cursors.left.isDown){
			player.body.velocity.x = -150;
			
		}
		
	}

	
}
