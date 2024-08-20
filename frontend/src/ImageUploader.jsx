import { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [images, setImages] = useState([]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!image) return;
    
        const formData = new FormData();
        formData.append('image', image);
    
        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            setImageUrl(response.data.imageUrl);
            fetchImages();  // Fetch images again to include the new one
        } catch (error) {
            console.error('Error uploading the image', error);
        }
    };
    
    const fetchImages = async () => {
        try {
            const response = await axios.get('http://localhost:5000/images');
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images', error);
        }
    };

    return (
        <div>
            <h1>Upload and Display Images</h1>
            <input type="file" onChange={handleImageChange} />
            <button onClick={handleUpload}>Upload Image</button>

            {imageUrl && (
                <div>
                    <h2>Uploaded Image:</h2>
                    <img src={imageUrl} alt="Uploaded" />
                </div>
            )}

            <h2>All Images:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {images.map((img) => (
                    <div key={img._id} style={{ margin: '10px' }}>
                        <img src={img.url} alt="Uploaded" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUploader;
