module.exports = function(app, passport) {

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs');
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            
            failureRedirect : '/login',

            failureFlash : 'Invalid username or password.'

		}),
        function(req, res) {
            console.log("hello");
            req.flash("success","Welcome back! "+req.user.username);
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/videos');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs');
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : 'Oops, your username or password is not valid.' // allow flash messages
	}), function(req, res) {
		req.flash("success", "Hi, " + req.user.username + " .Welcome for the first time! ")
		res.redirect('/videos')
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		req.flash("success", "Logged you out!");
		res.redirect('/videos');
	});
};
