function  Player(x,y,sprite) {
    this.player = game.add.sprite(x,y,sprite,melee);
    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 450;
    this.player.animations.add('left',[0,1,2,3],10,true);
    this.player.animations.add('right',[5,6,7,8],10,true);
    this.player.direction = 'right';

    function setMelee(melee) {
        this.player.melee = melee;
        this.player.addChild(melee);
    }
}

function MeleeWeapon(x, y, sprite, damage, knockbackAmount, knockbackDirection){
    this.weapon = game.add.sprite(x,y,sprite);
    this.weapon.body.collideWorldBounds = true;
    this.damage = damage;
    this.knockbackAmount = knockbackAmount;
    this.knockbackDamage = knockbackDirection;
}


var p1 = new Player(0,1,null,null);
p1.setMelee(new MeleeWeapon(p1.player.x,p1.player.y,null,1,0.5,[-100,100]))