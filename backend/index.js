const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Define Mongoose Schema and Model
const ImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Image = mongoose.model('Image', ImageSchema);

// Route to handle image upload and save link to MongoDB
app.post('/upload', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ msg: 'No image provided' });
    }

    try {
        const formData = new FormData();
        formData.append('image', image);

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData
        );

        const imageUrl = response.data.data.display_url;

        // Save image URL to MongoDB
        const newImage = new Image({ url: imageUrl });
        await newImage.save();

        res.json({ msg: 'Image uploaded and saved', imageUrl });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
