// Error Handeler
window.onerror = function() { alert(Array.from(arguments)) };
// Production?
var VERSION = {
	"PRODUCTION": true,
	"VERSION"	: "1.1"
};
// Useful function
var loadImg = function(url) { var a = new Image(); a.src = url; return a };



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
	this.sX = 1;
	this.sY = 1;
	this.oG = false;
	this.drag = false;
	this.lives = 3;
	this.keys = {}; // for controllable entities, or emulating on others
};
Entity.prototype.draw = function(sprite, context, pX) {
	context.save();
	context.translate(this.x + this.w / 2 - pX + context.canvas.width*50/context.canvas.height, this.y + this.h / 2);
	context.rotate(this.r);
	context.scale(this.sX, this.sY);
	sprite.draw(context, this.t, -this.w / 2, -this.h / 2, this.w, this.h);
	context.restore();
};
Entity.prototype.tick = function(ms, entities, blocks) {
	// Being dragged?
	if(this.drag) {
		this.vX = 0;
		this.vY = 0;
	}
	// Update
	this.x += this.vX * ms;
	this.y += this.vY * ms;
	this.vY += ms / 7000;
	if(this.vX < 0)
		this.sX = -Math.abs(this.sX);
	if(this.vX > 0)
		this.sX = +Math.abs(this.sX);
	this.vX = ('d' in this.keys || 'a' in this.keys) ?
		((1 + (this.keys.shift || 0)) * ((this.keys.a || 0) + (this.keys.d || 0))) : this.vX;
	if(this.oG && this.keys.w)
		this.vY = this.keys.w;
	// Check for collisions
	this.oG = false;
	if(this.y > 100) {
		this.lives --;
		this.vY = -0.05;
		this.y = 10;
		this.x = 10;
	}
	for(var b = 0; b < blocks.length; b++) {
		var check_vX = (
			(this.vX != 0) && 
			blocks[b].check(
				this.x + this.vX,
				this.y + ((this.x - blocks[b].x) * blocks[b].m),
				this.w,
				this.h
			)
		), check_vY = (this.vY != 0) && blocks[b].check(
			this.x + this.vX,
			this.y + this.vY,
			this.w, this.h
		);
		// Check for velX
		if(check_vX) {
			this.vX = 0;
		}
		// Check for velY
		if(check_vY) {
			this.vY = 0;
			this.y = blocks[b].y + (blocks[b].m * (this.x - blocks[b].x)) - this.h;
		}
		// But either way
		if(check_vX || check_vY) {
			this.oG = true;
		}
	}
};

// Player
function Player(texture, x, y, w, h) {
	// super()
	Entity.prototype.constructor(texture, x, y, w, h);
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;
Player.prototype.draw = function(sprite, context) {
	context.save();
	context.translate(context.canvas.width * 50 / context.canvas.height, this.y + this.h / 2);
	context.rotate(this.r);
	context.scale(this.sX, this.sY);
	sprite.draw(context, this.t, -this.w / 2, -this.h / 2, this.w, this.h);
	context.restore();
};



// Platforms
function Block(d) {
	this.x = d.x || 0;
	this.y = d.y || 0;
	this.w = d.w || 0;
	this.h = d.h || 0;
	this.m = d.m || 0;
	this.c = d.c || '#0F9';
};
Block.prototype.check = function(x, y, w, h) {
	return (
		x - w / 2 < this.x + this.w &&
		x + w / 2 > this.x &&
		y + h > this.y + (this.m * (x - this.x)) &&
		y < this.y + (this.m * (x - this.x)) + this.h
	);
};
Block.prototype.draw = function(ctx, pX) {
	var xU = ctx.canvas.width / ctx.canvas.height,
		offset = (-pX + 50 * xU);
	if(offset + this.x + this.w < 0 || offset + this.x > 100 * xU)
		return;
	ctx.save();
	ctx.translate(offset, 0);
	ctx.fillStyle = this.c;
	ctx.beginPath();
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x + this.w, this.y + (this.m * this.w));
	ctx.lineTo(this.x + this.w, this.y + (this.m * this.w) + this.h);
	ctx.lineTo(this.x, this.y + this.h);
	ctx.lineTo(this.x, this.y);
	ctx.fill();
	ctx.lineWidth = 0.025 * Math.min(this.h, this.w);
	ctx.lineWidth = Math.max(0.25, ctx.lineWidth);
	ctx.stroke();
	ctx.restore();
};



