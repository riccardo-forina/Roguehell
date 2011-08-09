#!/usr/bin/python
from gevent import monkey; monkey.patch_all()
from gevent.pywsgi import WSGIServer
from gevent import Greenlet, queue, sleep
import os, random, json, time
from flask import Flask, request, render_template, session, sessions, g, Response
from werkzeug.serving import run_with_reloader
from werkzeug.contrib.sessions import FilesystemSessionStore

from game import RogueHell

SESSIONS_DIR = '/tmp/sessions/'

app = Flask(__name__)
app.debug = True
app.config.update(
    SECRET_KEY= '\xcd\x16\xed7Q\x00Y\xbe\xc3\x9fHc\x92\x0b\xc2\x95\\\xaag\x8d\x83\xe9\xeb\xfe',
    SESSION_COOKIE_NAME= 'roguehell',
)

#STREAMING_FLUSH_FORCE = "".join([" " for x in xrange(1024)])

@app.before_request
def before_request():
    session_store = FilesystemSessionStore(SESSIONS_DIR)
    if 'sid' in session:
        sid = session.get('sid')
        g.session = session_store.get(sid)
    else:
    	session['sid'] = os.urandom(24)
        g.session = session_store.new()
  
@app.after_request
def after_request(response):
    session_store = FilesystemSessionStore(SESSIONS_DIR)
    if g.session.should_save:
        session_store.save(g.session)
        session['sid'] = g.session.sid
        session.permanent = True
        app.save_session(session, response)
    return response

@app.route('/play')
def play():
    game = g.session.get('game')
    if not game:
        game = RogueHell(
            number_of_levels=10, 
            width=60,
            height=60
        )
        g.session['game'] = game    

    def handle_game(q):
        while True:
            #rpc = 'drawLevel(%s);' % (game.levels[0])
            game.new_round()
            rpc = "<script type='text/javascript'>parent.drawLevel(%s);</script>" % json.dumps(game.levels[0])
            q.put(rpc)
            sleep(3)

    q = queue.Queue()
    greenlet = Greenlet.spawn(handle_game, q)
    return Response(q, direct_passthrough=True)

@app.route('/')
def homepage():
    return render_template('index.html')

@run_with_reloader
def run_server():
    http_server = WSGIServer(('', 8080), app)
    http_server.serve_forever()
    #app.run(port=8080)

if __name__ == '__main__':
    run_server()