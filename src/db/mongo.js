//This whole file basically runs to create a connection with the database

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://raghu65_1:100100100xyyxZ@cluster1.cgo2s.mongodb.net/task-manager-api?retryWrites=true&w=majority',{
	useNewUrlParser : true , useUnifiedTopology : true , useCreateIndex : true
});
