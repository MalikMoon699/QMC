import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "../utils/FirebaseConfig";
import { Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { generateCustomId, fetchCurrentUser } from "../utils/Helpers";

const SellProducts = ({ onClose, productToUpdate }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [brandName, setBrandName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [customDeviceType, setCustomDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [memory, setMemory] = useState("");
  const [ram, setRam] = useState("");
  const [batteryHelth, setBatteryHelth] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (productToUpdate) {
      setBrandName(productToUpdate.brandName || "");
      const deviceTypeLower = productToUpdate.deviceType?.toLowerCase();
      setDeviceType(
        ["android", "apple"].includes(deviceTypeLower)
          ? deviceTypeLower
          : "other"
      );
      setCustomDeviceType(
        ["android", "apple"].includes(deviceTypeLower)
          ? ""
          : productToUpdate.deviceType || ""
      );
      setDeviceModel(productToUpdate.deviceModel || "");
      setMemory(productToUpdate.memory || "");
      setRam(productToUpdate.ram || "");
      setBatteryHelth(productToUpdate.batteryHelth || "");
      setPrice(productToUpdate.price || "");
      setDescription(productToUpdate.description || "");
      setExistingImages(productToUpdate.images || []);
    }
  }, [productToUpdate]);

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

  const handleNextStep = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!brandName) newErrors.brandName = "Brand Name is required";
    if (!deviceType) newErrors.deviceType = "Device Type is required";
    if (deviceType === "other" && !customDeviceType)
      newErrors.customDeviceType = "Custom Device Type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!deviceModel) newErrors.deviceModel = "Device Model is required";
    if (!memory) newErrors.memory = "Memory is required";
    if (!price) newErrors.price = "Price is required";
    if (!description) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setUploading(true);
    try {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const imageId = await generateCustomId("SMARTDEVICES");
          const imageRef = ref(
            storage,
            `SMARTDEVICES/${imageId}_${image.name}`
          );
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      const productData = {
        createdBy: currentUserDetails.name,
        createdByEmail: currentUserDetails.email,
        createdByPhoneNumber: currentUserDetails.phoneNumber,
        brandName,
        deviceType: deviceType === "other" ? customDeviceType : deviceType,
        deviceModel,
        memory,
        batteryHelth,
        ram,
        price,
        description,
        images: [...existingImages, ...imageUrls],
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      };

      if (productToUpdate) {
        await updateDoc(
          doc(db, "SMARTDEVICES", productToUpdate.id),
          productData
        );
        toast.success("Product updated successfully!");
      } else {
        const customId = await generateCustomId("SMARTDEVICES");
        await setDoc(doc(db, "SMARTDEVICES", customId), productData);
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

  const onBack = () => {
    setErrors({});
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    setErrors({});
    setBrandName("");
    setDeviceType("");
    setCustomDeviceType("");
    setDeviceModel("");
    setMemory("");
    setRam("");
    setBatteryHelth("");
    setPrice("");
    setDescription("");
    setImages([]);
    setExistingImages([]);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div
        className="sidebar-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <button onClick={handleClose} className="back-button">
            ❮
          </button>
          <h3 className="modal-title">
            {productToUpdate ? "Update Product" : "Sell Your Product"}
          </h3>
        </div>
        <form style={{ padding: "20px" }}>
          {step === 1 && (
            <>
              {/* <label>Brand name:</label> */}
              <input
                className="login-input"
                type="text"
                placeholder="Apple, Vivo, Oppo, Samsung..."
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  setErrors((prev) => ({ ...prev, brandName: "" }));
                }}
              />
              {errors.brandName && (
                <p className="login-form-error">{errors.brandName}</p>
              )}
              <select
                style={{ cursor: "pointer" }}
                className="login-input"
                value={deviceType}
                onChange={(e) => {
                  setDeviceType(e.target.value);
                  setErrors((prev) => ({ ...prev, deviceType: "" }));
                }}
              >
                <option value="" disabled>
                  Device Type
                </option>
                <option value="android">Android</option>
                <option value="apple">Apple</option>
                <option value="other">Other</option>
              </select>
              {errors.deviceType && (
                <p className="login-form-error">{errors.deviceType}</p>
              )}
              {deviceType === "other" && (
                <>
                  <label>Custom Device Type:</label>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="IPad, Tablet, Mac, Laptop..."
                    value={customDeviceType}
                    onChange={(e) => {
                      setCustomDeviceType(e.target.value);
                      setErrors((prev) => ({ ...prev, customDeviceType: "" }));
                    }}
                  />
                  {errors.customDeviceType && (
                    <p className="login-form-error">
                      {errors.customDeviceType}
                    </p>
                  )}
                </>
              )}
              <button
                style={{ width: "100%", justifyContent: "center" }}
                className="continue-btn"
                onClick={handleNextStep}
              >
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <input
                className="login-input"
                type="text"
                placeholder="Enter device model"
                value={deviceModel}
                onChange={(e) => {
                  setDeviceModel(e.target.value);
                  setErrors((prev) => ({ ...prev, deviceModel: "" }));
                }}
              />
              {errors.deviceModel && (
                <p className="login-form-error">{errors.deviceModel}</p>
              )}
              {(deviceType === "other" || deviceType === "apple") && (
                <>
                  <input
                    className="login-input"
                    type="number"
                    placeholder="Enter Battery Health"
                    value={batteryHelth}
                    min={0}
                    onChange={(e) => {
                      setBatteryHelth(e.target.value);
                      setErrors((prev) => ({ ...prev, batteryHelth: "" }));
                    }}
                  />
                  {errors.batteryHelth && (
                    <p className="login-form-error">{errors.batteryHelth}</p>
                  )}
                </>
              )}
              {deviceType === "other" && (
                <p
                  style={{
                    paddingBottom: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <label>{`Choose one from these both [Battery Health OR RAM]`}</label>
                </p>
              )}
              {(deviceType === "other" || deviceType === "android") && (
                <>
                  <input
                    className="login-input"
                    type="number"
                    placeholder="Enter RAM"
                    value={ram}
                    min={0}
                    onChange={(e) => {
                      setRam(e.target.value);
                      setErrors((prev) => ({ ...prev, ram: "" }));
                    }}
                  />
                  {errors.ram && (
                    <p className="login-form-error">{errors.ram}</p>
                  )}
                </>
              )}
              <input
                className="login-input"
                type="number"
                placeholder="Enter memory"
                value={memory}
                min={0}
                onChange={(e) => {
                  setMemory(e.target.value);
                  setErrors((prev) => ({ ...prev, memory: "" }));
                }}
              />
              {errors.memory && (
                <p className="login-form-error">{errors.memory}</p>
              )}
              <input
                className="login-input"
                type="number"
                placeholder="Enter price"
                value={price}
                min={0}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setErrors((prev) => ({ ...prev, price: "" }));
                }}
              />
              {errors.price && (
                <p className="login-form-error">{errors.price}</p>
              )}
              <textarea
                className="login-input description-input"
                placeholder="Enter description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: "" }));
                }}
              />
              {errors.description && (
                <p className="login-form-error">{errors.description}</p>
              )}
              <div className="media-preview">
                {existingImages.map((image, index) => (
                  <div
                    key={`existing-${index}`}
                    style={{ position: "relative" }}
                  >
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
                      src={URL.createObjectURL(image)}
                      alt={`upload-${index}`}
                      className="media-preview-video"
                    />
                  </div>
                ))}
                <div style={{border:"none", display:"flex",alignItems:"center", justifyContent:"center"}} className="media-preview-video">
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
              {errors.images && (
                <p className="login-form-error">{errors.images}</p>
              )}
              {errors.submit && (
                <p className="login-form-error">{errors.submit}</p>
              )}
              <div className="action-btn-container">
                <button
                  style={{ width: "100%", justifyContent: "center" }}
                  className="continue-btn"
                  onClick={onBack}
                  disabled={uploading}
                >
                  Back
                </button>
                <button
                  style={{ width: "100%", justifyContent: "center" }}
                  className="continue-btn"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading
                    ? "Processing..."
                    : productToUpdate
                    ? "Update"
                    : "Sell"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SellProducts;
