const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tasks = require('./tasks');


//This is used to define the schema of our mogodb document
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		validate(value) {
			let b = validator.isEmail(value);
			if (!b)
				throw "The given email value is not valid";
		},
		trim: true
	},
	name: {
		type: String,
		default: 'untitled user',
		trim: true
	}, password: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
	avatar: {
		type: String
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}]
}, {
	timestamps: true
});


//This method is a just a method that is binded with the User Model to be used again and again when required
userSchema.methods.getPublicProfile = function () {
	const user = this;
	const obj = user.toObject();

	delete obj.password;
	delete obj.tokens;

	return obj;
}


//This menthod is used to hash the password before storing the user , it runs automatically before the 
//user is saved , also These are called middleware methods 
userSchema.pre('save', async function (next) {
	const user = this;

	if (user.isModified('password'))
		user.password = await bcrypt.hash(user.password, 4);
	next();
})

//This method verifies the user credentials
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email: email });

	if (!user)
		throw new Error("No user found with given email");

	const isMatch = bcrypt.compare(password, user.password);
	if (!isMatch)
		throw new Error("Bad Credentials");

	return user;
}

//This method generates the authToken
userSchema.methods.generateAuthToken = async function () {
	const user = this;

	const token = jwt.sign({
		_id: this._id.toString(),
		email: this.email
	}, "secret1210");

	await user.tokens.push({ token });
	await user.save();

	return token;
}


//This method helps to make Tasks cascade when user is deleted 
userSchema.pre('remove', async function (next) {
	const user = this;
	const id = this._id;

	await Tasks.deleteMany({ userId: id });
	next();
})

//The Schema is registered 
const User = mongoose.model('user', userSchema);

module.exports = User;