// Buttons
function Button(x, y, w, h, s, func) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.s = new Spritesheet(s);
	this.m = 'normal';
	this.click = func || this.click;
};
Button.prototype.draw = function(ctx) {
	this.s.draw(ctx, this.m, this.x, this.y, this.w, this.h);
};
Button.prototype.check = function(x, y) {
	return (x > this.x && x < this.x + this.w
		 && y > this.y && y < this.y + this.h);
};
Button.prototype.click = function(g) {
	alert('No function defined for click event');
};



// Make a Game class
function Game() {
	// Keeping track of Entities/level
	this.entities	= null;
	this.buttons	= null;
	this.levels		= null;
	this.level		= 0;
	this.player		= null;
	// Tick-related stuff
	this.running	= false;
	this.lastTick	= null;
	// Render-related stuff
	this.fpsFrame	= 0;
	this.fpsFps		= 0;
	this.fpsLastUp	= new Date().getTime();
	this.canvas		= document.createElement('canvas');
	this.context	= this.canvas.getContext('2d');
	this.sprites	= new Spritesheet({
		'-beatles-abbey-road': loadImg('img/beatles.png'),
		'-menu-ui'	: loadImg('img/button/menu.png'),
		'-cursor': loadImg('img/icon/cursor.png'),
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
			'y'		: 0,
			'w'		: 24,
			'h'		: 45
		},
		'john-lennon': {
			'img'	: '-beatles-abbey-road',
			'x'		: 81,
			'y'		: 0,
			'w'		: 25,
			'h'		: 45
		},
		'corner-top-left': {
			'img'	: '-menu-ui',
			'x'		: 0,
			'y'		: 0,
			'w'		: 8,
			'h'		: 8
		},
		'corner-top-right': {
			'img'	: '-menu-ui',
			'x'		: 16,
			'y'		: 0,
			'w'		: 8,
			'h'		: 8
		},
		'corner-btm-left': {
			'img'	: '-menu-ui',
			'x'		: 0,
			'y'		: 16,
			'w'		: 8,
			'h'		: 8
		},
		'corner-btm-right': {
			'img'	: '-menu-ui',
			'x'		: 16,
			'y'		: 16,
			'w'		: 8,
			'h'		: 8
		},
		'side-top'	: {
			'img'	: '-menu-ui',
			'x'		: 8,
			'y'		: 0,
			'w'		: 8,
			'h'		: 8
		},
		'side-left'	: {
			'img'	: '-menu-ui',
			'x'		: 0,
			'y'		: 8,
			'w'		: 8,
			'h'		: 8
		},
		'side-right': {
			'img'	: '-menu-ui',
			'x'		: 16,
			'y'		: 8,
			'w'		: 8,
			'h'		: 8
		},
		'side-btm'	: {
			'img'	: '-menu-ui',
			'x'		: 8,
			'y'		: 16,
			'w'		: 8,
			'h'		: 8
		},
		'menu-fill'	: {
			'img'	: '-menu-ui',
			'x'		: 8,
			'y'		: 8,
			'w'		: 8,
			'h'		: 8
		},
		'menu-cross'	: {
			'img'	: '-menu-ui',
			'x'		: 24,
			'y'		: 0,
			'w'		: 8,
			'h'		: 8
		},
		'menu-minus': {
			'img'	: '-menu-ui',
			'x'		: 24,
			'y'		: 8,
			'w'		: 8,
			'h'		: 8
		},
		'normal-up': {
			'img': '-cursor',
			'x': 0,
			'y': 0,
			'w': 12,
			'h': 12
		},
		'normal-down': {
			'img': '-cursor',
			'x': 12,
			'y': 0,
			'w': 12,
			'h': 12
		},
		'hover-up': {
			'img': '-cursor',
			'x': 0,
			'y': 12,
			'w': 12,
			'h': 12
		},
		'hover-down': {
			'img': '-cursor',
			'x': 12,
			'y': 12,
			'w': 12,
			'h': 12
		}
	});
	// Other things
	this.canvas.width	= window.innerWidth;
	this.canvas.height	= window.innerHeight;
	this.canvas.style.imageRendering	= 'pixelated';
	this.context.imageSmoothingEnabled	= false;
	// Mouse data
	this.mX = 0;
	this.mY = 0;
	this.mD = false;
	this.mH = false;
	// Events
	var self = this;
	this.canvas.addEventListener('mouseup', function(e) {
		self.mD = false;
		self.mX = e.pageX * 100 / window.innerHeight - 1;
		self.mY = e.pageY * 100 / window.innerHeight - 1;
	});
	this.canvas.addEventListener('mousedown', function(e) {
		self.mD = true;
		self.mX = e.pageX * 100 / window.innerHeight - 1;
		self.mY = e.pageY * 100 / window.innerHeight - 1;
		var mX_a = -self.canvas.width * 50 / self.canvas.height + 
				self.player.x + self.mX;
		for(var e = 0; e < self.entities.length; e++) {
			if(self.entities[e].x - self.entities[e].w / 1 < mX_a &&
			   self.entities[e].x + self.entities[e].w / 1 > mX_a &&
			   self.entities[e].y < self.mY &&
			   self.entities[e].y + self.entities[e].h > self.mY) {
				self.entities[e].drag = true;
				self.drag = self.entities[e];
				return;
			}
		}
	});
	this.canvas.addEventListener('click', function(e) {
		self.mX = e.pageX * 100 / window.innerHeight - 1;
		self.mY = e.pageY * 100 / window.innerHeight - 1;
		for(var b = 0; b < self.buttons.length; b++) {
			if(self.buttons[b].check(
				e.pageX * 100 / window.innerHeight,
				e.pageY * 100 / window.innerHeight
			)) {
				self.buttons[b].click(self);
			}
		}
	});
	this.canvas.addEventListener('mousemove', function(e) {
		e.preventDefault();
		self.mX = e.pageX * 100 / window.innerHeight - 1;
		self.mY = e.pageY * 100 / window.innerHeight - 1;
		self.mH = false;
		for(var b = 0; b < self.buttons.length; b++) {
			var hovering = self.buttons[b].check(
				e.pageX * 100 / window.innerHeight,
				e.pageY * 100 / window.innerHeight
			);
			self.buttons[b].m = hovering ? 'hover' : 'normal';
			if(hovering) self.mH = true;
		}
	});
	this.canvas.addEventListener('touchend', function(e) {
		self.mD = false;
		self.mX = e.changedTouches[0].pageX * 100 / window.innerHeight - 1;
		self.mY = e.changedTouches[0].pageY * 100 / window.innerHeight - 1;
	});
	this.canvas.addEventListener('touchstart', function(e) {
		self.mD = true;
		self.mX = e.changedTouches[0].pageX * 100 / window.innerHeight - 1;
		self.mY = e.changedTouches[0].pageY * 100 / window.innerHeight - 1;
		var mX_a = -self.canvas.width * 50 / self.canvas.height + 
				self.player.x + self.mX;
		for(var e = 0; e < self.entities.length; e++) {
			if(self.entities[e].x - self.entities[e].w / 1 < mX_a &&
			   self.entities[e].x + self.entities[e].w / 1 > mX_a &&
			   self.entities[e].y < self.mY &&
			   self.entities[e].y + self.entities[e].h > self.mY) {
				self.entities[e].drag = true;
				self.drag = self.entities[e];
				return;
			}
		}
	});
	this.canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		self.mX = e.changedTouches[0].pageX * 100 / window.innerHeight - 1;
		self.mY = e.changedTouches[0].pageY * 100 / window.innerHeight - 1;
		self.mH = false;
		for(var b = 0; b < self.buttons.length; b++) {
			var hovering = self.buttons[b].check(
				e.pageX * 100 / window.innerHeight,
				e.pageY * 100 / window.innerHeight
			);
			self.buttons[b].m = hovering ? 'hover' : 'normal';
			if(hovering) self.mH = true;
		}
	});
};
Game.prototype.init = function() {
	this.entities	= [
		new Entity('paul-mccartney', 45, -64, 10, 19),
		new Entity('george-harrison', 20, -128, 10, 19),
		new Entity('john-lennon', -50, -192, 10, 19)
	];
	this.buttons	= [
		new Button(4, 4, 12, 12, {
			'-button-pause': loadImg('img/button/fullscreen.png'),
			'normal': {
				'img': '-button-pause',
				'x': 0,
				'y': 0,
				'w': 16,
				'h': 16
			},
			'hover': {
				'img': '-button-pause',
				'x': 0,
				'y': 16,
				'w': 16,
				'h': 16
			}
		}, function(g) {
			if(!document.fullscreenElement)
				document.body.requestFullscreen()
			else
				document.exitFullscreen();
		}),
		new Button(20, 4, 12, 12, {
			'-button-pause': loadImg('img/button/pause.png'),
			'normal': {
				'img': '-button-pause',
				'x': 0,
				'y': 0,
				'w': 16,
				'h': 16
			},
			'hover': {
				'img': '-button-pause',
				'x': 0,
				'y': 16,
				'w': 16,
				'h': 16
			}
		}, function(g) {
			g.running = !g.running;
		})
	];
	this.entities[2].vX = 0.02;
	this.levels		= [{
		'blocks': [
			new Block({
				'x': -50,
				'y': 75,
				'w': 145,
				'h': 25,
				'm': 0,
				'c': '#0F9'
			}),
			new Block({
				'x': 100,
				'y': 75,
				'w': 45,
				'h': 25,
				'm': -0.256,
				'c': '#0D7'
			}),
			new Block({
				'x': 150,
				'y': 75,
				'w': 45,
				'h': 25,
				'm': -0.384,
				'c': '#0C6'
			}),
			new Block({
				'x': 200,
				'y': 75,
				'w': 45,
				'h': 25,
				'm': -0.512,
				'c': '#0B5'
			}),
			new Block({
				'x': 250,
				'y': 75,
				'w': 45,
				'h': 25,
				'm': -1.024,
				'c': '#0A4'
			}),
			new Block({
				'x': 300,
				'y': 75,
				'w': 45,
				'h': 25,
				'm': -1.536,
				'c': '#093'
			})
		]
	}];
	this.player		= new Player('ringo-starr', 70, 0, 10, 19);
	this.running	= true;
	this.lastTick	= new Date().getTime();
	document.body.appendChild(this.canvas);
};
Game.prototype.tick	= function() {
	var time = new Date().getTime();
	if(!document.hasFocus())
		this.running = false;
	if(this.running) {
		for(var e = 0; e < this.entities.length; e++)
			this.entities[e].tick(time - this.lastTick, this.entities, this.levels[this.level].blocks);
		this.player.tick(time - this.lastTick, this.entities, this.levels[this.level].blocks);
	}
	if(this.drag) {
		if(this.mD) {
			this.drag.x = -this.canvas.width * 50 / this.canvas.height + 
				this.player.x + this.mX - this.drag.w / 2;
			this.drag.y = this.mY - this.drag.h / 2;
		} else {
			this.drag.drag = false;
			this.drag = null;
		};
	}
	this.lastTick = time;
};
Game.prototype.draw	= function() {
	// FPS Counter
	this.fpsFrame++;
	var t = new Date().getTime();
	// Every half second update number
	if(t > this.fpsLastUp + 499) {
		this.fpsLastUp = t;
		// Adjust for the fact that this is for a half a second
		this.fpsFPS = this.fpsFrame * 2;
		this.fpsFrame = 0;
	}
	this.context.lineWidth = 1.25;
	// If resolution changed, resize canvas
	// Otherwise don't set, as that adds lag
	if(this.canvas.width	!= window.innerWidth)
		this.canvas.width	 = window.innerWidth;
	if(this.canvas.height	!= window.innerHeight)
		this.canvas.height	 = window.innerHeight;
	// Prevent blur
	this.context.imageSmoothingEnabled	= false;
	// Render
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.save();
	this.context.scale(this.canvas.height / 100, this.canvas.height / 100);
	for(var p = 0; p < this.levels[this.level].blocks.length; p++)
		this.levels[this.level].blocks[p].draw(this.context, this.player.x);
	for(var e = 0; e < this.entities.length; e++)
		this.entities[e].draw(this.sprites, this.context, this.player.x);
	this.player.draw(this.sprites, this.context);
	for(var b = 0; b < this.buttons.length; b++)
		this.buttons[b].draw(this.context);
	this.context.fillStyle		= '#0F9';
	this.context.strokeStyle	= '#041';
	this.context.font			= '10px \'I Do Not Know\'';
	var xU	= this.canvas.width / this.canvas.height,
		msg	= [
			'FPS: ' + this.fpsFPS,
			'LIVES: ' + this.player.lives,
			'LEVEL: ' + (this.level + 1)
		];
	var _msg = msg[Math.floor(new Date().getTime() / 7500) % msg.length] + ' ';
	this.context.strokeText(_msg, xU * 100 - this.context.measureText(_msg).width, 12);
	this.context.fillText(_msg, xU * 100 - this.context.measureText(_msg).width, 12);
	if(this.player.lives <= 0)
		this.running = false;
	if(!this.running) {
		var paused	= this.player.lives <= 0 ? 'Game Over' : 'Paused',
			tips	= [
				'Do not die',
				'Surviving is key',
				'If you die, I\'ll kill you',
				'If you fall to your death, you die'
			], t = tips[Math.floor(new Date().getTime() / 10000) % tips.length];
		this.sprites.draw(this.context, 'menu-fill', xU * 20 + 10, 30, xU * 60 - 10, 60);
		this.sprites.draw(this.context, 'corner-top-left', xU * 20, 20, 10, 10);
		this.sprites.draw(this.context, 'side-top', xU * 20 + 10, 20, xU * 60 - 10, 10);
		this.sprites.draw(this.context, 'corner-top-right', xU * 80, 20, 10, 10);
		this.sprites.draw(this.context, 'side-left', xU * 20, 30, 10, 50);
		this.sprites.draw(this.context, 'corner-btm-left', xU * 20, 80, 10, 10);
		this.sprites.draw(this.context, 'side-right', xU * 80, 30, 10, 50);
		this.sprites.draw(this.context, 'corner-btm-right', xU * 80, 80, 10, 10);
		this.sprites.draw(this.context, 'side-btm', xU * 20 + 10, 80, xU * 60 - 10, 10);
		if(this.mX < xU * 80 + 5 && this.mX > xU * 80 - 5 &&
		   this.mY > 25 && this.mY < 35) {
			this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
			this.context.fillRect(xU * 80 - 5, 25, 10, 10);
			if(this.mD) {
				this.running = true;
			};
		}
		this.sprites.draw(this.context, 'menu-cross', xU * 80 - 5, 25, 10, 10);
		this.context.fillStyle		= '#F90';
		this.context.strokeStyle	= '#410';
		this.context.lineWidth		= 1.3;
		this.context.font			= '10px \'I Do Not Know\'';
		this.context.strokeText(paused, xU * 50 - (this.context.measureText(paused).width / 2), 47.5);
		this.context.fillText(paused, xU * 50 - (this.context.measureText(paused).width / 2), 47.5);
		this.context.fillStyle		= '#960';
		this.context.strokeStyle	= '#640';
		this.context.lineWidth		= 0.65;
		this.context.font			= '3.5px \'I Do Not Know\'';
		this.context.strokeText(t, xU * 50 - (this.context.measureText(t).width / 2), 57);
		this.context.fillText(t, xU * 50 - (this.context.measureText(t).width / 2), 57);
	};
	this.sprites.draw(
		this.context,
		(this.mH ? 'hover' : 'normal') + (this.mD ? '-down' : '-up'), 
		this.mX, 
		this.mY, 
		5,
		5
	);
	this.context.restore();
};




// Intentionally make game public
var game = null;

// When DOM is loaded...
window.addEventListener('DOMContentLoaded', function(evt) {
	// Set the title
	document.title = 'The Beatles - Help! (Unofficial Fan Game)';
	game = new Game();
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
window.addEventListener('keydown', function(evt) {
	if(!('player' in game || 'keys' in game.player || game.player.keys instanceof Object))
		return;
	switch(evt.key) {
		case 'd':
		case 'D':
			game.player.keys.d	= 0.0375;
			break;
		case 'a':
		case 'A':
			game.player.keys.a	= -0.0375;
			break;
		case 'w':
		case 'W':
			game.player.keys.w	= -0.085;
			break;
		case 'Shift':
			game.player.keys.shift	= true;
			break;
	}
});
window.addEventListener('keyup', function(evt) {
	if(!('player' in game || 'keys' in game.player || game.player.keys instanceof Object))
		return;
	switch(evt.key || evt.code) {
		case 'd':
		case 'D':
			game.player.keys.d	= 0;
			break;
		case 'a':
		case 'A':
			game.player.keys.a	= 0;
			break;
		case 'w':
		case 'W':
			game.player.keys.w	= 0;
			break;
		case 'Shift':
			game.player.keys.shift	= false;
			break;
	}
});