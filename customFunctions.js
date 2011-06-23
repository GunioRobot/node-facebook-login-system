/**********************************************************************
*
*
*
*			Helpers
*
*	
*
***********************************************************************/

app.dynamicHelpers(
	{
		session: function(req, res) {
			return req.session
		},
		flash: function(req, res) {
			return req.flash()
		}
	}
)

/**********************************************************************
*
*
*
*			Login system 
*
*	
*
***********************************************************************/

requiresLogin = function(req, res, next) {
	if (req.session.user) {
		next()
	} else {
		res.redirect('/sessions/new?redir=' + req.url)
	}
}

/**********************************************************************
*
*
*
*			Facebook 
*
*	
*
***********************************************************************/

fbPictureLoader = function(fbName, id, callback){
	// Build fb graph url
	userPicUrl = 'http://graph.facebook.com/'+fbName+'/picture?type=large'
	newFileName = crypto.createHash('md5').update(userPicUrl + '' + (new Date()).getTime()).digest('hex')+'.jpg'
	// Create curl command
	cmd = 'curl -L '+userPicUrl+' -o /tmp/'+newFileName
	// Run child command
	exec(cmd, function(error, stdout){
		// Create GridFS object
		file = gridfs.create({
			filename: newFileName,
			contentType: 'image/jpg',
			metadata: { userId: id }
		})
		// Load a file location
		fileLocation = '/tmp/'+newFileName
		// Create readstream from the tmp file location, then pipe the bin data to GridFS
		fs.createReadStream(fileLocation).pipe(file.writeStream())
	})
}

schoolGrabber = function(newUser, fbSchools, callback){
	for (school in fbSchools){
		if (fbSchools[school].type === 'College'){
			newUser.schools.college = fbSchools[school].school.name
		} else if (fbSchools[school].type === 'High School'){
			newUser.schools.highSchool = fbSchools[school].school.name
		} else {
			console.log('No schools!')
		}
	}	
}

loadFacebookAccount = function(fbook_details, loadCallback){
	User.findOne({ facebook_id: fbook_details.user.id }, function(err, account){
		if(account) {
			loadCallback(account)
		}
		else {
//			console.log(fbook_details.user.education)
			// Create user with facebook info
			var newUser = new User()
			newUser.email = fbook_details.user.email
			newUser.facebook_id = fbook_details.user.id
			newUser.firstName = fbook_details.user.first_name
			newUser.lastName = fbook_details.user.last_name
			newUser.gender = fbook_details.user.gender
			newUser.activation.status = true
			
			// Load facebook fb photo, copy to disk, then hit the database
			fbPictureLoader(fbook_details.user.username, newUser._id)
		
			// Grab high school and college from FB account
			schoolGrabber(newUser, fbook_details.user.education)

			newUser.picture = newFileName
			newUser.save(function(){
				loadCallback(newUser)
			})
		}
	})
}

loadAccount = function(req, loadCallback){
	if(req.isAuthenticated()) {
		//load account out of database
		if(req.getAuthDetails().user.id){
			//its a facebook login - try and grab out of db otherwise make a user off of fbook credentials
			var fbook_details = req.getAuthDetails()
			loadFacebookAccount(fbook_details, loadCallback)
		} 
	}
	else {
		loadCallback(null)
	}
}


/**********************************************************************
*
*
*
*			Picture Related Functions 
*
*	
*
***********************************************************************/

defaultImageLoader = function(res, id, pictureType, callback){
	// Load up gridfs and go search for the file that matches the param id
	gridfs.findOne(id , function(err, photo) {
		call = photo.readStream().pipe(res)
		// Throw some errors if they pop up
		if (err) throw err
		// If the type matches profile, then route to the right logic
		if (pictureType === 'profiles'){
			// Just in case the photo comes back undefined, make sure we route the profile default img
			if (!photo){
				// Pass the callback redirection to the default jpg
				callback(res.redirect('/img/profileDefault.jpg'))
			} else {
				// If everything goes as planned, then give stream the gridfs object data and pipe to response
				callback(call)
			}
		} else if (pictureType === 'boats'){
			if (!photo){
				callback(res.redirect('/img/boatDefault.jpg'))
			} else {
				callback(call)
			}
		} else {
			console.log('Sorry, you need valid pictureType parameters.')
		}
	})
}
