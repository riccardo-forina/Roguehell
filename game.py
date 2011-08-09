import random
import game_library

class TileTypes(object):
    stair_up = 'StairUp'
    stair_down = 'StairDown'
    treasure = 'Treasure'
    trap = 'Trap'
    monster = 'Monster'
    wall = 'Wall'
    walkable = 'Walkable'
    door = 'Door'

    @classmethod
    def get_tile_class(cls, type):
        return getattr(game_library, type)

        

class Level(object):
    """docstring for Level"""


    def __init__(self, story, max_story, width=60, height=60):

        self.story = story
        self.MIN_ROOM_SIZE = 2 + 5
        self.MAX_ROOM_SIZE = 2 + 20
        self.MAX_LEVEL_TILES_X = int(width)
        self.MAX_LEVEL_TILES_Y = int(height)

        max_stairs_up = 1 if (story == 1) else random.randint(1, 2)
        max_stairs_down = 0 if (story == max_story) else random.randint(1, 2)
        max_treasures = random.randint(0, 5)

        self.level = [None for x in xrange(0, self.MAX_LEVEL_TILES_X)]
        for i in range(len(self.level)):
            self.level[i] = [[] for y in xrange(0, self.MAX_LEVEL_TILES_Y)]
        
        self.rooms = self._put_rooms()
        
        self.stairs_up = self._put_tile(TileTypes.stair_up, max_stairs_up)
        self.stairs_down = self._put_tile(TileTypes.stair_down, max_stairs_down)
        self.treasures = self._put_tile(TileTypes.treasure, max_treasures)

    def populate(self):
        self.monsters = self._put_tile(TileTypes.monster, random.randint(5,10))

    def animate(self):
        pass

    def _put_rooms(self):
        rooms = []
        checks = 0

        while(checks < 50):
            roomWidth = random.randint(self.MIN_ROOM_SIZE, self.MAX_ROOM_SIZE)
            roomHeight = random.randint(self.MIN_ROOM_SIZE, self.MAX_ROOM_SIZE)

            startX = random.randint(0, self.MAX_LEVEL_TILES_X - self.MIN_ROOM_SIZE - 1)
            startY = random.randint(0, self.MAX_LEVEL_TILES_Y - self.MIN_ROOM_SIZE - 1)
            endX = min(startX + roomWidth - 1, self.MAX_LEVEL_TILES_X - 1)
            endY = min(startY + roomHeight - 1, self.MAX_LEVEL_TILES_Y - 1)

            def fits():
                for x in xrange(startX , endX):
                    for y in xrange(startY, endY):
                        if (len(self.level[x][y]) != 0):
                            return False
                return True

            if (fits() == True): 
                for x in xrange(startX , endX):
                    for y in xrange(startY, endY):
                        if (x == startX or y == startY or x == endX-1 or y == endY-1):
                            self.level[x][y] = [TileTypes.wall]
                        else:
                            self.level[x][y] = [TileTypes.walkable]
                rooms.append((startX,startY,endX,endY))
            else:
                checks += 1

        self._join_rooms(rooms)
        return rooms

    def _join_rooms(self, rooms):
        def is_connected(level, x, y, direction):
            coord_changer = -1 if direction in ['up', 'left'] else 1
            if direction in ['up', 'down']:
                for testY in xrange(y, 0, coord_changer):
                    if TileTypes.wall in self.level[x][testY] and TileTypes.walkable in self.level[x][testY + coord_changer]:
                        return True
            if direction in ['left', 'right']:
                for testX in xrange(x, 0, coord_changer):
                    if TileTypes.wall in self.level[testX][y] and TileTypes.walkable in self.level[testX + coord_changer][y]:
                        return True

        for room in rooms:
            paths = []
            for x in xrange(room[0] + 1, room[2] - 1):
                if is_connected(self.level, x, room[1], 'up'):
                    paths.append((x, room[1], 'up'))
                if is_connected(self.level, x, room[3], 'down'):
                    paths.append((x, room[3], 'up'))
            for y in xrange(room[1] + 1, room[3] - 1):
                if is_connected(self.level, room[0], y, 'left'):
                    paths.append((room[0], y, 'left'))
                if is_connected(self.level, room[2], y, 'right'):
                    paths.append((room[2], y, 'right'))
            
            if len(paths) > 0:
                x, y, direction = paths[random.randint(0, len(paths) - 1)]
                #print "Putting corridor", x, y, direction
                self._put_corridor(x, y, direction)

    def _put_corridor(self, x, y, direction):
        coord_changer = -1 if direction in ['up', 'left'] else 1
        if direction in ['up', 'down']:
            self.level[x][y] = [TileTypes.walkable]
            y += coord_changer
            for y in xrange(y, 0, coord_changer):
                if len(self.level[x][y]) == 0 or TileTypes.wall in self.level[x][y]:
                    self.level[x][y] = [TileTypes.walkable]
                    if x > 0 and len(self.level[x - 1][y]) == 0:
                        self.level[x - 1][y] = [TileTypes.wall]
                    if x < self.MAX_LEVEL_TILES_X -1 and len(self.level[x + 1][y]) == 0:
                        self.level[x + 1][y] = [TileTypes.wall]
                else:
                    break
        if direction in ['left', 'right']:
            self.level[x][y] = [TileTypes.walkable]
            x += coord_changer
            for x in xrange(x, 0, coord_changer):
                if len(self.level[x][y]) == 0 or TileTypes.wall in self.level[x][y]:
                    self.level[x][y] = [TileTypes.walkable]
                    if y > 0 and len(self.level[x][y - 1]) == 0:
                        self.level[x][y - 1] = [TileTypes.wall]
                    if y < self.MAX_LEVEL_TILES_Y -1 and len(self.level[x][y + 1]) == 0:
                        self.level[x][y + 1] = [TileTypes.wall]
                else:
                    break


    def _put_tile(self, tileType, amount):
        tiles = []
        max_width = len(self.level)
        max_height = len(self.level[0])

        put = 0

        while(put < amount):
            x = random.randint(0, self.MAX_LEVEL_TILES_X - 1)
            y = random.randint(0, self.MAX_LEVEL_TILES_Y - 1)

            if (TileTypes.walkable in self.level[x][y]):
                self.level[x][y].append(tileType)

                tiles.append(TileTypes.get_tile_class(tileType)(x, y))
                put += 1

        return tiles

class RogueHell(object):
    """docstring for RogueHell"""

    def __init__(self, number_of_levels=20, width=60, height=60):
        self.MAX_LEVEL_TILES_X = int(width)
        self.MAX_LEVEL_TILES_Y = int(height)
        self.number_of_levels = number_of_levels
        
        self.levels = [Level(i, self.number_of_levels, width, height) for i in xrange(1, number_of_levels)]
        self.current_level = self.levels[0]
        self.current_level.populate()

    def new_round(self):
        self.current_level.animate()

        return self.current_level.level


