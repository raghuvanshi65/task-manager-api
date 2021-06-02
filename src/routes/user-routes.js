const User = require('../models/user');
const express = require('express');
const router = express.Router();
const hash = require('../utility/hashpassword').hash;
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const multer = require('multer');

//This is to customize our multer
const upload = multer({
	dest: './images',
	limits: {
		fileSize: 5000000
	},

	//This function is to check the file is valid or not according to our requirements
	fileFilter(req, file, cb) {
		if (!file.originalname.match('\.(doc|docx|pdf)$'))
			cb(new Error('Please upload correct file !!'));
		cb(undefined, true);
	}
})

//This registers the user also has a middleware function that gererates a jwt token
router.post('/user/register', (req, res) => {
	if (req.body == null)
		return res.status(400).send("Request body cannot be empty");
	try {
		const user = new User(req.body);
		user.save().then(async (result) => {
			const token = await user.generateAuthToken();
			return res.status(200).send({ user: user.getPublicProfile(), token });
		}).catch((err) => {
			console.log(err);
			return res.status(500).send("An error occurred");
		})
	} catch (err) {
		return res.status(500).send("An error occurred while creating the user");
	}
})

//This logins the user also has a middleware function that gererates a jwt token
router.post('/user/login', async (req, res) => {
	if (req.body.email == null || req.body.password == null)
		return res.status(400).send("Credentials are not passed completely !");

	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		if (user) {
			const token = await user.generateAuthToken();
			const { name, _id, email, tokens } = user;
			return res.status(200).send({ name, _id, email, tokens, token });
		}
	} catch (err) {
		return res.status(400).send("Bad Credentials");
	}
})

//This function explains how to take in the file into req and how to handle errors that are thrown
//by the multer file validations by using a 4th argument as a function  
//also shows that we can authorize and upload by using 2 middlewares in same function 
router.post('/user/avatar/upload', auth, upload.single('file'), async (req, res) => {
	try {
		req.user.avatar = req.file.filename;
		await req.user.save();
		return res.status(200).send();
	} catch (error) {
		res.status(500).send(error);
	}
} , (error , req , res , next)=>{
	if(error)
		res.status(400).send(error.message);
})

//This function logs out the current session of user
router.post('/user/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => {
			return token.token !== req.token;
		});

		await req.user.save();
		res.status(200).send("Logged Out");
	} catch (error) {
		res.status(500).send("An Exception occurred !!");
	}
})

//This logs out of all sessions of user
router.post('/user/logoutall', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.status(200).send("Logged Out Of All Sessions !");
	} catch (error) {
		res.status(500).send("An Exception occurred !!");
	}
})

//Deletes the user profile or account
router.delete('/users/delete/myprofile', auth, (req, res) => {
	id = req.user._id;
	User.deleteMany({ _id: id }).then((result => {
		if (result.deletedCount > 0)
			return res.status(200).send("user with id " + id + " id being deleted !");
		return res.status(404).send("No User with given id : " + id + " is found !");
	})).catch(err => {
		return res.status(500).send("An error occurred while deleting the user account");
	})
})


//get user profile
router.get('/users/myprofile', auth, (req, res) => {
	const { email, name, _id } = req.user;
	return res.status(200).send({ _id, email, name });
})

//update user profile
router.patch('/users/update/myprofile', auth, (req, res) => {
	let keys = Object.keys(req.body);
	const updatesAllowed = ['name'];
	const isValid = keys.every((update) => updatesAllowed.includes(update));

	if (!isValid)
		return res.status(400).send("You do not have permissions to update this information");

	try {
		User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true, useFindAndModify: false }).then((result) => {
			if (!result)
				return res.status(404).send("No User was found with the given id : " + id);
			const { name, _id, email } = result;
			return res.status(200).send({ name, _id, email });
		}).catch((err) => {
			return res.status(500).send("Error occurred");
		});
	} catch (err) {
		return res.status(500).send("Error occurred");
	}
})

module.exports = router;