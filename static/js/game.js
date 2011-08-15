var TILE_SIZE = 64,
	ZOOM = 1;

function GfxEngine (gameArea, clippingWidth, clippingHeight) {
	var _background = document.createElement('canvas'),
		_backgroundContext = _background.getContext('2d'),
		_canvas = document.createElement('canvas'),
		_context = _canvas.getContext('2d'),
		_focus = undefined,
		_drawables = [],

		_clipX = 0,
		_clipY = 0;

	_canvas.width = clippingWidth;
	_canvas.height = clippingHeight;

	gameArea.append(_background);
	gameArea.append(_canvas);

	var _backgroundDom = $(_background);
	var _canvasDom = $(_canvas);

	var _startDrawing = function() {
		
		function _draw(timestamp) {
			_context.clearRect(0, 0, clippingWidth, clippingHeight);

			//calculate difference since last repaint
			var drawStart = (timestamp || Date.now()),
			diff = drawStart - startTime;

			var startX = _focus.getX() - clippingWidth / 2,
				startY = _focus.getY() - clippingHeight / 2;

			_backgroundDom.css('left', -1 * startX);
			_backgroundDom.css('top', -1 * startY);

			for (var i = 0; i < _drawables.length; i++) {
				var d = _drawables[i];
				d.update();
				var x = d.getX() - startX,
					y = d.getY() - startY;
				if(x >= 0 && x < clippingWidth && y >= 0 && y < clippingWidth) {
					_context.drawImage(
						d.getImage(),
						x, y
					);
				}
			};

			_focus.update();
			_context.drawImage(
				_focus.getImage(),
				_focus.getX() - startX,
				_focus.getY() - startY
			);
			/* console.log(
				"Focus",
				_focus.getX(),
				_focus.getY(),
				_focus.getX() - startX,
				_focus.getY() - startY
			); */

			//reset startTime to this repaint
			startTime = drawStart;

			//draw again
			requestAnimationFrame(_draw);
		}

		var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame,
			startTime = window.mozAnimationStartTime || Date.now();
		requestAnimationFrame(_draw);
	};

	return {
		setBackground: function(drawable) {
			var image = drawable.getImage();
			_background.width = image.width;
			_background.height = image.height;
			_backgroundContext.drawImage(image, 0, 0);
		},
		setFocus: function(drawable) {
			_focus = drawable;
		},
		addDrawable: function(drawable) {
			_drawables[_drawables.length] = drawable;
		},
		start: function() {
			_context.scale(ZOOM, ZOOM);
			_startDrawing();
		}
	}
};

function Drawable(image, x, y) {
	var _originalImage = image,
		_image = document.createElement('canvas'),
		_context = _image.getContext('2d'),
		_x = x,
		_y = y,
		_animationX = _x,
		_animationY = _y;

	_image.width = image.width;
	_image.height = image.height;
	_context.drawImage(image, 0, 0);

	return {
		update: function(diff) {
			if (_x > _animationX){ 
				_animationX += 1;
			}
			if (_x < _animationX) {
				_animationX -= 1;
			}	
			if (_y > _animationY) {
				_animationY += 1;
			}
			if (_y < _animationY) {
				_animationY -= 1;
			}
		},
		getImage: function() {
			return _image;
		},
		getX: function() { return _animationX; },
		getY: function() { return _animationY; },
		goTo: function(x, y) {
			if ( x != _x) {
				_context.save();

				_context.clearRect(0, 0, _image.width, _image.height);
				if (x > _x) {
					_context.scale(1, 1);
				} if (x < _x) {
					_context.translate(_image.width, 0);
					_context.scale(-1, 1);
				}

				_context.drawImage(_originalImage, 0, 0);

				_context.restore();
			}

			_x = x;
			_y = y;
		}
	}
}

