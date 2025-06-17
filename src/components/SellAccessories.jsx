import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/SellAccessories.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { generateCustomId, fetchCurrentUser } from "../utils/Helpers";
import { PlusCircle } from "lucide-react";

const SellAccessories = ({ onClose, productToUpdate }) => {
  const { currentUser } = useAuth();
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

  const [fields, setFields] = useState([{ id: 1, fieldName: "", body: "" }]);

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

  const addNewField = (e) => {
    e.preventDefault();
    const newId =
      fields.length > 0 ? Math.max(...fields.map((f) => f.id)) + 1 : 1;
    setFields([...fields, { id: newId, fieldName: "", body: "" }]);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!fields||fields < 2 ) newErrors.fields = "Please add at least 2 fields";

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
          <div className="header">
            <h2>Label</h2>
            <h2>Description</h2>
          </div>

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
                <div className="field-label">Body or description</div>
                <input
                  type="text"
                  className="field-input"
                  placeholder="10000,IPhone 16,Apple,etc..."
                  value={field.body}
                  onChange={(e) => handlebodyChange(field.id, e.target.value)}
                />
              </div>
            </div>
          ))}
          <div className="field-row">
            <span
              style={{ margin: "-35px 0px -8px 19px" }}
              className="dashed-column-line"
            ></span>
          </div>
          <button type="button" className="add-button" onClick={addNewField}>
            <PlusCircle size={30} />
          </button>
          <div>
            <input type="text" className="" />
            <button onClick={handleSubmit}>Sell</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellAccessories;
