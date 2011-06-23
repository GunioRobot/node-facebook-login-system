/**********************************************************************
*
*
*
*			Users Model
*
*	
*
***********************************************************************/

var Comment = new Schema({
	title: String,
	email:  {type: String, validate: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/},
	body: String 
});

var Photo = new Schema({
	filename: String,
	commentGroup: String,
	album: String,
	profilePrime: {type: Boolean, default: false },
	rank: Number,
	votes: Number,
	comments: [Comment]
});

var User = new Schema({
	email:  {type: String, validate: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/, index: true },
	nickname: String,	
	picture: String,
	firstName: String,
	lastName: String,
	password: String,
	schools: {
		college: String,
		highSchool: String,
	},
	created: {type: Date, default: Date.now }, 
	activation: {
		authCode: {type: String },
		status: {type: Boolean, default: false },
	},
	resetPass: { 
		authCode: {type: String }, 
		created: {type: String }
	},
	facebook_id: {type: Number, index: true },
	photos: [Photo]
})

User.static({
	authenticate: function(email, password, callback){
		this.findOne({ email:email, password:password, 'activation.status' : true }, function(err, doc){
			callback(doc)
		})
	},
	checkEmail: function(email, callback){
		this.findOne({ email: email }, function(err, doc) {
			callback(doc)
		})
	},
	fieldProperties: function(fieldName, propertyName){
		fieldRef = User.path(fieldName)
		if (fieldRef.options[propertyName]) {
			return fieldRef.options[propertyName]
		}
		return
	},
})

module.exports.authenticate = function(email, password, callback) {
	var user = users[email]
	if (!user) {
		callback(user)
		return
	}
	if (user.password == password) {
		callback(null)
		return
	}
	callback(null)
};
		
module.exports.checkEmail = function(email, callback) {
	if (user) {
		callback(null)
		return
	}
	callback(null)
};


mongoose.model('User', User)
