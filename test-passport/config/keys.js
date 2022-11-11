require('dotenv').config();

module.exports = {
	MongoURI: 'mongodb+srv://' + process.env.UNAME + ':' + process.env.PASSWORD + '@' + process.env.SERVER
}