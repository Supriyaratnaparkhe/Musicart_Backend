const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {type:String, required: true},
    mobile:{type:String, required:true},
    email: {type:String, required: true, index: { unique: true }}, 
    password: {type:String, required: true}, 
    address: {type:String},
    CartItemNumber:{type:Number, default:0},
    CartItems:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId
            },
            quantity:{
                type:Number,
                default:0
            }
        }
    ],
    FeedBack:[
        {
            feedbackType: {
                type: String,
                enum: ['bugs', 'feedback', 'query']
            },
            feedbackText: {
                type: String
            }
        }
    ],
    invoices:[
        {
            orderPerson:{
                type:String
            },
            address:{
                type:String
            },
            paymentMode:{
                type:String
            },
            totalAmount:{
                type:Number
            },
            addedItems:[]
        }
    ]

});

module.exports = mongoose.model('musicUser', userSchema);  