function Map(map) {
	// build a Drawable from a matrix of tile types
	var canvas = document.createElement('canvas'),
		context;
	
	canvas.width = map.length * TILE_SIZE;
	canvas.height = map[0].length * TILE_SIZE;
	context = canvas.getContext('2d');
	
	for (var ix = 0; ix < map.length; ix++) {
		var x = ix * TILE_SIZE;

		for (var iy = 0; iy < map[0].length; iy++) {
			var y = iy * TILE_SIZE;

			var tileType = map[ix][iy];
			var tile = Game.mapTiles[tileType];

			if (tileType == 'Wall') {
				var upTileType = map[ix][iy - 1];
				var downTileType = map[ix][iy + 1];
				if (downTileType != 'Wall') {
					if (downTileType != undefined) {
						tile = Game.mapTiles[tileType + "_front"];
						if (upTileType == undefined) {
							context.drawImage(Game.mapTiles[tileType].getImage(), x, y - TILE_SIZE);				
						}
					}
				} else if (downTileType == undefined) {
					context.drawImage(Game.mapTiles[tileType + "_front"].getImage(), x, y + TILE_SIZE);
				}
			}

			if (tile != undefined)
				context.drawImage(tile.getImage(), x, y);

		};
	};

	return new Drawable(canvas, 0, 0);
};

function Tile(image, style) {
	var _canvas = document.createElement('canvas'),
		_context;
	_canvas.width = image.width * TILE_SIZE / image.width;
	_canvas.height = image.height * TILE_SIZE / image.height;
	_context = _canvas.getContext('2d');

	style = style || 'fill';

	switch(style) {
		case 'repeat':
			_context.fillStyle = _context.createPattern(image, "repeat");
			_context.fillRect(0, 0, _canvas.width, _canvas.height);
			break;
		case 'fill':
			_context.scale(TILE_SIZE / image.width, TILE_SIZE / image.height)
			_context.drawImage(image, 0, 0);
			break;
	}

	return {
		getImage: function() {
			return _canvas;
		}
	}
};

function TileSet(image, tileSize) {
	// let's work directly with the pixels, not with parts of the image

	// create a temporary canvas to load the image. There is no need to append it
	// directly to the DOM to access to the data we need.
	var _canvas = document.createElement('canvas');
	_canvas.width = image.width;
	_canvas.height= image.height;
	var _context = _canvas.getContext('2d')
	_context.drawImage(image, 0, 0);

	var _makeImage = function(x, y, width, height) {
		var canvas = document.createElement('canvas'),
			context = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		context.putImageData(_context.getImageData(x, y, width, height), 0, 0);
		return canvas;
	};

	return {
		makeTile: function(id, x, y, width, height, style) {
			this[id] = Tile(_makeImage(x, y, width, height), style);
		}
	}
};


