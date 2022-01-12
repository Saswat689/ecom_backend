const router = require("express").Router();
const {verifyTokenAndAuthorization,verifyTokenAndAdmin,verifyToken} = require("../middlewares/verifyToken")
const CryptoJS = require("crypto-js");
const { isValidObjectId } = require("mongoose")
const Order = require("../models/Order")

//create order
router.post("/",verifyToken,async (req,res) => {
	const newOrder = new Order(req.body)

	try{
		const savedOrder = await newOrder.save();
		res.status(200).json({
			savedOrder: savedOrder,
			success: true
		})
	} catch (err) {
		res.status(500).json(err)
	}
})



//edit order
router.put('/:id',verifyTokenAndAdmin,async (req,res) => {
	try{
		//verify object id.
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//update query
		const updatedOrder = await Order.findByIdAndUpdate(req.params.id,{
			$set: req.body
		},{new: true}).lean().exec()

		return res.status(200).json(updatedOrder)

	} catch(err) {
		res.status(500).json(err.message)
	}
})

//delete order
router.delete("/:id",verifyTokenAndAdmin,async (req,res) => {
	try{
		//validate object id
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//delete query
		await CartOrder.findByIdAndDelete(req.params.id).lean().exec()
		return res.status(200).json({
			message: "CartOrder has been deleted",
			success: true
		})
	} catch (err) {	
		res.status(500).json(err)
	}
})

//get user orders
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
		const orders = await Order.find({ userId: req.params.id }).lean().exec()

		return res.status(200).json({
			orders,
			success: true
		})
	} catch (err) {	
		return res.status(500).json(err)
	}
})

//get all orders

router.get("/",verifyTokenAndAdmin,async (req,res) => {
	try{
		const orders = await Order.find().lean().exec()
		res.status(200).json(orders)
	} catch (err) {
		res.status(500).send(err)
	}
})

// get monthly income
router.get("/income",verifyTokenAndAdmin,async (req,res) => {
	const productId = req.query.pid;
	const date = new Date(); //sep
	const lastMonth = new Date(date.setMonth(date.getMonth() - 1)) //aug
	const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1)) //jul

	try{
		const income = await Order.aggregate([
			{ $match: { createdAt: { $gte: previousMonth }, ...(productId && (
				products: { $elemMatch: { productId } } //if there is an id in query than match that product as well
			)) } },
			{
				$project: {
					month: { $month: "$createdAt" },
					sales: "$amount"
				}
			},
			{
				$group: {
					_id: "$month",
					total: { $sum: "$sales" }
				}
			}
		])
	} catch (err) {
		res.status(500).json(err)
	}
})

module.exports = router;
