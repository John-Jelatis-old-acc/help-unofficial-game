// Error Handeler
window.onerror = function() { alert(Array.from(arguments)) };
// Production?
const VERSION = {
	"PRODUCTION": !0,
	"VERSION"	: "1.0"
};
// Spritesheet thing
function Spritesheet(data) {
	this.data = data;
};
Spritesheet.prototype.draw = function(c, s, x, y, w, h) {
	if(!VERSION.PRODUCTION) {
		c.strokeStyle	= 'black';
		c.lineWidth		= 0.025;
		c.strokeRect(x, y, w, h);
	};
	if(s in this.data)
		c.drawImage(this.data[this.data[s].img], this.data[s].x, this.data[s].y, this.data[s].w, this.data[s].h, x, y, w, h);
};
// Entities are useful
function Entity(texture, x, y, w, h) {
	this.t = texture;
	this.x = x;
	this.vX = 0;
	this.y = y;
	this.vY = -0.2;
	this.w = w;
	this.h = h;
	this.r = 0;
};
Entity.prototype.draw = function(sprite, context) {
	context.save();
	context.translate(this.x + this.w / 2, this.y + this.h / 2);
	context.rotate(this.r);
	sprite.draw(context, this.t, -this.w / 2, -this.h / 2, this.w, this.h);
	context.restore();
};
Entity.prototype.tick = function(ms) {
	this.x += this.vX * ms;
	this.y += this.vY * ms;
	this.vY += ms / 7000;
	if(this.x > 90) this.r = Math.PI / 8;
	if(this.x > 98) this.r = Math.PI / 5;
	if(this.x > 100) this.r = Math.PI / 3;
	if(this.x > 101) this.r = Math.PI / 2;
	if(this.y + this.h > 75 && this.x < 100) {
		this.vY	= 0;
		this.y	= 75 - this.h;
		// this.vX	*= 0.99;
	}
};
// Make a Game class
function Game(sprites) {
	// Keeping track of Entities/level
	this.entities	= null;
	this.levels		= null;
	this.player		= null;
	// Tick-related stuff
	this.running	= false;
	this.lastTick	= null;
	// Render-related stuff
	this.canvas		= document.createElement('canvas');
	this.context	= this.canvas.getContext('2d');
	this.sprites	= new Spritesheet(sprites);
	// Other things
	this.canvas.width	= window.innerWidth;
	this.canvas.height	= window.innerHeight;
	this.canvas.style.imageRendering	= 'pixelated';
	this.context.imageSmoothingEnabled	= false;
};
Game.prototype.init = function() {
	this.entities	= [
		new Entity('paul-mccartney', 45, -64, 20, 38),
		new Entity('george-harrison', 20, -128, 20, 38),
		new Entity('john-lennon', -50, -192, 20, 38)
	];
	this.entities[2].vX = 0.01;
	this.levels		= [];
	this.player		= new Entity('ringo-starr', 70, 0, 20, 38);
	this.running = true;
	this.lastTick = new Date().getTime();
	document.body.appendChild(this.canvas);
};
Game.prototype.tick	= function() {
	if(this.running) {
		var time = new Date().getTime();
		for(var e = 0; e < this.entities.length; e++)
			this.entities[e].tick(time - this.lastTick);
		this.player.tick(time - this.lastTick);
		this.lastTick = time;
	}
};
Game.prototype.draw	= function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.save();
	this.context.scale(this.canvas.height / 100, this.canvas.height / 100);
	this.context.fillStyle = '#0F9';
	this.context.fillRect(0, 75, 100, 25);
	for(var e = 0; e < this.entities.length; e++)
		this.entities[e].draw(this.sprites, this.context);
	this.player.draw(this.sprites, this.context);
	this.context.restore();
};
// Intentionally make game public
var game = null;
// When DOM is loaded...
window.addEventListener('DOMContentLoaded', function(evt) {
	// Function only used on load
	var loadImg = function(url) { var a = new Image(); a.src = url; return a };
	// Set the title
	document.title = 'The Beatles - Help! (Unofficial Fan Game)';
	game = new Game({
		'-beatles-abbey-road': loadImg('img/beatles.png'),
		'george-harrison': {
			'img'	: '-beatles-abbey-road',
			'x'		: 0,
			'y'		: 0,
			'w'		: 25,
			'h'		: 45
		},
		'paul-mccartney': {
			'img'	: '-beatles-abbey-road',
			'x'		: 30,
			'y'		: 0,
			'w'		: 22,
			'h'		: 45
		},
		'ringo-starr': {
			'img'	: '-beatles-abbey-road',
			'x'		: 55,
			'y'		: 1,
			'w'		: 24,
			'h'		: 44
		},
		'john-lennon': {
			'img'	: '-beatles-abbey-road',
			'x'		: 81,
			'y'		: 0,
			'w'		: 25,
			'h'		: 45
		}
	});
});
// When page content is loaded...
window.addEventListener('load', function(evt) {
	// Initialize the `game`
	game.init();
	setTimeout(function() {
		// Remove the `loading` class from <body>
		document.body.classList.remove('loading');
		setTimeout(function() {
			setInterval(function() {
				game.draw();
				game.tick();
			});
		}, 1150);
	}, 350);
});
// Before the page is unloaded...
window.addEventListener('beforeunload', function(evt) {
	// Save data (so that the latest is always loaded next time)
	game.saveData();
});