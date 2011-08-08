var TILE_SIZE = 10,
   
    MAX_LEVEL_TILES_X = 60,
    MAX_LEVEL_TILES_Y = 60,

    viewport = Object(),
	canvas = Object(),
    tile = Object(),
	levels,
	tileTypes = Object();

tileTypes.stairUp = 'stairUp',
tileTypes.stairDown = 'stairDown',
tileTypes.treasure = 'treasure',
tileTypes.trap = 'trap',
tileTypes.monster = 'monster',
tileTypes.wall = 'wall',
tileTypes.walkable = 'walkable',
tileTypes.door = 'door';

function initGame (viewportId) {
	viewport.domNode = $('#' + viewportId);
	viewport.width = viewport.domNode.width();
	viewport.height = viewport.domNode.height();
	
	canvas.domNode = viewport.domNode.find('.viewport');
	canvas.context = canvas.domNode[0].getContext('2d');
	
	var viewportMinSize = Math.min(viewport.domNode.width(), viewport.domNode.height());

	canvas.domNode.attr('width', TILE_SIZE * MAX_LEVEL_TILES_X);
	canvas.domNode.attr('height', TILE_SIZE * MAX_LEVEL_TILES_Y);
	canvas.width = TILE_SIZE * MAX_LEVEL_TILES_X;
	canvas.height = TILE_SIZE * MAX_LEVEL_TILES_Y;
	
	console.log("Game area", viewport, 'width', viewport.width, 'height', viewport.height);
	console.log('tile size', TILE_SIZE);

	// levels = makeLevels(1);
	$.ajax('http://localhost:8080/map', {
		dataType: 'jsonp',
		success: function(data) {
			levels = data;
			console.log(levels[0]);
			drawLevel(levels[0]);
		}
	});
}

/*******************************************************
					INTERNAL STUFF
*******************************************************/

function drawLevel (level) {
	console.log(level);
	var ctx = canvas.context;
	for (var x = 0; x < canvas.width; x += TILE_SIZE) {
		for (var y = 0; y < canvas.height; y += TILE_SIZE) {
			switch(level[x / TILE_SIZE][y / TILE_SIZE]) {
				case tileTypes.walkable:
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
			ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

			// ctx.fillStyle = 'rgb(0,0,0)';
			// var text = level[x / TILE_SIZE][y / TILE_SIZE];
			// text = text || '';
			// ctx.fillText(text, x + 5, y + Math.floor(TILE_SIZE / 2) + 5, TILE_SIZE - 10);
		};
	};
}




































// function rand(min, max) {
// 	return Math.floor(Math.random() * max) + min;
// }

// function putRoomsInTheLevel (level, amount) {

// 	var put = 0;
// 	var checks = 0;

// 	while(put < amount || checks > 100) {
// 		var roomWidth = rand(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
// 		var roomHeight = rand(MIN_ROOM_SIZE, MAX_ROOM_SIZE);

// 		var startX = rand(0, MAX_LEVEL_TILES_X - MIN_ROOM_SIZE - 1),
// 			startY = rand(0, MAX_LEVEL_TILES_Y - MIN_ROOM_SIZE - 1),
// 			endX = Math.min(startX + roomWidth, MAX_LEVEL_TILES_X - 1),
// 			endY = Math.min(startY + roomHeight, MAX_LEVEL_TILES_Y - 1);

// 		var fits = function() {
// 			for (var x = startX; x <= endX; x++) {
// 				for (var y = startY; y <= endY; y++) {
// 					if (level[x][y] !== undefined && level[x][y] !== tileTypes.wall)
// 						return false;
// 				}
// 			}
// 			return true;
// 		}();

// 		if (fits == true) {
// 			for (var x = startX; x <= endX; x++) {
// 				for (var y = startY; y <= endY; y++) {
// 					level[x][y] = (x == startX || y == startY || x == endX || y == endY ) ? 
// 						tileTypes.wall :
// 						tileTypes.walkable;
// 				}
// 			}
// 			put++;
// 		}

// 		checks++;
// 	}
// }

// function putTileInTheLevel (tileType, level, amount) {
// 	var maxWidth = level.length,
// 	    maxHeight = level[0].length;

// 	var put = 0;

// 	while(put < amount) {
// 		var x = rand(0, MAX_LEVEL_TILES_X),
// 			y = rand(0, MAX_LEVEL_TILES_Y);

		
// 		if (level[x][y] === tileTypes.walkable) {
// 			level[x][y] = tileType;
// 			put++;
// 		}
// 	}
// }

// function makeLevel (story, maxStory) {
// 	var maxStairsUp = (story == 1) ? 1 : rand(1, 2),
// 	    maxStairsDown = (story == maxStory) ? 0 : rand(1, 2),
// 	    maxTreasures = rand(0, 5),
// 	    maxRooms = rand(5,10);

// 	var level = Array(MAX_LEVEL_TILES_X);
// 	for (var i = level.length - 1; i >= 0; i--) {
// 		level[i] = Array(MAX_LEVEL_TILES_Y);
// 	};

// 	putRoomsInTheLevel(level, maxRooms);

// 	putTileInTheLevel(tileTypes.stairUp, level, maxStairsUp);
// 	putTileInTheLevel(tileTypes.stairDown, level, maxStairsDown);
// 	putTileInTheLevel(tileTypes.treasure, level, maxTreasures);

// 	return level;	
// }

// function makeLevels (numberOfLevels) {
// 	numberOfLevels = numberOfLevels || 5;
// 	levels = [];

// 	for (var i = 1; i <= numberOfLevels; i++) {
// 		levels[i] = makeLevel(i, numberOfLevels);
// 	}

// 	return levels;
// }