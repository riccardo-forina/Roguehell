import random

class TileTypes(object):
    stair_up = 'stair_up'
    stair_down = 'stair_down'
    treasure = 'treasure'
    trap = 'trap'
    monster = 'monster'
    wall = 'wall'
    walkable = 'walkable'
    door = 'door'

class RogueHell(object):
    """docstring for RogueHell"""

    def __init__(self, number_of_levels=20, width=60, height=60):
        self.MIN_ROOM_SIZE = 2 + 5
        self.MAX_ROOM_SIZE = 2 + 20
        self.MAX_LEVEL_TILES_X = int(width)
        self.MAX_LEVEL_TILES_Y = int(height)
        self.number_of_levels = number_of_levels
        
        self.levels = [self._makeLevel(i, self.number_of_levels) for i in xrange(1, number_of_levels)]

    def new_round(self):
        self._put_tile(TileTypes.monster, self.levels[0], 1)

    def _makeLevel(self, story, max_story):
        max_stairs_up = 1 if (story == 1) else random.randint(1, 2)
        max_stairs_down = 0 if (story == max_story) else random.randint(1, 2)
        max_treasures = random.randint(0, 5)

        level = [None for x in xrange(0, self.MAX_LEVEL_TILES_X)]
        for i in range(len(level)):
            level[i] = [None for y in xrange(0, self.MAX_LEVEL_TILES_Y)]
        
        rooms = self._put_rooms(level)
        
        self._put_tile(TileTypes.stair_up, level, max_stairs_up)
        self._put_tile(TileTypes.stair_down, level, max_stairs_down)
        self._put_tile(TileTypes.treasure, level, max_treasures)

        return level

    def _put_rooms(self, level):
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
                        if (level[x][y] is not None and level[x][y] is not TileTypes.wall):
                            return False
                return True

            if (fits() == True): 
                for x in xrange(startX , endX):
                    for y in xrange(startY, endY):
                        level[x][y] = TileTypes.wall if (x == startX or y == startY or x == endX-1 or y == endY-1) else TileTypes.walkable
                rooms.append((startX,startY,endX,endY))
            else:
                checks += 1

        self._join_rooms(level, rooms)

    def _join_rooms(self, level, rooms):
        def is_connected(level, x, y, direction):
            coord_changer = -1 if direction in ['up', 'left'] else 1
            if direction in ['up', 'down']:
                for testY in xrange(y, 0, coord_changer):
                    if level[x][testY] == TileTypes.wall and level[x][testY + coord_changer] == TileTypes.walkable:
                        return True
            if direction in ['left', 'right']:
                for testX in xrange(x, 0, coord_changer):
                    if level[testX][y] == TileTypes.wall and level[testX + coord_changer][y] == TileTypes.walkable:
                        return True

        for room in rooms:
            paths = []
            for x in xrange(room[0] + 1, room[2] - 1):
                if is_connected(level, x, room[1], 'up'):
                    paths.append((x, room[1], 'up'))
                if is_connected(level, x, room[3], 'down'):
                    paths.append((x, room[3], 'up'))
            for y in xrange(room[1] + 1, room[3] - 1):
                if is_connected(level, room[0], y, 'left'):
                    paths.append((room[0], y, 'left'))
                if is_connected(level, room[2], y, 'right'):
                    paths.append((room[2], y, 'right'))
            
            if len(paths) > 0:
                x, y, direction = paths[random.randint(0, len(paths) - 1)]
                #print "Putting corridor", x, y, direction
                self._put_corridor(level, x, y, direction)

    def _put_corridor(self, level, x, y, direction):
        coord_changer = -1 if direction in ['up', 'left'] else 1
        if direction in ['up', 'down']:
            level[x][y] = TileTypes.walkable
            y += coord_changer
            for y in xrange(y, 0, coord_changer):
                if level[x][y] in [None, TileTypes.wall]:
                    level[x][y] = TileTypes.walkable
                    if x > 0:
                        level[x - 1][y] = level[x - 1][y] or TileTypes.wall
                    if x < self.MAX_LEVEL_TILES_X -1:
                        level[x + 1][y] = level[x + 1][y] or TileTypes.wall
                else:
                    break
        if direction in ['left', 'right']:
            level[x][y] = TileTypes.walkable
            x += coord_changer
            for x in xrange(x, 0, coord_changer):
                if level[x][y] in [None, TileTypes.wall]:
                    level[x][y] = TileTypes.walkable
                    if y > 0:
                        level[x][y - 1] = level[x][y - 1] or TileTypes.wall
                    if y < self.MAX_LEVEL_TILES_Y -1:
                        level[x][y + 1] = level[x][y + 1] or TileTypes.wall
                else:
                    break


    def _put_tile(self, tileType, level, amount):
        max_width = len(level)
        max_height = len(level[0])

        put = 0

        while(put < amount):
            x = random.randint(0, self.MAX_LEVEL_TILES_X - 1)
            y = random.randint(0, self.MAX_LEVEL_TILES_Y - 1)

            if (level[x][y] == TileTypes.walkable):
                level[x][y] = tileType
                put += 1

