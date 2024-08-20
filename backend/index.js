const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Connect to MongoDB (updated connection without deprecated options)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

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
app.post('/upload', upload.single('image'), async (req, res) => {
    console.log(req.file); // Log the file object for debugging

    if (!req.file) {
        return res.status(400).json({ msg: 'No image provided' });
    }

    try {
        const form = new FormData();
        form.append('image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            form,
            { headers: form.getHeaders() }
        );

        console.log(response.data); // Log the response from imgbb

        const imageUrl = response.data.data.display_url;

        // Save image URL to MongoDB
        const newImage = new Image({ url: imageUrl });
        await newImage.save();

        res.json({ msg: 'Image uploaded and saved', imageUrl });
    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).send('Server error');
    }
});

// Route to fetch all images
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error.message);
        res.status(500).send('Server error');
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
