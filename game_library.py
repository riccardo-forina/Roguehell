import random

class Tile(object):
    def __init__(self, x, y):
        self.id = "%s_%s" % (x, y)
        self.x = x
        self.y = y

    @classmethod
    def tile_id(cls):
        return cls.__name__

class CanWalk(Tile):
    """docstring for CanWalk"""
    def __init__(self, *args, **kwargs):
        super(CanWalk, self).__init__(*args, **kwargs)
        self.directions = ['up', 'down', 'left', 'right']
        self.last_direction = self.directions[random.randint(0,3)]
        self.steps_done_in_last_direction = 0

    def move(self):
        if self.steps_done_in_last_direction > 15 or random.randint(0, 100) > 90:
            self.last_direction = self.directions[random.randint(0,3)]
            self.steps_done_in_last_direction = 0
        else:
            self.steps_done_in_last_direction += 1
                    
        return self.last_direction
                
    
class Empty(Tile):
    pass

class Player(Tile):
    """docstring for Player"""
    def __init__(self, *args, **kwargs):
        super(Player, self).__init__(*args, **kwargs)

class Monster(CanWalk):
    """docstring for Monster"""
    def __init__(self, *args, **kwargs):
        super(Monster, self).__init__(*args, **kwargs)

class StairUp(Tile):
    """docstring for StairUp"""
    def __init__(self, *args, **kwargs):
        super(StairUp, self).__init__(*args, **kwargs)

class StairDown(Tile):
    """docstring for StairDown"""
    def __init__(self, *args, **kwargs):
        super(StairDown, self).__init__(*args, **kwargs)

class Treasure(Tile):
    """docstring for Treasure"""
    def __init__(self, *args, **kwargs):
        super(Treasure, self).__init__(*args, **kwargs)

class Walkable(Tile):
    """docstring for Walkable"""
    def __init__(self, *args, **kwargs):
        super(Walkable, self).__init__(*args, **kwargs)

class Wall(Tile):
    """docstring for Wall"""
    def __init__(self, *args, **kwargs):
        super(Wall, self).__init__(*args, **kwargs)
