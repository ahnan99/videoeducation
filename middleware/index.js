//all middleware
var middlewareObj = {};


middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("/login");
		console.log('need to login')
	}
}



module.exports = middlewareObj;