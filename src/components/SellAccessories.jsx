import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/SellAccessories.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import ImageUpload from "./ImageUpload";
import { generateCustomId, fetchCurrentUser } from "../utils/Helpers";
import { CircleMinus, PlusCircle, Plus, X } from "lucide-react";

const SellAccessories = ({ onClose, productToUpdate }) => {
  const { currentUser } = useAuth();
  const [errors, setErrors] = useState({});
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [deviceModal, setDeviceModal] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isImageClicked, setIsImageClicked] = useState(false);
  const fileInputRef = useRef(null);

  const [fields, setFields] = useState([{ id: 1, fieldName: "", body: "" }]);

  useEffect(() => {
    if (productToUpdate) {
      setBrandName(productToUpdate.brandName || "");
      setDeviceModal(productToUpdate.deviceModel || "");
      setDescription(productToUpdate.description || "");
      setPrice(productToUpdate.price || "");
      setExistingImages(productToUpdate.images || []);
      setFields(
        productToUpdate.fields?.length > 0
          ? productToUpdate.fields
          : [{ id: 1, fieldName: "", body: "" }]
      );
    }
  }, [productToUpdate]);

  const handleFieldNameChange = (id, value) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, fieldName: value } : field
      )
    );
  };

  const handlebodyChange = (id, value) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, body: value } : field
      )
    );
  };

  const handleAddFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  

  const addNewField = (e) => {
    e.preventDefault();
    const newId =
      fields.length > 0 ? Math.max(...fields.map((f) => f.id)) + 1 : 1;
    setFields([...fields, { id: newId, fieldName: "", body: "" }]);
  };

  const removeField = (e) => {
    e.preventDefault();
    if (fields.length === 1) return;
    setFields(fields.slice(0, -1));
  };

  useEffect(() => {
    const getUserDetails = async () => {
      if (currentUser) {
        const userDetails = await fetchCurrentUser(currentUser);
        const currentUserDetail = userDetails.userData;
        setCurrentUserDetails(currentUserDetail);
      }
    };
    getUserDetails();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!brandName) newErrors.fields = "Please add Product Brand Name";
    if (!deviceModal) newErrors.fields = "Please add Product Modal";
    if (!price) newErrors.fields = "Please add Product Price";
    if (!description) newErrors.fields = "Please add Product description";
    if (!fields || fields < 2)
      newErrors.fields = "Please add at least 2 fields";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setUploading(true);
    try {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const imageId = await generateCustomId("ACCESSORIES");
          const imageRef = ref(storage, `ACCESSORIES/${imageId}_${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      const productData = {
        createdBy: currentUserDetails.name,
        createdByEmail: currentUserDetails.email,
        createdByPhoneNumber: currentUserDetails.phoneNumber,
        brandName: brandName,
        deviceModel: deviceModal,
        description: description,
        price: price,
        fields,
        images: [...existingImages, ...imageUrls],
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      };

      if (productToUpdate) {
        await updateDoc(
          doc(db, "ACCESSORIES", productToUpdate.id),
          productData
        );
        toast.success("Product updated successfully!");
      } else {
        const customId = await generateCustomId("ACCESSORIES");
        await setDoc(doc(db, "ACCESSORIES", customId), productData);
        toast.success("Product listed successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error processing product:", error);
      setErrors({ submit: "Failed to process product. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button onClick={handleClose} className="back-button">
            ❮
          </button>
          <h3 className="modal-title">
            {productToUpdate ? "Update Product" : "Sell Your Product"}
          </h3>
        </div>
        <form style={{ padding: "20px" }}>
          {errors.brandName && (
            <p
              style={{
                textAlign: "center",
                fontSize: "17px",
                marginTop: "0px",
              }}
              className="login-form-error"
            >
              {errors.brandName}
            </p>
          )}
          {errors.description && (
            <p
              style={{
                textAlign: "center",
                fontSize: "17px",
                marginTop: "0px",
              }}
              className="login-form-error"
            >
              {errors.description}
            </p>
          )}
          {errors.price && (
            <p
              style={{
                textAlign: "center",
                fontSize: "17px",
                marginTop: "0px",
              }}
              className="login-form-error"
            >
              {errors.price}
            </p>
          )}
          {errors.fields && (
            <p
              style={{
                textAlign: "center",
                fontSize: "17px",
                marginTop: "0px",
              }}
              className="login-form-error"
            >
              {errors.fields}
            </p>
          )}
          {errors.deviceModal && (
            <p
              style={{
                textAlign: "center",
                fontSize: "17px",
                marginTop: "0px",
              }}
              className="login-form-error"
            >
              {errors.deviceModal}
            </p>
          )}
          <label>Brand Name</label>
          <input
            type="text"
            className="login-input"
            placeholder="Brand Name"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              setErrors((prev) => ({ ...prev, brandName: "" }));
            }}
          />
          <label>Device Modal</label>
          <input
            type="text"
            className="login-input"
            placeholder="Device Modal"
            value={deviceModal}
            onChange={(e) => {
              setDeviceModal(e.target.value);
              setErrors((prev) => ({ ...prev, deviceModal: "" }));
            }}
          />
          {fields.map((field, index) => (
            <div key={field.id} className="field-row">
              <div className="field-column">
                <div className="field-label">Title or label</div>
                <input
                  type="text"
                  className="field-input"
                  value={field.fieldName}
                  onChange={(e) =>
                    handleFieldNameChange(field.id, e.target.value)
                  }
                  placeholder="price,model,brand,etc..."
                />
              </div>
              <span className="dashed-column-line"></span>
              <span className="dashed-row-line"></span>
              <div className="field-column">
                <div className="field-label">Body</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="10000,IPhone 16,Apple,etc..."
                    value={field.body}
                    onChange={(e) => {
                      handlebodyChange(field.id, e.target.value);
                      setErrors((prev) => ({ ...prev, field: "" }));
                    }}
                  />
                  <button
                    type="button"
                    style={{ background: "white", margin: "0px 0px 0px 2px" }}
                    className="add-button"
                    onClick={removeField}
                  >
                    <CircleMinus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="field-row">
            <span
              style={{ margin: "-43px 0px -8px 19px" }}
              className="dashed-column-line"
            ></span>
          </div>
          <button type="button" className="add-button" onClick={addNewField}>
            <PlusCircle size={30} />
          </button>
          <div>
            <label>Price</label>
            <input
              type="number"
              className="login-input"
              placeholder="Price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors((prev) => ({ ...prev, price: "" }));
              }}
            />
            <label>Description</label>
            <input
              type="text"
              className="login-input"
              placeholder="Product Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
            />
            <div className="media-preview">
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} style={{ position: "relative" }}>
                  <button
                    className="video-cancel"
                    onClick={() => removeImage(index, true)}
                  >
                    <X size={16} />
                  </button>
                  <img
                    src={image}
                    alt={`existing-${index}`}
                    className="media-preview-video"
                  />
                </div>
              ))}
              {images.map((image, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <button
                    className="video-cancel"
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </button>
                  <img
                    onClick={() => {
                      setIsImageClicked(true);
                      setSelectedImage;
                    }}
                    src={URL.createObjectURL(image)}
                    alt={`upload-${index}`}
                    className="media-preview-video"
                  />
                </div>
              ))}
              <div
                style={{
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="media-preview-video"
              >
                <div onClick={handleAddFilesClick} className="add-Files">
                  <Plus />
                </div>
              </div>
              <input
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </div>
            <button
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
              className="action-btn continue-btn"
              disabled={uploading}
              onClick={handleSubmit}
            >
              {productToUpdate ? "Update" : "Sell"}
            </button>
          </div>
        </form>
      </div>
      {isImageClicked && <ImageUpload onClose={handleImageUploadClose} />}
    </div>
  );
};

export default SellAccessories;