var Game = function() {
	var _gameArea = $('#gamearea');
	var _gfxEngine = GfxEngine(_gameArea, _gameArea.width(), _gameArea.height());

	var _creatureTiles = TileSet($('#tiles .creatures')[0], TILE_SIZE);
	_creatureTiles.makeTile('troll', 502, 176, 44, 48);
	_creatureTiles.makeTile('player', 802, 134, 32, 32);

	var _mapTiles = TileSet($('#tiles .map')[0], TILE_SIZE);
	_mapTiles.makeTile('StairUp', 960, 1088, 32, 32);
	_mapTiles.makeTile('StairDown', 960, 1120, 32, 32);
	_mapTiles.makeTile('Treasure', 992, 1600, 32, 32);
	_mapTiles.makeTile('Wall', 832, 32 + 160, 64, 64);
	_mapTiles.makeTile('Wall_front', 832, 96 + 160, 64, 64);
	_mapTiles.makeTile('Walkable', 480, 128, 32, 32, 'repeat');
	_mapTiles.makeTile('WalkableFeature1', 480, 160, 32, 32);
	_mapTiles.makeTile('WalkableFeature2', 288, 1728, 32, 64);
	_mapTiles.makeTile('WalkableFeature3', 288, 1792, 32, 32);
	_mapTiles.makeTile('WalkableFeature4', 768, 1856, 32, 64);
	_mapTiles.makeTile('WalkableFeature5', 800, 1856, 32, 64);
	_mapTiles.makeTile('WalkableFeature6', 832, 1856, 32, 64);
	_mapTiles.makeTile('WalkableFeature7', 864, 1856, 32, 64);

	var _map = undefined,
		_player = undefined,
		_monsters = undefined;

	$('body').append('<iframe src="/play" style="display:none;"></script>');

	$(window).keydown(function(e) {
		console.log(e.which);
	    switch (e.which) {
	    	case 13:
				$.ajax('/interact/');
				break;
	    	case 27:
				e.stopPropagation();
				e.preventDefault();
				return false;
			case 37:
			case 38:
			case 39:
			case 40:
				var directions = {
					37: 'left',
					38: 'up',
					39: 'right',
					40: 'down',
				};
				$.ajax('/move/' + directions[e.which]);
				break;
	    }

	});

	return {
		mapTiles: _mapTiles,
		creatureTiles: _creatureTiles,
		setMap: function(map) {
			_gfxEngine.setBackground(Map(map));
		},
		setLifeOnLevel: function(lifeOnLevel) {
			// console.log(lifeOnLevel.player);
			if (_player == undefined) {
				_player = new Drawable(
					_creatureTiles.player.getImage(), 
					lifeOnLevel.player[1] * TILE_SIZE, 
					lifeOnLevel.player[2] * TILE_SIZE
				);
				_gfxEngine.setFocus(_player);
			} else {
				_player.goTo(lifeOnLevel.player[1] * TILE_SIZE, lifeOnLevel.player[2] * TILE_SIZE);
			}

			if (_monsters == undefined) {
				_monsters = {};
				for (var i = 0; i < lifeOnLevel.monsters.length; i++) {
					var m = lifeOnLevel.monsters[i];
					_monsters[m[1]] = new Drawable(
						_creatureTiles.troll.getImage(),
						m[2] * TILE_SIZE,
						m[3] * TILE_SIZE
					);
					_gfxEngine.addDrawable(_monsters[m[1]]);
				};
			} else {
				for (var i = 0; i < lifeOnLevel.monsters.length; i++) {
					var m = lifeOnLevel.monsters[i];
					_monsters[m[1]].goTo(
						m[2] * TILE_SIZE,
						m[3] * TILE_SIZE
					);
				}
			}

			if (_monsters != undefined && _player != undefined) {
				_gfxEngine.start();
			}
		},
		text: function(text) {
			console.log(text);
		}
	}
}();

