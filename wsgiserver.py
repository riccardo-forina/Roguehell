#!/usr/bin/python
"""WSGI server example"""

import random, json, mimetypes, urlparse
from gevent.pywsgi import WSGIServer

MIN_ROOM_SIZE = 2 + 5
MAX_ROOM_SIZE = 2 + 20
MAX_LEVEL_TILES_X = 60
MAX_LEVEL_TILES_Y = 60

class TileTypes(object):
    stairUp = 'stairUp'
    stairDown = 'stairDown'
    treasure = 'treasure'
    trap = 'trap'
    monster = 'monster'
    wall = 'wall'
    walkable = 'walkable'
    door = 'door'


def putRooms(level):
    rooms = []
    checks = 0

    while(checks < 50):
        roomWidth = random.randint(MIN_ROOM_SIZE, MAX_ROOM_SIZE)
        roomHeight = random.randint(MIN_ROOM_SIZE, MAX_ROOM_SIZE)

        startX = random.randint(0, MAX_LEVEL_TILES_X - MIN_ROOM_SIZE - 1)
        startY = random.randint(0, MAX_LEVEL_TILES_Y - MIN_ROOM_SIZE - 1)
        endX = min(startX + roomWidth - 1, MAX_LEVEL_TILES_X - 1)
        endY = min(startY + roomHeight - 1, MAX_LEVEL_TILES_Y - 1)

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

    joinRooms(level, rooms)

def joinRooms(level, rooms):
    for room in rooms:
        paths = []
        for x in xrange(room[0] + 1, room[2] - 1):
            if isConnected(level, x, room[1], 'up'):
                paths.append((x, room[1], 'up'))
            if isConnected(level, x, room[3], 'down'):
                paths.append((x, room[3], 'up'))
        for y in xrange(room[1] + 1, room[3] - 1):
            if isConnected(level, room[0], y, 'left'):
                paths.append((room[0], y, 'left'))
            if isConnected(level, room[2], y, 'right'):
                paths.append((room[2], y, 'right'))
        
        if len(paths) > 0:
            x, y, direction = paths[random.randint(0, len(paths) - 1)]
            print "Putting corridor", x, y, direction
            putCorridor(level, x, y, direction)

def putCorridor(level, x, y, direction):
    coordChanger = -1 if direction in ['up', 'left'] else 1
    if direction in ['up', 'down']:
        level[x][y] = TileTypes.walkable
        y += coordChanger
        for y in xrange(y, 0, coordChanger):
            if level[x][y] in [None, TileTypes.wall]:
                level[x][y] = TileTypes.walkable
                if x > 0:
                    level[x - 1][y] = level[x - 1][y] or TileTypes.wall
                if x < MAX_LEVEL_TILES_X -1:
                    level[x + 1][y] = level[x + 1][y] or TileTypes.wall
            else:
                break

    if direction in ['left', 'right']:
        level[x][y] = TileTypes.walkable
        x += coordChanger
        for x in xrange(x, 0, coordChanger):
            if level[x][y] in [None, TileTypes.wall]:
                level[x][y] = TileTypes.walkable
                if y > 0:
                    level[x][y - 1] = level[x][y - 1] or TileTypes.wall
                if y < MAX_LEVEL_TILES_Y -1:
                    level[x][y + 1] = level[x][y + 1] or TileTypes.wall
            else:
                break
    
def isConnected(level, x, y, direction):
    coordChanger = -1 if direction in ['up', 'left'] else 1
    if direction in ['up', 'down']:
        for testY in xrange(y, 0, coordChanger):
            if level[x][testY] == TileTypes.wall and level[x][testY + coordChanger] == TileTypes.walkable:
                return True
    if direction in ['left', 'right']:
        for testX in xrange(x, 0, coordChanger):
            if level[testX][y] == TileTypes.wall and level[testX + coordChanger][y] == TileTypes.walkable:
                return True


def putTile(tileType, level, amount):
    maxWidth = len(level)
    maxHeight = len(level[0])

    put = 0

    while(put < amount):
        x = random.randint(0, MAX_LEVEL_TILES_X - 1)
        y = random.randint(0, MAX_LEVEL_TILES_Y - 1)

        if (level[x][y] == TileTypes.walkable):
            level[x][y] = tileType
            put += 1

def makeLevel (story, maxStory):
    maxStairsUp = 1 if (story == 1) else random.randint(1, 2)
    maxStairsDown = 0 if (story == maxStory) else random.randint(1, 2)
    maxTreasures = random.randint(0, 5)

    level = [None for x in xrange(0, MAX_LEVEL_TILES_X)]
    for i in range(len(level)):
        level[i] = [None for y in xrange(0, MAX_LEVEL_TILES_Y)]

    
    
    rooms = putRooms(level)
    
    putTile(TileTypes.stairUp, level, maxStairsUp)
    putTile(TileTypes.stairDown, level, maxStairsDown)
    putTile(TileTypes.treasure, level, maxTreasures)

    return level    


def makeLevels (numberOfLevels):
    numberOfLevels = numberOfLevels or 5
    levels = [makeLevel(i, numberOfLevels) for i in xrange(1, numberOfLevels)]

    return levels

###################
### WSGI SERVER ###
###################

def serveFile(response, filename):
    response('200 OK', [('Content-Type', mimetypes.guess_type(filename)[0])])
    return open(filename).readlines()

def roguehell(request, response):
    #print request
    if request['PATH_INFO'] == '/':
        return serveFile(response, 'index.html')

    elif request['PATH_INFO'].startswith('/static'):
        return serveFile(response, request['PATH_INFO'][1:])

    elif request['PATH_INFO'] == '/map':
        qs = urlparse.parse_qs(request['QUERY_STRING'])
        response('200 OK', [('Content-Type', 'text/javascript')])
        out = qs['callback'][0] + '(' + json.dumps(makeLevels(10)) + ');'
        return [out]

    else:
        response('404 Not Found', [('Content-Type', 'text/html')])
        return ['<h1>Not Found</h1>']

print 'Serving on 8080...'
WSGIServer(('', 8080), roguehell).serve_forever()
