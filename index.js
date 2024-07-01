const express = require('express');
const dotenv = require('dotenv')
const { default: mongoose } = require('mongoose');
const pizzaOrderSchema = require('./Schema/PizzaOrderSchema')
const pizzaOrder = new mongoose.model('pizzaOrder', pizzaOrderSchema)
const uniQ = require('unique-id-mix');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://fast-react-pizza-b6tfe1z9c-tanvir-hossains-projects-daa04054.vercel.app','https://fast-react-pizza-co-three.vercel.app'],
  methods: ['GET', 'POST','PATCH','PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 
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
                position:req.body.position,
                cart:req.body.cart,
                priority:req.body.priority,
                orderPrice:req.body.totalCartPrice,
                priorityPrice:req.body.PriorityPrice,
                totalPrice:req.body.totalPrice,
                orderId, 
                 orderTime: new Date(),
                estimatedDelivery: new Date(Date.now() + 
                (req.body.cart.length > 0 ? 1000 * 60 * 10 * req.body.cart.length : 0)),    
            });
            const saved = await Order.save();
            console.log(saved)
            res.status(200).send(saved)
           }catch(err){
            res.status(500).send(err)
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
        });

  app.patch('/order/:id', async(req, res)=>{
            const orderId = req.params.id;
            try{
                const updatePriority = await pizzaOrder.findOneAndUpdate(
                    {orderId},
                    req.body
                );
                if(!updatePriority) return res.status(404).send('No orderId found')
                res.status(200).send('updated')
            }catch(err){
                res.status(400).send(err)
            }
        })


        async function updateOrderStatus() {
            const orders = await pizzaOrder.find({ status: { $ne: "Delivered" } });
            const now = new Date();
        
            orders.forEach(async (order) => {
                const timeElapsed = now - order.orderTime;
                const timeLeft = order.estimatedDelivery - now;
                const totalDeliveryTime = order.estimatedDelivery - order.orderTime;
                const percentageLeft = (timeLeft / totalDeliveryTime) * 100;
        
                if (percentageLeft <= 5) {
                    order.status = "arrived";
                } else if(percentageLeft <= 0){
                    order.status = "Delivered"
                }
                else if (percentageLeft <= 25) {
                    order.status = "close to your location";
                } else if (percentageLeft <= 40) {
                    order.status = "on the way";
                } else if (percentageLeft <= 45) {
                    order.status = "handover to delivery partner";
                } else if (percentageLeft <= 48) {
                    order.status = "order packed";
                } else if (percentageLeft <= 40) {
                    order.status = "order prepared";
                } else if (percentageLeft <= 95){
                    order.status = "prepearing order"
                }
                else {
                    order.status = "order placed"; // Default status
                }
        
                // Update the order status in the database
                await order.save();
            });
        }
        
        // Schedule the status update function to run every minute
        cron.schedule('* * * * *', updateOrderStatus);

app.listen(process.env.PORT, ()=>{
    console.log(`Server is Running 3000`)
})