/*
var TILE_SIZE =32,
	MINIMAP_TILE_SIZE = 4,
   
    MAX_LEVEL_TILES_X = 60,
    MAX_LEVEL_TILES_Y = 60,

    scale = 2,

    viewport = Object(),
	canvas = Object(),
    tile = Object(),
	
	tileTypes = Object(),
	tileTypesGfx = {},

	levelTiles,
	enemyTiles,

	currentLevel,
	currentLifeOnLevel,

	consoleBuffer = [],

	currentFrame = 0,
	lastTextFrame = 0;

function initGame (viewportId) {
	viewport.domNode = $('#' + viewportId);
	viewport.width = viewport.domNode.width();
	viewport.height = viewport.domNode.height();
	
	canvas.domNode = viewport.domNode.find('.viewport');
	canvas.context = canvas.domNode[0].getContext('2d');

	var viewportMinSize = Math.min(viewport.domNode.width(), viewport.domNode.height());

	// canvas.domNode.attr('width', TILE_SIZE * MAX_LEVEL_TILES_X);
	// canvas.domNode.attr('height', TILE_SIZE * MAX_LEVEL_TILES_Y);
	// canvas.width = TILE_SIZE * MAX_LEVEL_TILES_X;
	// canvas.height = TILE_SIZE * MAX_LEVEL_TILES_Y;
	
	canvas.domNode.attr('width', viewport.width);
	canvas.domNode.attr('height', viewport.height);
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	
	console.log("Game area", viewport, 'width', viewport.width, 'height', viewport.height);
	console.log('tile size', TILE_SIZE);
	
	var playIframe = $('<iframe src="/play" style="display:none;"></script>');	
	$('body').append(playIframe);

	$(window).keydown(function(e) {
		console.log(e.which);
	    switch (e.which) {
	    	case 13:
				$.ajax('/interact/');
				break;
	    	case 27:
				e.stopPropagation();
				e.preventDefault();
				return false;
			case 37:
			case 38:
			case 39:
			case 40:
				var directions = {
					37: 'left',
					38: 'up',
					39: 'right',
					40: 'down',
				};
				$.ajax('/move/' + directions[e.which]);
				break;
	    }

	});

	$(document).mousewheel(zoom);

	tileTypes.stairUp = 'StairUp',
	tileTypes.stairDown = 'StairDown',
	tileTypes.treasure = 'Treasure',
	tileTypes.trap = 'Trap',
	tileTypes.monster = 'Monster',
	tileTypes.wall = 'Wall',
	tileTypes.walkable = 'Walkable',
	tileTypes.walkableFeature1 = 'walkableFeature1',
	tileTypes.walkableFeature2 = 'walkableFeature2',
	tileTypes.walkableFeature3 = 'walkableFeature3',
	tileTypes.walkableFeature4 = 'walkableFeature4',
	tileTypes.door = 'Door';
	tileTypes.player = 'Player';

	levelTiles = $('#tiles .level')[0];
	enemyTiles = $('#tiles .enemies')[0];

	tileTypesGfx[tileTypes.stairUp] = [levelTiles, 960, 1088, 32, 32, _drawTileScaled];
	tileTypesGfx[tileTypes.stairDown] = [levelTiles, 960, 1120, 32, 32, _drawTileScaled];
	tileTypesGfx[tileTypes.treasure] = [levelTiles, 992, 1600, 32, 32, _drawTileCentered];
	tileTypesGfx[tileTypes.trap] = [];
	tileTypesGfx[tileTypes.monster] = [enemyTiles, 502, 176, 44, 48, _drawTileCentered];
	tileTypesGfx[tileTypes.wall] = [levelTiles, 830, 32 + 160, 64, 64, _drawTileScaled];
	tileTypesGfx[tileTypes.wall + "_front"] = [levelTiles, 830, 96 + 160, 64, 64, _drawTileScaled];
	tileTypesGfx[tileTypes.walkable] = [levelTiles, 480, 128, 32, 32, _drawTileRepeated];
	tileTypesGfx[tileTypes.walkableFeature1] = [levelTiles, 480, 160, 32, 32, _drawTileCentered];
	tileTypesGfx[tileTypes.walkableFeature2] = [levelTiles, 288, 1728, 32, 64, _drawTileCentered];
	tileTypesGfx[tileTypes.walkableFeature3] = [levelTiles, 288, 1792, 32, 32, _drawTileCentered];
	tileTypesGfx[tileTypes.walkableFeature4] = [levelTiles, 768, 1856, 32, 64, _drawTileCentered];
	tileTypesGfx[tileTypes.walkableFeature5] = [levelTiles, 800, 1856, 32, 64, _drawTileCentered];
	tileTypesGfx[tileTypes.walkableFeature6] = [levelTiles, 832, 1856, 32, 64, _drawTileCentered];
	tileTypesGfx[tileTypes.walkableFeature7] = [levelTiles, 864, 1856, 32, 64, _drawTileCentered];
	tileTypesGfx[tileTypes.door] = [];
	tileTypesGfx[tileTypes.player] = [enemyTiles, 802, 134, 32, 32, _drawTileCentered];
	
}

function setCurrentLevel(level) {
	currentLevel = level;

	for (var ix = 0; ix < MAX_LEVEL_TILES_X; ix++) {
		for (var iy = 0; iy < MAX_LEVEL_TILES_Y; iy++) {
			var tiles = currentLevel[ix][iy];
			for (var i = 0; i < tiles.length; i++){
				var tile = tiles[i];
				if (tile == tileTypes.walkable) {
					if (rand(0,100) > 90) {
						currentLevel[ix][iy] = [tile, tileTypes.walkableFeature1].concat(tiles.slice(i+1));
					} else if (rand(0,100) > 98) {
						
						var feature = [
							tileTypes.walkableFeature2, 
							tileTypes.walkableFeature3, 
							tileTypes.walkableFeature4, 
							tileTypes.walkableFeature5, 
							tileTypes.walkableFeature6, 
							tileTypes.walkableFeature7 							
						][rand(0,5)];
						currentLevel[ix][iy] = [tile, feature].concat(tiles.slice(i+1));
						break;
					}
				}
			}
		}
	}
}

function text(text) {
	if (text)
		consoleBuffer[consoleBuffer.length] = text;

	draw(currentLifeOnLevel);

	lastTextFrame = currentFrame;
}

function draw(lifeOnLevel) {
	currentLifeOnLevel = lifeOnLevel;
	var ctx = canvas.context;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// zoom in
	ctx.scale(scale, scale);
	
	_drawLevel(currentLevel, currentLifeOnLevel);
	
	// zoom out
	ctx.scale(1 / scale, 1 / scale);

	_drawMinimap(currentLevel, currentLifeOnLevel);

	_drawText();

	currentFrame++;

}

function zoom(e, delta) {
	console.log(delta);		

    e.stopPropagation();
    e.preventDefault();

    scale = scale + delta / 50;
    scale = Math.max(scale, 0.5);
    scale = Math.min(scale, 2);
    //draw(currentLifeOnLevel);
}

function _drawText() {
	var ctx = canvas.context;

	ctx.textAlign = 'center';
	
	for (var i = consoleBuffer.length - 1; i >= Math.max(0, consoleBuffer.length - 5); i--) {
		ctx.font = "16pt Coustard";
		ctx.fillStyle = "rgba(255, 255, 255," + (1 - (consoleBuffer.length - i) * 0.2) + ")";
		ctx.fillText(consoleBuffer[i], canvas.width / 2, 20 * (consoleBuffer.length - i));	
	};	

	if ((currentFrame - lastTextFrame) > 20)
		consoleBuffer[consoleBuffer.length] = '';
}

function _drawTileScaled(ctx, tileGfx, x, y) {
	ctx.drawImage(tileGfx[0], tileGfx[1], tileGfx[2], tileGfx[3], tileGfx[4], x, y, TILE_SIZE, TILE_SIZE);
}

function _drawTileRepeated(ctx, tileGfx, x, y) {
	for (var tx = x; tx < x + TILE_SIZE; tx = tx + tileGfx[3]) {
		for (var ty = y; ty < y + TILE_SIZE; ty = ty + tileGfx[4]) {
			ctx.drawImage(tileGfx[0], tileGfx[1], tileGfx[2], tileGfx[3], tileGfx[4], tx, ty, tileGfx[3], tileGfx[4]);
		}							
	}
}

function _drawTileCentered(ctx, tileGfx, x, y) {
	x = x + (TILE_SIZE - tileGfx[3]) / 2;
	y = y + (TILE_SIZE - tileGfx[4]);
	ctx.drawImage(tileGfx[0], tileGfx[1], tileGfx[2], tileGfx[3], tileGfx[4], x, y, tileGfx[3], tileGfx[4]);
}

function _drawLevel(level, lifeOnLevel) {
	var player = lifeOnLevel.player;
	var ctx = canvas.context;
	var monsters = [];

	var max_visible_tiles_x = Math.ceil(canvas.width / scale / TILE_SIZE);
	var max_visible_tiles_y = Math.ceil(canvas.height / scale / TILE_SIZE);

	var startX = Math.max(0, Math.floor(player[1] - max_visible_tiles_x / 2));
	var endX = Math.min(MAX_LEVEL_TILES_X, startX + max_visible_tiles_x);

	var startY = Math.max(0, Math.floor(player[2] - max_visible_tiles_y / 2));
	var endY = Math.min(MAX_LEVEL_TILES_Y, startY + max_visible_tiles_y);
	
	for (var ix = startX; ix < endX; ix++) {
		var x = (ix - startX) * TILE_SIZE;

		for (var iy = startY; iy < endY; iy++) {
			var y = (iy - startY) * TILE_SIZE;

			var tiles = level[ix][iy];
			for (var i = 0; i < tiles.length; i++){
				var tile = tiles[i];

				var tileGfx = tileTypesGfx[tile];

				if (tile == tileTypes.wall) {
					var upTile = level[ix][iy - 1];
					var downTile = level[ix][iy + 1];
					if (downTile != tileTypes.wall) {
						
						if (downTile != '') {
							tileGfx = tileTypesGfx[tile + "_front"];
							if (upTile == '') {
								tileTypesGfx[tile][5](ctx, tileTypesGfx[tile], x, y - TILE_SIZE);
							}					
						} else if (downTile == '') {
							var downTileGfx = tileTypesGfx[tile + "_front"];
							tileTypesGfx[tile][5](ctx, tileTypesGfx[tile], x, y + TILE_SIZE);
						}

					}
				}
				try	{
					tileGfx[5](ctx, tileGfx, x, y);
				} catch(e) {}
			}
		};
	};

	for (var i = 0; i < lifeOnLevel.monsters.length; i++) {
		var monster = lifeOnLevel.monsters[i];
		var tileGfx = tileTypesGfx[monster[0]];
		var x = (monster[1] - startX) * TILE_SIZE; // - ((tileGfx[3] - TILE_SIZE) / 2);
		var y = (monster[2] - startY) * TILE_SIZE; // - ((tileGfx[4] - TILE_SIZE));
		tileGfx[5](ctx, tileGfx, x, y);
	};


	var playerX = (player[1] - startX) * TILE_SIZE,
        playerY = (player[2] - startY) * TILE_SIZE;

	var tileGfx = tileTypesGfx[tileTypes.player];
	tileGfx[5](ctx, tileGfx, playerX, playerY);
}

function _drawMinimap(level, lifeOnLevel) {
	var ctx = canvas.context;

	for (var ix = 0; ix < MAX_LEVEL_TILES_X; ix++) {
		var x = ix * MINIMAP_TILE_SIZE;

		for (var iy = 0; iy < MAX_LEVEL_TILES_Y; iy++) {
			var y = iy * MINIMAP_TILE_SIZE;

			var tiles = level[ix][iy];
			for (var i = 0; i < tiles.length; i++){
				var tile = tiles[i];

				switch(tile) {
					case tileTypes.walkable:
					case tileTypes.walkableFeature1:
					case tileTypes.walkableFeature2:
					case tileTypes.walkableFeature3:
					case tileTypes.walkableFeature4:
					case tileTypes.walkableFeature5:
					case tileTypes.walkableFeature6:
					case tileTypes.walkableFeature7:
						ctx.fillStyle = 'rgb(100,100,100)'; 
						break;
					case tileTypes.wall:
						ctx.fillStyle = 'rgb(150,50,55)'; 
						break;
					case tileTypes.treasure:
						ctx.fillStyle = 'rgb(255,255,0)'; 
						break;
					case tileTypes.stairUp:
						ctx.fillStyle = 'rgb(0,30,255)'; 
						break;
					case tileTypes.stairDown:
						ctx.fillStyle = 'rgb(0,255,0)'; 
						break;
					default:
						ctx.fillStyle = 'rgb(0,0,0)'; 
						break;

				}
				ctx.fillRect(x, y, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);
			}
		};
	};

	ctx.fillStyle = 'rgb(255,255,255)'; 
	ctx.fillRect(lifeOnLevel.player[1] * MINIMAP_TILE_SIZE, lifeOnLevel.player[2] * MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE, MINIMAP_TILE_SIZE);

}

function rand(min, max) {
	var r = min + Math.floor(Math.random()*(max+1));
	return r;
}
*/