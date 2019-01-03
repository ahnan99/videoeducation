var express = require("express");
var app = express();
var multer=require("multer")
var fs=require("fs")
var bodyParser = require("body-parser")
var mysql  = require('mysql'); 
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy; 
var morgan = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var middleware = require("./middleware");
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);


connection.query('USE ' + dbconfig.database);


app.use(express.static('public'))
app.use("/bootstrap",express.static("lib/bootstrap/"));
app.use(express.static(__dirname+"/public"));


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}))
app.use(require("express-session")({
	secret: "Rusty",
	resave: false,
	saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});




var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/Users/liuyinan/Documents/Web/upload/public/uploadvideos')
  },
  filename: function (req, file, cb) {
    const filenameArr = file.originalname.split('.');
    cb(null,Date.now() + '.' + filenameArr[filenameArr.length-1]);
  }
})
 
var upload = multer({ storage: storage })


//----------- auth---------

require('./routes/auth.js')(app, passport);
require('./config/passport')(passport); // pass passport for configuration


app.get("/", function(req, res){
  res.render("landing");
});

app.get("/videos", function(req, res){
		

	var  sql = 'SELECT * FROM videos';
	connection.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
 
	 res.render("videos", {videos: result});
	});
  	
});

app.get("/videos/new", middleware.isLoggedIn, function(req,res){
	res.render("new");
})



app.post("/videos", middleware.isLoggedIn, upload.single('video'), function(req,res,next){

	console.log("上传文件信息如下：");
	console.log(req.file);
	console.log(req.body);
	var name = req.body.name;
	var image = req.body.image;
	var path = req.file.path;
	path = path.substring(path.indexOf('uploadvideos') - 1);
	
	var  sql = 'INSERT INTO videos (video_name, video_img, video_path, username) VALUES(\'' + name + '\',\'' + image + '\',\'' + path + '\',\'' + req.user.id + '\')';
	connection.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          res.send("error uploading");
          return;
        }
 
       console.log('--------------------------SELECT----------------------------');
       console.log(result);
       console.log('------------------------------------------------------------\n\n');  
       res.redirect("/videos");
  });
  

});

app.get("/videos/:videoid", function(req, res){
	var videoid = req.params.videoid;
	var  sql = 'SELECT * FROM  `videos` WHERE id = ' + videoid;
	connection.query(sql,function (err, result) {
        if(err){
          console.log(err);
          return;
        }
 
       console.log('--------------------------VIDEO SELECT----------------------------');
       console.log(result);
       console.log('------------------------------------------------------------\n\n');  
       var usersql = 'select * from `users` where id =' + result[0].username;
       connection.query(usersql,function (err, userresult) {
        if(err){
          console.log(err);
          return;
          
        }
        console.log('--------------------------USER SELECT----------------------------');
       console.log(result);
       console.log('------------------------------------------------------------\n\n'); 
        res.render("watchvideo", {video: result, uploader:userresult});
       
	});
	

})
})




app.listen(8080, function(){
    console.log("upoload started");
});