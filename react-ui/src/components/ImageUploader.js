import React, { useState, useRef, useEffect } from "react";
import ApiHelper from "../api/apiHelper";
import { Upload, Button, Select, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const ImageUploader = ({ models = [] }) => {
  const [image, setImage] = useState(null);
  const [selectedModel, setSelectedModel] = useState("best1.pt");
  const [uploadStatus, setUploadStatus] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const handleModelChange = (value) => {
    setSelectedModel(value);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    
    if (isImage) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setPredictions([]); // Clear previous predictions when new image is selected
    }
    
    return false;
  };

  const handleUpload = async () => {
    if (!image) {
      message.error("Please select an image first.");
      return;
    }

    setLoading(true);
    setUploadStatus("Uploading...");
    message.loading({ content: 'Uploading image...', key: 'upload' });

    const formData = new FormData();
    formData.append("image", image);
    formData.append("model", selectedModel);

    try {
      const response = await fetch(ApiHelper.upload.endpoint(), {
        method: ApiHelper.upload.method,
        body: formData,
      });

      const data = await response.json();
      setPredictions(data.predictions || []);
      setUploadStatus("Upload successful!");
      message.success({ content: 'Upload successful!', key: 'upload', duration: 2 });
    } catch (error) {
      setUploadStatus("Upload failed.");
      message.error({ content: 'Upload failed.', key: 'upload', duration: 2 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (imageUrl && predictions.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Draw bounding boxes and labels
        predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          
          // Draw bounding box
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'red';
          ctx.stroke();
          
          // Draw label background
          ctx.fillStyle = 'red';
          const textWidth = ctx.measureText(prediction.label).width;
          ctx.fillRect(x, y - 20, textWidth + 10, 20);
          
          // Draw label text
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.fillText(prediction.label, x + 5, y - 5);
        });
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl, predictions]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card title="Image Uploader" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select a model"
            style={{ width: '100%', marginBottom: 16 }}
            onChange={handleModelChange}
            value={selectedModel}
          >
            <Option key="best1.pt" value="best1.pt">
              Model 1
            </Option>
            <Option key="best2.pt" value="best2.pt">
              Model 2
            </Option>
          </Select>
          
          <Upload.Dragger
            name="image"
            multiple={false}
            beforeUpload={beforeUpload}
            accept="image/*"
            showUploadList={false}
            style={{ marginBottom: 16 }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag image to this area to upload</p>
          </Upload.Dragger>
          
          <Button 
            type="primary" 
            onClick={handleUpload}
            disabled={!image || !selectedModel}
            loading={loading}
            block
          >
            Process Image
          </Button>
        </div>

        {uploadStatus && !loading && predictions.length === 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>{uploadStatus}</h4>
            {imageUrl && (
              <div style={{ marginTop: 16 }}>
                <img 
                  src={imageUrl} 
                  alt="Uploaded" 
                  style={{ maxWidth: '100%', maxHeight: '400px' }} 
                />
              </div>
            )}
          </div>
        )}

        {predictions.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Results:</h4>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={imageUrl} 
                alt="Uploaded with predictions" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px',
                  display: 'block' // Remove extra space below image
                }} 
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <h4>Detected Objects:</h4>
              <ul>
                {predictions.map((pred, index) => (
                  <li key={index}>
                    {pred.label} (confidence: {(pred.confidence * 100).toFixed(2)}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

ImageUploader.defaultProps = {
  models: []
};

export default ImageUploader;