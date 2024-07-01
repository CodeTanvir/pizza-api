
const mongoose = require('mongoose')

const pizzaOrderSchema = new mongoose.Schema({
   customer:{
    type:String,
    required:true,
   },
   orderId:{
    type:String,
    required:true,
   },
   cart:{
    type:[],
    required:true,
    validate: v => Array.isArray(v) && v.length > 0,
   },
   priority:{
    type:Boolean,
    default:false,
   },
   orderTime:{
      type:Date,
      required:true
   },
   estimatedDelivery:{
    type:Date,
    required:true
   },
   phone:{
      type:String
   },
   address:{
      type:String
   },
   position:{
      type:String
   },
   orderPrice:{
      type:Number,
      required:true
   },
   priorityPrice:{
      type:Number,
      required:true
   },
   totalPrice:{
      type:Number,
      required:true,
   },
    status:{
      type:String,
      default:'Order Placed',
   }
})

module.exports = pizzaOrderSchema;
