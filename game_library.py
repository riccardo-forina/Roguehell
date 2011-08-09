class Tile(object):
    def __init__(self, x, y):
        self.x = x
        self.y = y

    @classmethod
    def tile_id(cls):
        return cls.__name__
    
class Empty(Tile):
    pass

class Monster(Tile):
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
