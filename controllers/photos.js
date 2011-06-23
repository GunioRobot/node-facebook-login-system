/*
*			Render profile photos
*/
app.get('/profiles/:id', function(req, res) {
	defaultImageLoader(res, req.params.id, 'profiles', function(callback){})
})
/*
*			Change Photo
*/
app.post('/home/photos', requiresLogin, function(req, res) {
	req.form.complete(function(err, fields, files) {
		if (err) throw err
		User.findById(req.session.user._id, function(err, user) {
			if (user) {
				/*
				*			Photo upload
				*/
				// Create a hash of the file to ensure uniqueness 
				fileHash = crypto.createHash('md5').update(files.photo.path + '' + (new Date()).getTime()).digest('hex');
				newFileName = (fileHash + '.jpg');
				// Create gridFS object
				file = gridfs.create({
					filename: newFileName,
					contentType: 'image/jpg',
					metadata: { userId: req.session.user._id }
				})
				// Read the file stream and pipe gridfs
				fs.createReadStream(files.photo.path).pipe(file.writeStream())
				/*
				*			Remove Previous file from GridFS
				*/
				gridfs.findOne(req.session.user.picture, function(err, photo) {
					if (err) throw err
					if (!photo){
						console.log('Undefined.')
					} else {
						photo.remove()
					}
				})
				user.picture = newFileName
				req.session.user.picture = newFileName
				user.save(function(){
					res.redirect(req.headers.referer)
				})
			} else {
				console.log('User not found.')
			}
		})
	})
})