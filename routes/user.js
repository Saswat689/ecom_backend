const router = require("express").Router();
const {verifyTokenAndAuthorization,verifyTokenAndAdmin} = require("../middlewares/verifyToken")
const CryptoJS = require("crypto-js");
const { isValidObjectId } = require("mongoose")
const User = require("../models/User")

//edit user
router.put('/:id',verifyTokenAndAuthorization,async (req,res) => {
	if (req.body.password) {
		res.body.password = CryptoJS.AES.encrypt(pass, process.env.CRYPTO_KEY).toString()
	}
	try{
		//verify object id.
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//update query
		const updatedUser = await User.findByIdAndUpdate(req.params.id,{
			$set: req.body
		},{new: true}).lean().exec()

		const {password,...others} = updatedUser;
		return res.status(200).json(others)

	} catch(err) {
		res.status(500).json(err.message)
	}
})

//delete user
router.delete("/:id",verifyTokenAndAuthorization,async (req,res) => {
	try{
		//validate object id
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//delete query
		await User.findByIdAndDelete(req.params.id).lean().exec()
		return res.status(200).json({
			message: "User has been deleted",
			success: true
		})
	} catch (err) {	
		res.status(500).json(err)
	}
})

//get user
router.get("/:id",verifyTokenAndAdmin,async (req,res) => {
	try{
		//validate object id
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//get query
		const user = await User.findById(req.params.id).lean().exec()
		
		const { password,...others } = user;

		return res.status(200).json({
			user: others,
			success: true
		})
	} catch (err) {	
		return res.status(500).json(err)
	}
})

//get all users
router.get("/",verifyTokenAndAdmin,async (req,res) => {
	const query = req.query.new
	try{

		//get query
		const users = query
		//sort users in desc order
		? await User.find().sort({_id: -1}).limit(5).lean().exec()
		: await User.find().lean().exec()

		return res.status(200).json({
			users: users,
			success: true
		})
	} catch (err) {	
		return res.status(500).json(err)
	}
})

//get user stats(users registered )
router.get("/stats",verifyTokenAndAdmin,async (req,res) => {
	console.log("hit")
	const date = new Date.now();
	const lastYear = new Date(date.setFullYear(date.getFullYear() - 1)); //last year
	
	try{
		const data = await User.aggregate([
			//match all users who registered after last year
			{ $match: { createdAt: { $gte: lastYear } } },
			//return a month field that has createdAt values.
			{
				$project: {
					month: { $month: "$createdAt" }
				}
			},
			//count persons who registered in all months.
			{
				$group: {
					_id: "$month",
					total: { $sum: 1 }
				}
			}
		])
		return res.json(data).status(200)
	} catch(err) {
		return res.status(500).json(err)
	}
})

module.exports = router;
