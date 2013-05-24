
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var app = express();
var partials = require('express-partials');
// all environments
app.configure(function(){
        app.set('view options',{layout:true});
        app.set('port', process.env.PORT || 3000);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.use(flash());
        app.use(partials());
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser('your secret here'));
        app.use(express.session({
            secret: settings.cookieSecret,
            store:  new MongoStore({
                db: settings.db,
                host: settings.host
            })
        }));
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));

// development only
        if ('development' == app.get('env')) {
            app.use(express.errorHandler());
        }
        app.get('/', routes.index);
        app.get('/reg', routes.reg);
        app.post('/reg',routes.doReg);
        app.use({
            user:  function (req, res) {
                return  req.session.user;
            },
            error: function (req, res) {
                var  err = req.flash('error');
                if (err.length)
                    return  err;
                else
                    return  null;
            },
            success:  function (req, res) {
                var  succ = req.flash('success');
                if (succ.length)
                    return  succ;
                else
                    return null ;
            }
        });
        app.get('/login', routes.login);
        app.post('/login', routes.doLogin);
        app.get('/logout', routes.logout);
        app.post('/post', routes.doPost);
        app.get('/u/:user', routes.post);
    }
);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
