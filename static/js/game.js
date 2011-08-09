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
	
	var playIframe = $('<iframe src="/play" style="display:none;"></script>');	
	$('body').append(playIframe);

	$(document).keypress(function(e) {

	    // Enable esc
	    if (e.keyCode == 27) {
			e.stopPropagation();
			e.preventDefault();
			return false;
	    }

	});

	/*
	// levels = makeLevels(1);
	$.ajax('http://localhost:8080/map', {
		dataType: 'jsonp',
		data: {
			width: MAX_LEVEL_TILES_X,
			height: MAX_LEVEL_TILES_Y
		},
		success: function(data) {
			levels = data;
			drawLevel(levels[0]);
		}
	});
	*/
}

/*******************************************************
					INTERNAL STUFF
*******************************************************/

function drawLevel (level) {
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
				case tileTypes.monster:
					ctx.fillStyle = 'rgb(255,0,0)'; 
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
