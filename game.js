// Error Handeler
window.onerror = function() { alert(Array.from(arguments)) };
// Production?
const production = true;
// Spritesheet thing
function Spritesheet(data) {
	this.data = data;
};
Spritesheet.prototype.draw = function(c, s, x, y, w, h) {
	if(!production) {
		c.strokeStyle	= 'black';
		c.lineWidth		= 2;
		c.strokeRect(x, y, w, h);
	};
	if(s in this.data)
		c.drawImage(this.data[this.data[s].img], this.data[s].x, this.data[s].y, this.data[s].w, this.data[s].h, x, y, w, h);
};
// Entities are useful
function Entity(texture, x, y, w, h) {
	this.t = texture;
	this.x = x-900;
	this.vX = 0.37;
	this.y = y;
	this.vY = -0.35;
	this.w = w;
	this.h = h;
};
Entity.prototype.draw = function(sprite, context) {
	sprite.draw(context, this.t, this.x, this.y, this.w, this.h);
};
Entity.prototype.tick = function(ms) {
	this.x += this.vX * ms;
	this.y += this.vY * ms;
	this.vY += ms / 3500;
	if(this.y > 210) this.vY = 0;
	if(this.vY == 0) this.vX *= 0.99;
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
	this.canvas.style.imageRendering = 'pixelated';
	this.canvas.width	= 960;
	this.canvas.height	= 540;
	this.x = 0;
};
Game.prototype.init = function() {
	this.entities	= [
		new Entity('paul-mccartney', -128, -64, 96, 192),
		new Entity('george-harrison', -256, -128, 96, 192),
		new Entity('john-lennon', -384, -192, 96, 192)
	];
	this.levels		= [];
	this.player		= new Entity('ringo-starr', 0, 0, 96, 192);
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
	this.context.fillStyle = '#0F9';
	this.context.fillRect(0, this.canvas.height * 0.75, this.canvas.width, this.canvas.height * 0.25);
	for(var e = 0; e < this.entities.length; e++)
		this.entities[e].draw(this.sprites, this.context);
	this.player.draw(this.sprites, this.context);
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
			'h'		: 46
		},
		'paul-mccartney': {
			'img'	: '-beatles-abbey-road',
			'x'		: 30,
			'y'		: 0,
			'w'		: 22,
			'h'		: 46
		},
		'ringo-starr': {
			'img'	: '-beatles-abbey-road',
			'x'		: 54,
			'y'		: 2,
			'w'		: 25,
			'h'		: 44
		},
		'john-lennon': {
			'img'	: '-beatles-abbey-road',
			'x'		: 81,
			'y'		: 0,
			'w'		: 25,
			'h'		: 46
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