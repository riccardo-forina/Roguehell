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

/*******************************************************
					INTERNAL STUFF
*******************************************************/

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