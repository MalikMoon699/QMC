import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/Helpers";

const ImageEditorModal = ({ image, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    console.log("Cropped Image: ", croppedImage);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
        <div className="logout-btn-container">
          <button
            onClick={onClose}
            className="logout-cencel-btn logout-delte-btn-same"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="logout-delte-btn logout-delte-btn-same"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageUpload = ({ image }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageClicked, setIsImageClicked] = useState(false);

  const handleImageClick = () => {
    setSelectedImage(URL.createObjectURL(image));
    setIsImageClicked(true);
  };

  return (
    <>
      <img
        onClick={handleImageClick}
        src={URL.createObjectURL(image)}
        alt="upload"
        className="media-preview-video"
      />
      {isImageClicked && (
        <ImageEditorModal
          image={selectedImage}
          onClose={() => setIsImageClicked(false)}
        />
      )}
    </>
  );
};

export default ImageUpload;
