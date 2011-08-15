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
    player = 'Player'

    @classmethod
    def get_tile_class(cls, type):
        return getattr(game_library, type)

        

class Level(object):
    """docstring for Level"""


    def __init__(self, story, max_story, width=60, height=60):

        self.story = story
        self.MIN_ROOM_SIZE = 2 + 3
        self.MAX_ROOM_SIZE = 2 + 10
        self.MAX_LEVEL_TILES_X = int(width)
        self.MAX_LEVEL_TILES_Y = int(height)

        max_treasures = random.randint(0, 5)

        self.level = [None for x in xrange(0, self.MAX_LEVEL_TILES_X)]
        for i in range(len(self.level)):
            self.level[i] = [None for y in xrange(0, self.MAX_LEVEL_TILES_Y)]
        
        self.rooms = self._put_rooms()
        
        self.stairs_up = self._put_tile(TileTypes.stair_up, 1)[0]
        self.stairs_down = self._put_tile(TileTypes.stair_down, 1)[0]
        #self.treasures = self._put_tile(TileTypes.treasure, max_treasures)
        #self.player = self._put_tile(TileTypes.player, 1, temporary=True)[0]

        self.player = TileTypes.get_tile_class(TileTypes.player)(self.stairs_up.x, self.stairs_up.y)
        #self.level[self.stairs_up.x][self.stairs_up.y].append(TileTypes.player)

    def populate(self):
        self.monsters = self._put_tile(TileTypes.monster, random.randint(15,30), temporary=True)

    def animate(self):
        for monster in self.monsters:
            moved = False
            while moved == False:
                direction = monster.move()
                coord_changer = -1 if direction in ['up', 'left'] else 1
                if direction in ['up', 'down']:
                    x = monster.x
                    y = monster.y + coord_changer
                    if self.level[x][y] == TileTypes.walkable:
                        #self.level[monster.x][monster.y].pop()
                        monster.x = x
                        monster.y = y
                        #self.level[monster.x][monster.y].append(monster.tile_id())
                        moved = True
                if direction in ['left', 'right']:
                    x = monster.x + coord_changer
                    y = monster.y
                    if self.level[x][y] == TileTypes.walkable:
                        #self.level[monster.x][monster.y].pop()
                        monster.x = x
                        monster.y = y
                        #self.level[monster.x][monster.y].append(monster.tile_id())
                        moved = True

    def move_player(self, direction):
        coord_changer = -1 if direction in ['up', 'left'] else 1
        if direction in ['up', 'down']:
            x = self.player.x
            y = self.player.y + coord_changer
            print self.player.x, self.player.y, x,y,self.level[x][y]
            if self.level[x][y] != TileTypes.wall:
                #self.level[self.player.x][self.player.y].pop()
                self.player.x = x
                self.player.y = y
                #self.level[self.player.x][self.player.y].append(self.player.tile_id())
                print self.player.x, self.player.y

        if direction in ['left', 'right']:
            x = self.player.x + coord_changer
            y = self.player.y
            print self.player.x, self.player.y, x,y,self.level[x][y]
            if self.level[x][y] != TileTypes.wall:
                #self.level[self.player.x][self.player.y].pop()
                self.player.x = x
                self.player.y = y
                #self.level[self.player.x][self.player.y].append(self.player.tile_id())

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
                        if (self.level[x][y] != None):
                            return False
                return True

            if (fits() == True): 
                for x in xrange(startX , endX):
                    for y in xrange(startY, endY):
                        if (x == startX or y == startY or x == endX-1 or y == endY-1):
                            self.level[x][y] = TileTypes.wall
                        else:
                            self.level[x][y] = TileTypes.walkable
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
                    if TileTypes.wall == self.level[x][testY] and TileTypes.walkable == self.level[x][testY + coord_changer]:
                        return True
            if direction in ['left', 'right']:
                for testX in xrange(x, 0, coord_changer):
                    if TileTypes.wall == self.level[testX][y] and TileTypes.walkable == self.level[testX + coord_changer][y]:
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
                if self.level[x][y] == None or TileTypes.wall == self.level[x][y]:
                    self.level[x][y] = TileTypes.walkable
                    if x > 0 and self.level[x - 1][y] == None:
                        self.level[x - 1][y] = TileTypes.wall
                    if x < self.MAX_LEVEL_TILES_X -1 and self.level[x + 1][y] == None:
                        self.level[x + 1][y] = TileTypes.wall
                else:
                    break
        if direction in ['left', 'right']:
            self.level[x][y] = [TileTypes.walkable]
            x += coord_changer
            for x in xrange(x, 0, coord_changer):
                if self.level[x][y] == None or TileTypes.wall == self.level[x][y]:
                    self.level[x][y] = TileTypes.walkable
                    if y > 0 and self.level[x][y - 1] == None:
                        self.level[x][y - 1] = TileTypes.wall
                    if y < self.MAX_LEVEL_TILES_Y -1 and self.level[x][y + 1] == None:
                        self.level[x][y + 1] = TileTypes.wall
                else:
                    break


    def _put_tile(self, tileType, amount, temporary=False):
        tiles = []
        max_width = len(self.level)
        max_height = len(self.level[0])

        put = 0

        while(put < amount):
            x = random.randint(0, self.MAX_LEVEL_TILES_X - 1)
            y = random.randint(0, self.MAX_LEVEL_TILES_Y - 1)
            print "Trying to put", tileType, "in", x, y, self.level[x][y]

            if (TileTypes.walkable == self.level[x][y]):
                if not temporary:
                    self.level[x][y] = tileType

                tiles.append(TileTypes.get_tile_class(tileType)(x, y))
                put += 1

        return tiles

