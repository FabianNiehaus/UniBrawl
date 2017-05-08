var game = null;
function init() {
	game = new Phaser.Game(300,200,Phaser.canvas,'',null,false,false);
	
	game.state.add("MainGame", MainGame);
	game.state.start("MainGame");



}

var MainGame = function() {
	
}



MainGame.prototype = {
	init: function(argument){
		game.physics.startSystem(Phaser.Physics.ARCADE);
	},
	
	preload: function() {
		
		
	},
	
	
	create: function(){
		
		
	},
	
	update: function() {
		
		
	}

	
}
