const bcrypt = require('bcryptjs');


//This function is not being used in the code , but anyway it hashes the password if used
const hashThePassword = async (password) =>{
	const hashed = await bcrypt.hash(password , 4);
	return hashed.toString();
}


module.exports = {
	hash : hashThePassword
}