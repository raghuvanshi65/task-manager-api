const Tasks = require('../models/tasks');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { query } = require('express');


//This method basically adds the task , restricted to the current user
router.post('/tasks/add', auth, (req, res) => {
	if (!req.body)
		return res.status(400).send("Body cannot be empty");

	req.body.userId = req.user._id;
	const task = new Tasks(req.body);
	task.save().then(result => {
		return res.status(200).send(result);
	}).catch(err => {
		return res.status(500).send("An exception occurred while adding new Taskk !!");
	})
})


//This method gets all the tasks based on the current user and the filters
//completed , remains , limit , skip , sorted
router.get('/tasks/get/all', auth, (req, res) => {
	const userId = req.user._id;
	const match = {};

	if (req.query.completed)
		match.completed = req.query.completed === 'true'
	if (req.query.remains && req.query.remains === 'true') {
		match.deadline = {
			$gte: new Date()
		}
	}
	let limit = undefined;
	let skip = undefined;

	if(req.query.limit)
		limit = parseInt(req.query.limit);
	if(req.query.skip)
		skip = parseInt(req.query.skip);

	Tasks.find({ userId: mongoose.Types.ObjectId(userId), ...match }).limit(limit).skip(skip).sort({
		createdAt : -1 , title : 1
	}).then((result) => {
		res.status(200).send(result);
	}).catch(err => {
		console.log(err);
		res.status(500).send("An exception occurred while trying to retrieve tasks for user : " + userId);
	})
})


//This is used to update a task with the given id
router.patch('/tasks/update/:id', auth, (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['title', 'description', 'deadline', 'tag'];
	let isValidOpt = updates.every(update => allowedUpdates.includes(update));

	if (!isValidOpt)
		return res.status(400).send("You cannot update these fields");

	let id = mongoose.Types.ObjectId(req.params.id);

	Tasks.findOneAndUpdate({ _id: id, userId: req.user._id }, req.body, { new: true, runValidators: true, useFindAndModify: true }).then(result => {
		console.log("Coming till here 1");
		if (!result)
			return res.status(404).send("No Task was found with the given id : " + id);
		return res.status(200).send(result);
	}).catch(err => {
		return res.status(500).send("Error occurred");
	})
})


//This is used to delete a task with the given id
router.delete('/tasks/del/:id', auth, (req, res) => {
	let id = req.params.id;
	if (id == null)
		return res.status(400).send("This is an extremely bad request");

	id = mongoose.Types.ObjectId(id);
	Tasks.deleteMany({ _id: id, userId: req.user._id }).then((result) => {
		if (result.deletedCount == 0)
			return res.status(404).send('Task with given id is not found !!');
		return res.status(200).send(`task with id : ${id} is being deleted !!`);
	}).catch(err => {
		return res.status(500).send("An exception occurred while deleting new Taskk !!");
	})
});

module.exports = router;