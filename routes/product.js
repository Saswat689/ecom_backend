const router = require("express").Router();
const {verifyTokenAndAuthorization,verifyTokenAndAdmin} = require("../middlewares/verifyToken")
const CryptoJS = require("crypto-js");
const { isValidObjectId } = require("mongoose")
const Product = require("../models/Product")

//create poduct
router.post("/",verifyTokenAndAdmin,async (req,res) => {
	const newProduct = new Product(req.body)

	try{
		const savedProduct = await newProduct.save();
		res.status(200).json({
			savedProduct: savedProduct,
			success: true
		})
	} catch (err) {
		res.status(500).json(err)
	}
})



//edit product
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
		const updatedProduct = await Product.findByIdAndUpdate(req.params.id,{
			$set: req.body
		},{new: true}).lean().exec()

		return res.status(200).json(updatedProduct)

	} catch(err) {
		res.status(500).json(err.message)
	}
})

//delete product
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
		await Product.findByIdAndDelete(req.params.id).lean().exec()
		return res.status(200).json({
			message: "Product has been deleted",
			success: true
		})
	} catch (err) {	
		res.status(500).json(err)
	}
})

//get product
router.get("/:id",async (req,res) => {
	try{
		//validate object id
		if(!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid object id",
				success: false
			})
		}

		//get query
		const product = await Product.findById(req.params.id).lean().exec()

		return res.status(200).json({
			product,
			success: true
		})
	} catch (err) {	
		return res.status(500).json(err)
	}
})

//get all products
router.get("/",async (req,res) => {
	const qNew = req.query.new
	const qCategory = req.query.category
	try{
		let products ;
		
		if(qNew) {
			products = await Product.find({}).sort({ createdAt: -1 }).limit(5).lean()
		} else if(qCategory) {
			products = await Product.find({ categories: {
				$in: [qCategory], //fetch all products that include this category
			} 
		  }).lean()
		} else {
			products = await Product.find({}).lean()
		}

		return res.status(200).json({
			products,
			success: true
		})
	} catch (err) {	
		return res.status(500).json(err)
	}
})

module.exports = router;
