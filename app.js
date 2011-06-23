/**********************************************************************
*
*
*
*			Libraries & Includes
*
*	
*
***********************************************************************/

util = require('util')
exec = require('child_process').exec
gm = require('googlemaps')
geo = require('geo')
sys = require('sys')
auth = require('connect-auth')
connect = require('connect')
form = require('connect-form')
fs = require('fs')
stylus = require('stylus')
express = require('express')
crypto = require('crypto')
Mongolian = require('mongolian')
nib = require('nib')
//RedisStore = require('connect-redis')(connect)
MemStore = require('connect').session.MemoryStore
nowjs = require('now')
app = express.createServer()

/*** Mongoose, Easy database interaction ***/

mongoose = require('mongoose')
Schema = mongoose.Schema
db = mongoose.connect('mongodb://localhost/boatbook')


/**********************************************************************
*
*
*
*			Models 
*
*	
*
***********************************************************************/

require('./models/users.js')
User = mongoose.model('User')

/**********************************************************************
*
*
*
*			App Configuration 
*
*	
*
***********************************************************************/

//Facebook stuff

const fbId = ""
const fbSecret = ""
const fbCallbackAddress= ""


// Stylus

function compile(str, path) {
  return stylus(str)
	.set('compress', true)
	.use(nib());
}

app.use(stylus.middleware({
    debug: false
  , src: __dirname + '/views'
  , dest: __dirname + '/static'
  , compress: true
  , compile: compile
}));

// Application config

app.configure(function () {
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/static'));
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'b91b024974313a1237063e189a75a83f',
//		store: new RedisStore
		store: MemStore({
			reapInterval: 60000 * 10 
		})
		
	}));
	app.use(form({ keepExtensions: true }));
	app.use(auth([
    	auth.Facebook({appId : fbId, appSecret: fbSecret, scope: "email", callback: fbCallbackAddress})
  	]));
  
});

// Development Environment Configuration 

app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true 
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler())
}).listen(4000)

// Nowjs
everyone = nowjs.initialize(app)

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')


/**********************************************************************
*
*
*
*			Custom Functions, etc. 
*
*	
*
***********************************************************************/

require('./customFunctions')


/**********************************************************************
*
*
*
*			Controllers 
*
*	
*
***********************************************************************/

require('./controllers/users')
require('./controllers/photos')
require('./controllers/nowjs')


/**********************************************************************
*
*
*
*			Experimental Mongo  
*
*	
*
***********************************************************************/

// Create a server with a specific host/port
mongolian = new Mongolian({ keepAlive:15000 })
db3 = mongolian.db('boatbook')
gridfs = db3.gridfs()
//console.log(gridfs.files);