class RogueHell(object):
    """docstring for RogueHell"""

    def __init__(self, number_of_levels=20, width=60, height=60):
        self.MAX_LEVEL_TILES_X = int(width)
        self.MAX_LEVEL_TILES_Y = int(height)
        self.number_of_levels = number_of_levels
        self.current_level_deep = 0
        
        self.levels = [Level(i, self.number_of_levels, width, height) for i in xrange(1, number_of_levels)]

        self.change_level(self.current_level_deep)

    def change_level(self, deep):
        self.current_level = self.levels[deep]
        self.current_level.populate()

    def new_round(self):
        self.current_level.animate()
        #self.move_player(['up', 'left', 'down', 'right'][random.randint(0,3)])

    def get_map(self):
        return self.current_level.level

    def get_life_on_level(self):            
        return {
            'monsters': [(TileTypes.monster, m.id, m.x, m.y) for m in self.current_level.monsters],
            'player': (TileTypes.player, self.current_level.player.x, self.current_level.player.y)
        }

    def move_player(self, direction):
        self.current_level.move_player(direction)


    def fighting(self):
        for m in self.current_level.monsters:
            if m.x == self.current_level.player.x and m.y == self.current_level.player.y:
                return True

        return False

    def fight(self):
        if random.randint(0, 100) > 50:
            self.current_level.monsters = [m for m in self.current_level.monsters if m.x != self.current_level.player.x or m.y != self.current_level.player.y]
        
        return "fight log %d" % random.randint(0, 100)

    def interact(self, key):
        if key == 'omni':
            print "Interacting with", self.current_level.level[self.current_level.player.x][self.current_level.player.y]
            if TileTypes.stair_up in self.current_level.level[self.current_level.player.x][self.current_level.player.y]:
                if self.current_level_deep > 0:
                    self.current_level_deep -= 1
                    self.change_level(self.current_level_deep)
                    return {'changed_level':True}

            if TileTypes.stair_down in self.current_level.level[self.current_level.player.x][self.current_level.player.y]:
                if self.current_level_deep < self.number_of_levels:
                    self.current_level_deep += 1
                    self.change_level(self.current_level_deep)
                    return {'changed_level':True}

        return {}