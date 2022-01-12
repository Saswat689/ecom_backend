const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const { registerSchema,loginSchema } = require("../helpers/validateAuth")
const jwt = require("jsonwebtoken")
//register
router.post("/register",async (req,res) => {
	try{
		const { username,email,pass } = req.body;

		// validate fields
		const { error } = registerSchema.validate({ username: username,email: email,password: pass });
		if(error) {
			//validation error object
			return res.json({
				error: error,
				success: false
			}).status(400)
		}

		//create a new user
		const newUser = new User({
			username: username,
			email: email,
			password: CryptoJS.AES.encrypt(pass, process.env.CRYPTO_KEY).toString()
		})
		const savedUser = await newUser.save();

		//create a token
		const accessToken = jwt.sign({
			id: savedUser._id,
			isAdmin: savedUser.isAdmin
		},process.env.JWT_SECRET,{
			expiresIn: "3d"
		})

		//send the savedUser
		const { password,...others } = savedUser._doc;

		return res.status(201).json({
			savedUser: {...others,accessToken},
			success: true
		})

	} catch (err) {
		//respond with an error
		return res.status(500).json(err.message)
	}
})

//login
router.post("/login",async (req,res) => {
	try{
		const { email,pass } = req.body;

		// validate fields
		const { error } = loginSchema.validate({ email: email,password: pass });
		if(error) {
			//validation error object
			console.log("validation error",error)

			return res.status(400).json({
				message: error.details[0].message,
				success: false
			})
		}

		//try to find the user
		const userFound = await User.findOne({ email: email }).lean().exec()

		//user not found
		if (!userFound) {
			console.log("email wrong")
			return res.status(404).json({
				message: "email or password is wrong",
				success: false
			})
		}

		console.log(userFound)

		//decrypt the password
		const decryptPass = CryptoJS.AES.decrypt(
			userFound.password,
			process.env.CRYPTO_KEY
		).toString(CryptoJS.enc.Utf8)

		console.log(decryptPass)

		//compare password
		if(decryptPass !== pass) {
			console.log("pass wrong")
			return res.status(404).json({
				message: "email or password is wrong",
				success: false
			})
		}

		//create a token
		const accessToken = jwt.sign({
			id: userFound._id,
			isAdmin: userFound.isAdmin
		},process.env.JWT_SECRET,{
			expiresIn: "3d"
		})

		//send the savedUser
		const { password,...others } = userFound;

		return res.status(200).json({
			user: others,
			accessToken,
			success: true
		})

	} catch (err) {
		//respond with an error
		console.error(err)
		return res.status(404).json({
			message: "Something went wrong",
			success: false
		})
	}
})


module.exports = router;
