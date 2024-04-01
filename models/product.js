const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    product_name: {
        type: String,
        required: true
    },
    about:{
        type:String
    },
    type: {
        type: String,
        enum: ['In-ear', 'On-ear', 'Over-ear']
    },
    company: {
        type: String       
    },
    color: {
        type: String
    },
    price: {
        type: Number
    },
    star:{
        type:Number
    },
    review:{
        type:Number
    },
    available:{
        type:String,
        enum: ['In stock', 'Out of stock']
    },
    description:[
        {
            point:{
                type:String
            }
        }
    ],
    images:[
        {
            image1:{
                type:String
            },
            image2:{
                type:String
            },
            image3:{
                type:String
            },
            image4:{
                type:String
            }
        }
    ],
});

const Product = mongoose.model('musicproducts', productSchema);

module.exports = Product;
