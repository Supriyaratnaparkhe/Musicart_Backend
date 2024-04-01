const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');
const authenticate = require('../middleware/authenticate');

router.get('/getAllProducts', async (req, res) => {
    try {
        let query = {};

        if (req.query.type) {
            query.type = req.query.type;
        }
        if (req.query.color) {
            query.color = req.query.color;
        }
        if (req.query.company) {
            query.company = req.query.company;
        }

        if (req.query.priceRange) {
            const priceRange = req.query.priceRange.split('-');
            query.price = { $gte: parseInt(priceRange[0]), $lte: parseInt(priceRange[1]) };
        }

        let sortOptions = {};
        if (req.query.sortBy === 'price:lowest') {
            sortOptions.price = 1;
        } else if (req.query.sortBy === 'price:highest') {
            sortOptions.price = -1;
        } else if (req.query.sortBy === 'name:AtoZ') {
            sortOptions.product_name = 1;
        } else if (req.query.sortBy === 'name:ZtoA') {
            sortOptions.product_name = -1;
        }

        if (req.query.search) {
            query.product_name = { $regex: new RegExp(req.query.search, 'i') };
        }
        const products = await Product.find(query).sort(sortOptions);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/getProductDetails/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const productDetail = {
            product_name: product.product_name,
            about: product.about,
            company: product.company,
            color: product.color,
            price:product.price,
            type: product.type,
            review:product.review,
            star:product.star,
            available:product.available,
            description: product.description.map(item => ({
                point: item.point,
            })),
            images:product.images.map(item=>({
                image1:item.image1,
                image2:item.image2,
                image3:item.image3,
                image4:item.image4
            }))
        };
        res.json(productDetail);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/myCart/:userId',authenticate, async (req, res) => {
    try {
        const userId = req.params.userId; 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const productIds = user.CartItems.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const productsWithQuantity = products.map(product => {
            const cartItem = user.CartItems.find(item => item.productId.equals(product._id));
            return {
                product: product,
                quantity: cartItem ? cartItem.quantity : 0
            };
        });

        res.json(productsWithQuantity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
