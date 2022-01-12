const jwt = require("jsonwebtoken");

const verifyToken = (req,res,next) => {
	const authHeader = req.headers.token
	if (authHeader) {
		const token = authHeader.split(" ")[1];
		jwt.verify(token,process.env.JWT_SECRET,(err,user) => {
			if(err) res.status(401).json({
				message: "Token is not valid.",
				success: false
			})
			req.user = user; //stored: id & isAdmin
			next()	
		})
	} else {
		return res.status(401).json({
			message: 'Log in to access this resource',
			success: false
		})
	}
}

const verifyTokenAndAuthorization = (req,res,next) => {
	verifyToken(req,res,() => {
		if(req.user.id === req.params.id || req.isAdmin) {
			next()
		} else {
			res.status(401).json({
				message: "You are not allowed to do this task",
				success: false
			})
		}
	})
}

const verifyTokenAndAdmin = (req,res,next) => {
	verifyToken(req,res,() => {
		if(req.user.isAdmin) {
			next()
		} else {
			res.status(401).json({
				message: "You are not allowed to do this task",
				success: false
			})
		}
	})
}

module.exports = { verifyToken,verifyTokenAndAuthorization,verifyTokenAndAdmin }