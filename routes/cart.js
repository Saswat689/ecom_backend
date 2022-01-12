const router = require("express").Router();
const {verifyTokenAndAuthorization,verifyTokenAndAdmin,verifyToken} = require("../middlewares/verifyToken")
const CryptoJS = require("crypto-js");
const { isValidObjectId } = require("mongoose")
const Cart = require("../models/Cart")

//create cart
router.post("/",verifyToken,async (req,res) => {
	const newCart = new Cart(req.body)

	try{
		const savedCart = await newCart.save();
		res.status(200).json({
			savedCart: savedCart,
			success: true
		})
	} catch (err) {
		res.status(500).json(err)
	}
})



//edit cart
router.put('/:id',verifyTokenAndAuthorization,async (req,res) => {
	try{
		//verify object id.
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//update query
		const updatedCart = await Cart.findByIdAndUpdate(req.params.id,{
			$set: req.body
		},{new: true}).lean().exec()

		return res.status(200).json(updatedCart)

	} catch(err) {
		res.status(500).json(err.message)
	}
})

//delete cart
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
		await Cart.findByIdAndDelete(req.params.id).lean().exec()
		return res.status(200).json({
			message: "Cart has been deleted",
			success: true
		})
	} catch (err) {	
		res.status(500).json(err)
	}
})

//get cart
router.get("/:id",verifyTokenAndAuthorization,async (req,res) => {
	try{
		//validate object id
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//get query
		const cart = await Cart.findOne({ userId: req.params.id }).lean().exec()

		return res.status(200).json({
			cart,
			success: true
		})
	} catch (err) {	
		return res.status(500).json(err)
	}
})

//get all products in cart

router.get("/",verifyTokenAndAdmin,async (req,res) => {
	try{
		const carts = await Cart.find().lean().exec()
		res.status(200).json(carts)
	} catch (err) {
		res.status(500).send(err)
	}
})

module.exports = router;
