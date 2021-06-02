const express = require('express');
const app = express();

const userRoute = require('./routes/user-routes'); 
const taskRoute = require('./routes/task-routes');

const PORT = process.env.PORT || 8080;

//Loads the database , basically connects to the database
require('./db/mongo');

//converts req.body to json format
app.use(express.json());

//registers the router obj 
app.use(userRoute);
app.use(taskRoute);

//This exposes all the routes that can be used
app.get('/expose' , (req , res) =>{
	const routes = [];
	app._router.stack.forEach(function(middleware){
		if(middleware.route){ // routes registered directly on the app middleware
		    routes.push({ route : middleware.route.path , method : middleware.route.stack[0].method});
		} else if(middleware.name === 'router'){ // routes registered on router middleware 
		    middleware.handle.stack.forEach(function(handler){
			  route = handler.route;
			  route && routes.push({ route : route.path , method : route.stack[0].method});
		    });
		}
	  });
	res.send(routes);
})

//starts the application on the given port
app.listen(PORT , ()=>{
	console.log("The application is up and running on "+PORT);
})