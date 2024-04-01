const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./routes/auth.route');
const productRoute = require('./routes/product.route');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(cors(
    {
        origin:["*"],
        methods:["POST","GET","PUT"],
        credentials:true
    }
));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '100mb' }))
app.set('view engine', 'ejs');

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "SUCESS",
        message: "All Good"
    })
})

app.use('/auth', authRoute);

app.use('/product', productRoute);


app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log(`Server running at http://localhost:${process.env.PORT}`))
        .catch((error) => console.log(error))
})





