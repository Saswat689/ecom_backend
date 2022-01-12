const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const paymentRoute = require("./routes/stripe");
const { logErrors,clientErrorHandler,errorHandler } = require('./errorHandler')
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.set("trust proxy",1);

//global middlewares

//parse json
app.use(express.json());
//log requests
app.use((req,res,next) => {
	// console.log(req)
	// console.log(res)
	next()
})
// basic headers
app.use(cors());
// improve security
app.use(helmet());

//dotenv
const environment = dotenv.config()

if(environment.error) {
	throw new Error("Error when loading environment variables")
}

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('DB connected'))
.catch((err) => console.log('Connection to DB failed \n' + err))


//routes
app.use('/api/users',userRoute)
app.use('/api/auth',authRoute)
app.use('/api/products',productRoute)
app.use('/api/orders',orderRoute)
app.use('/api/carts',cartRoute)
app.use('/api/checkout',paymentRoute)

//error handlers
process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
	console.log('App listening on port ' + PORT)
})