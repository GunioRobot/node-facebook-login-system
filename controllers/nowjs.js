/**********************************************************************
*
*
*
*			Nowjs  
*
*	
*
***********************************************************************/

// Find user profile
everyone.now.user = function(email, callback){
	User.findOne({ email: email }, function(err, account){
		if (account){
			callback({ firstName: account.firstName, lastName: account.lastName, picture: account.picture })
		} else {
			callback(null)
		}
	})
}
