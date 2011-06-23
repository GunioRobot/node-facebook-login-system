/**********************************************************************
*
*
*
*			Main 
*
*	
*
***********************************************************************/
/**
 *		Main Site
 */ 

app.get('/', function(req, res) {
	res.render('sessions/frontPage')
})

/**
 *		Home
 */

app.get('/home', requiresLogin, function(req, res) {
	initial = req.session.user.lastName
	res.render('home/index', {initial: initial[0]})
})

/**
 *		User profile edit 
 */

app.get('/user/edit', requiresLogin, function(req, res){
	initial = req.session.user.lastName
	res.render('user/edit', {initial: initial[0]})
})




/**********************************************************************
*
*
*
*			Facebook 
*
*	
*
***********************************************************************/

app.get('/auth/facebook', function(req,res) {
	req.authenticate(['facebook'], function(error, authenticated) {
		loadAccount(req,function(account){
			if(authenticated === true){
				if(account && !account.username) {
					req.session.user = account
					res.redirect('/home')
				}
				else {
					res.redirect('/')
				}
			}
		})
	})
})



/**********************************************************************
*
*
*
*			User System
*
*	
*
***********************************************************************/

app.get('/sessions/new', function(req, res) {
	res.render('sessions/new', {redir: req.query.redir})
})

app.get('/sessions/destroy', function(req, res) {
	// Kill local session
	delete req.session.user
	// Log facebook out as well
	req.logout()
	res.redirect('/')
})

app.post('/sessions', function(req, res) {
	User.authenticate(req.body.email, crypto.createHash('md5').update(req.body.password).digest('hex'), function (user) {
		if (user) {
			req.session.user = user
			res.redirect(req.body.redir || '/home')
		} else {
			req.flash('warn', 'Login failed')
			res.render('sessions/new', {redir: req.body.redir})
		}
	})
})


/**********************************************************************
*
*
*
*			Registrations
*
*	
*
***********************************************************************/

app.get('/register', function(req, res) {
	res.redirect('register/new')
})


app.get('/register/new', function(req, res) {
	res.render('register/new', { user: req.body && req.body.user || new User() })
})


app.post('/register', function(req, res) {
	User.checkEmail(req.body.user.email, function (user) {
		if (user) {
			req.flash('warn', 'Sorry, that e-mail exists already.');
			res.render('register/new', {redir: req.body.redir})
		} else {
			timestamp = new Date()
			stringVar = timestamp+''
			authCode = crypto.createHash('md5').update(stringVar).digest('hex')
			
			var email = req.body.user.email
			var firstName = req.body.user.firstName
			var lastName = req.body.user.lastName
			var password = crypto.createHash('md5').update(req.body.user.password).digest('hex')
			var encryptedUser = { 'activation.authCode': authCode, password: password, email: email, lastName: lastName, firstName: firstName }
			var user = new User(encryptedUser)
			user.save(function() {
				res.redirect('/register/thanks')
			});
		}
	})
})

/**********************************************************************
*
*
*
*			Account Activation
*
*	
*
***********************************************************************/

app.get('/register/thanks', function(req, res) {
	res.render('register/thanks');
})

app.get('/activation/:authCode', function(req, res) {
	User.findOne({ 'activation.authCode' : req.params.authCode}, function(err, activation) {
		if (activation) {
			req.flash('warn', activation.email);
			User.update({ email: activation.email }, { 'activation.authCode': null, 'activation.status': true },function(err, docs) { if (err) {} })
			res.render('activation/success');
		} else {
			req.flash('warn', 'Activation Code is not valid.');
			res.render('activation/fail');
		}
	})
})


/**********************************************************************
*
*
*
*			Password Recovery System
*
*	
*
***********************************************************************/


app.get('/settings/resetPass', function(req, res) {
	res.render('resetPass/index', {resetPass: req.body && req.body.email })
})

app.post('/settings/resetPass', function(req, res) {
	User.checkEmail(req.body.user.email, function (user) {
		if (user) {
			req.flash('warn', 'An email was sent to your address, please check your inbox.')	
			// Build authCode for email Recovery
			timestamp = new Date()
			stringVar = timestamp+''
			authCode = crypto.createHash('md5').update(stringVar).digest('hex')
			// Update user codes
			User.update({ email: req.body.user.email }, { 'resetPass.authCode': authCode, 'resetPass.created': timestamp }, function(err, docs) { if (err) {} })
			res.render('resetPass/preset', {redir: req.body.redir })
		} else {
			req.flash('warn', 'Sorry that e-mail address does not exist.')
			res.render('resetPass/index')
		}
	})
})

app.get('/settings/resetPass/:authCode', function(req, res) {
	User.findOne({ 'resetPass.authCode' : req.params.authCode}, function(err, passwordrecoveries) {
		if (passwordrecoveries) {
			req.flash('warn', 'test')
			// Pass user emailinput to session 
			req.session.email = passwordrecoveries.email;
			res.render('resetPass/emailinput', {user: req.body && req.body.user,  passwordrecoveries: passwordrecoveries })
		} else {
			req.flash('warn', 'Sorry that URL does not exist.')
			res.render('resetPass/show')
		}
	})
})

app.post('/settings/resetPass/complete', function(req, res) {
	req.flash('warn', req.session.email)
	// Delete the authcode and timestmap so the URL is properly broken.
	User.findOne({ email: req.session.email }, function(err, foundUser) {
		User.update({ email: req.session.email }, { password: crypto.createHash('md5').update(req.body.user.password).digest('hex') },function(err, docs) { if (err) {} })
		User.update({ email: req.session.email }, { 'resetPass.authCode': null, 'resetPass.created': null },function(err, docs) { if (err) {} })
	})
	res.render('resetPass/recoveryComplete');
})





