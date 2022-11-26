const mongoose = require("mongoose");

const userAttemptSchema = new mongoose.Schema({
	word: {
		type: String,
	},
	isCorrect: {
		type: Boolean,
		default: false,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});
module.exports = mongoose.model("UserAttempt", userAttemptSchema);
