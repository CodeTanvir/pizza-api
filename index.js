const express = require('express');
const dotenv = require('dotenv')
const { default: mongoose } = require('mongoose');
const pizzaOrderSchema = require('./Schema/PizzaOrderSchema')
const pizzaOrder = new mongoose.model('pizzaOrder', pizzaOrderSchema)
const uniQ = require('unique-id-mix');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin:'http://localhost:5173'
}))
dotenv.config();

const _name = process.env.name;
const _password = process.env.password
const _cluster = process.env.cluster;


mongoose.connect(`mongodb+srv://${_name}:${_password}@${_cluster}.mongodb.net/pizza`,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(
    ()=> console.log('Database connected successful')).catch(
        err => console.log(err))
    
        app.post('/order',async (req, res)=>{
           try{
            const  orderId = uniQ.createID(5)
            const findId = await pizzaOrder.find({orderId});
          if(findId.length > 0) return res.status(500).send('something went wrong please order again')
            const Order = new pizzaOrder({
                customer:req.body.customer,
                phone:req.body.phone,
                address:req.body.address,
                cart:req.body.cart,
                priority:req.body.priority,
                orderPrice:req.body.totalCartPrice,
                priorityPrice:req.body.PriorityPrice,
                totalPrice:req.body.totalPrice,
                orderId,    
            });
            const saved = await Order.save();
            console.log(saved)
            res.status(200).send(saved)
           }catch(err){
            res.send(err)
           }
        })
        app.get('/order/:id',async (req, res)=>{
            const orderId = req.params.id
            console.log(orderId)
            try{
                const order = await pizzaOrder.find({orderId});
                res.status(200).send(order)
            }catch(err){
                console.log(err)
                res.status(500).send(err)
            }
        })

app.listen(3000, ()=>{
    console.log(`Server is Running 3000`)
})