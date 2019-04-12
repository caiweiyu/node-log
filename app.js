var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
console.log(logger);

//采用connect-mongodb中间件作为Session存储
var session = require('express-session');
var Settings = require('./public/database/settings');
var MongoStore = require('connect-mongodb');
var db = require('./public/database/msession');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//配置ejs文件为html文件
app.engine('html',require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//增加route配置项   设计配置项 /  /home   /login   /logout
app.use('/login',indexRouter);
app.use('/logout',indexRouter);
app.use('/home',indexRouter);

//session配置
app.use(session({
  cookie:{ maxAge : 600000 },
  secret:Settings.COOKIE_SECRET,
  store:new MongoStore({
    username:Settings.USERNAME,
    password:Settings.PASSWORD,
    url:Settings.URL,
    db: db})
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  var err = req.session.error;
  res.locals.message = '';
  if(err){
    res.locals.message = '<div class="alert alert-warning">' + err + '</div>';
  }
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
