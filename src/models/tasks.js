const mongoose = require('mongoose');
const validator = require('validator');


const taskSchema = mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		required: true,
		trim: true
	},
	title: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		trim: true,
		maxlength: 50,
	},
	deadline: {
		type: Date,
		required: false,
		trim: true,
	},
	tag: {
		type: String,
		default: 'medium',
		trim: true
	},
	completed : {
		type : Boolean , 
		default : false 
	}
}, { timestamps: true });

const Tasks = mongoose.model('task', taskSchema);

module.exports = Tasks;