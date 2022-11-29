const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const User = require("./model/user");
const UserAttempt = require("./model/userAttempt");
const session = require("express-session");
const fs = require("fs");
require("dotenv").config();

//Setting the encodings for post requests
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use(session({ secret: "sdksjdk03903902", name: "uniqueSessionID", saveUninitialized: false }));
app.locals.baseURL = process.env.BASE_URL;

//Connecting to the MongoDB Altas Database

const connURL = "mongodb+srv://root:123@cluster0.6pmfocv.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(connURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const con = mongoose.connection;
con.on("open", () => {
	console.log("Connected To Database");
});

//Making the server to listen to a port
app.listen(8080, () => {
	console.log("SERVER STARTED.....");
});

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/contact", (req, res) => {
	res.render("contact.ejs");
});

app.get("/login", (req, res) => {
	res.render("login.ejs", { message: "" });
});

app.post("/login", async (req, res) => {
	try {
		const { loginUser, loginPassword } = req.body;
		const user = await User.findOne({ username: loginUser, password: loginPassword });
		if (!user) {
			res.render("login", { message: "Username or password incorrect" });
		} else {
			res.locals.username = req.body.username;
			req.session.loggedIn = true;
			req.session.username = res.locals.username;
			res.redirect("dashboard");
		}
	} catch (err) {
		res.render("login", { message: "Error Occured" });
	}
});

app.get("/logout", (req, res) => {
	req.session.destroy((err) => {});
	res.redirect("/");
});

app.get("/signup", (req, res) => {
	res.render("signup.ejs", { message: "" });
});

app.post("/signup", async (req, res) => {
	try {
		console.log(req.body);

		if (req.body.password !== req.body.confirmPassword) {
			return res.render("signup.ejs", { message: "Password mismatch" });
		}
		const newUser = await User.create(req.body);

		res.render("signup.ejs", { message: `Registered Successfully, Please login to continue` });
	} catch (err) {
		console.log(err);
		res.render("signup.ejs", { message: "Registration Failed" });
	}
});

app.get("/dashboard", (req, res) => {
	if (req.session.loggedIn) {
		res.render("dashboard.ejs", { message: "" });
	} else {
		res.redirect("/login");
	}
});

app.post("/addNewWord", async (req, res) => {
	const { word } = req.body;
	const keysOpt = JSON.parse(fs.readFileSync("./public/words.json"));
	keysOpt[word] = 1;
	fs.writeFileSync("./public/words.json", JSON.stringify(keysOpt, null, " "));
	console.log(word);
	res.status(200).json({ message: "Dictionary Updated" });
});

app.post("/addSearchedWord", async (req, res) => {
	try {
		console.log("here");
		const { word, isCorrect } = req.body;
		console.log(req.body);
		const addedWord = await UserAttempt.create({ word: word, isCorrect: isCorrect, timestamp: Date.now() });
		res.status(200).json({ message: "Added new data" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: err });
	}
});

app.get("/userAttempts", async (req, res) => {
	try {
		const userAttempts = await UserAttempt.find({});
		res.status(200).json({ message: "Success", data: userAttempts });
	} catch (err) {
		res.status(500).json({ message: err });
	}
});

app.get("/failedAttempts", async (req, res) => {
	try {
		const userAttempts = await UserAttempt.find({ isCorrect: false });
		res.status(200).json({ message: "Success", data: userAttempts });
	} catch (err) {
		res.status(500).json({ message: err });
	}
});

app.get("/correctAttempts", async (req, res) => {
	try {
		const userAttempts = await UserAttempt.find({ isCorrect: true });
		res.status(200).json({ message: "Success", data: userAttempts });
	} catch (err) {
		res.status(500).json({ message: err });
	}
});
