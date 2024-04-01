const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const User = require('../models/user');
const Product = require('../models/product');
const authenticate = require('../middleware/authenticate');

const errorhandler = (res, error) => {
    res.status(error.status || 500).json({ error: "Something went wrong! Please try after some time." });
};

router.post('/register', async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!name || !mobile || !email || !password) {
            return res.status(400).json({ error: 'Name, mobile, email, password and are required fields.' });
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }
        const newUser = new User({
            name,
            mobile,
            email,
            password: hashedPassword,

        });

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_Token, { expiresIn: '24h' })
        res.status(200).json({
            token,
            userId: newUser._id,
            UserName: newUser.name,
            message: "user register successfully"
        });
    } catch (error) {
        console.log(error);
        errorhandler(res, error);
    }
});


// Api to login authorized User
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        let user;
        if (validator.isEmail(identifier)) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ mobile: identifier });
        }
        if (user) {
            let hasPasswordMatched = await bcrypt.compare(password, user.password);
            if (hasPasswordMatched) {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_Token, { expiresIn: '24h' })

                res.status(200).json({
                    token,
                    userId: user._id,
                    UserName: user.name,
                    message: "You have logged In successfully"
                })
            } else {
                res.status(500).json({
                    error: "Incorrect credentials"
                })
            }
        } else {
            res.status(400).json({
                error: "User does not exist"
            })
        }
    } catch (error) {
        errorhandler(res, error);
    }
});

// Add product in cart
router.put('/:userId/:productId', authenticate, async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cartItemIndex = user.CartItems.findIndex(item => item.productId.toString() === productId);
        if (cartItemIndex !== -1) {
            if (user.CartItems[cartItemIndex].quantity < 8) {
                user.CartItems[cartItemIndex].quantity += 1;
            } else {
                return res.status(400).json({ error: 'maximum limit reached' });
            }
        } else {
            user.CartItems.push({ productId: productId, quantity: 1 });
        }
        user.CartItemNumber += 1;


        await user.save();
        res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.log(error);
        errorhandler(res, error);
    }
});
// get cart Item
router.get('/:userId/cartItem', authenticate, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user.CartItemNumber);
    } catch (error) {
        console.log(error);
        errorhandler(res, error);
    }
});

router.put('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const { feedbackType, feedbackText } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("objectId not valid")
            return res.status(400).json({ error: "Invalid user ID " });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.FeedBack.push({ feedbackType, feedbackText });

        await user.save();
        console.log("objectId valid");

        res.status(200).json({ message: 'Feedback added successfully' });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/:userId', authenticate, async (req, res) => {
    try {
        const { orderPerson, address, paymentMode, totalAmount, addedItems } = req.body;
        const { userId } = req.params;

        const user = await User.findById(userId);

        user.invoices.push({ orderPerson, address, paymentMode, totalAmount, addedItems });
        await user.save();

        user.CartItems = [];
        user.CartItemNumber = 0;
        await user.save();

        res.status(201).json({ message: 'Invoice added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/getinvoices/:userId', authenticate, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId, 'invoices');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const invoices = user.invoices;

        if (invoices.length === 0) {
            return res.status(404).json({ message: 'No invoices found' });
        }

        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/invoicedetail/:userId/:invoiceId', authenticate, async (req, res) => {
    try {
        const { userId, invoiceId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const invoice = user.invoices.find(inv => inv._id == invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
