const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true,"title is required"],
		unique: [true,"title already taken"]
	},
	desc: {
		type: String,
		required: [true,"A description of the product is required"],
	},
	img: {
		type: Array
	},
	categories: {
		type: String
	},
	size: {
		type: Array
	},
	color: {
		type: Array
	},
	inStock: {
		type: Boolean,
		default: true
	},
	price: {
		type: Number,
		required: [true,"Price is required"]
	}
},{ timestamps: true })

module.exports = mongoose.model('Product',ProductSchema);