import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import "../assets/styles/Mobile.css";
import { useAuth } from "../context/AuthContext";
import { demo1, demo2, demo3, demo4 } from "../utils/Demoimages";
import Slider from "../components/Slider";
import { Funnel,MessageCircleWarning, Plus, Store } from "lucide-react";
import SellAccessories from "../components/SellAccessories";
import { db } from "../utils/FirebaseConfig";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import SellerApplication from "../components/SellerApplication";

const Accessories = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
    const [isFilter,setIsFilter]=useState(false)
  const [startPriceInput, setStartPriceInput] = useState("");
  const [endPriceInput, setEndPriceInput] = useState("");
  const [activeStartPrice, setActiveStartPrice] = useState("");
  const [activeEndPrice, setActiveEndPrice] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSellerApplicationOpen, setIsSellerApplicationOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "ACCESSORIES"),
      (querySnapshot) => {
        const devicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(devicesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching devices:", error);
        setLoading(false);
        toast.error("Failed to fetch devices.");
      }
    );
    return () => unsubscribe();
  }, []);

  const fallbackImages = [demo1, demo2, demo3, demo4];

  const filteredMobilesData = useMemo(() => {
    let filtered = devices;
    if (activeStartPrice && activeEndPrice) {
      filtered = filtered.filter((device) => {
        const price = parseFloat(device.price);
        return (
          price >= parseFloat(activeStartPrice) &&
          price <= parseFloat(activeEndPrice)
        );
      });
    }

    if (searchTxt.trim()) {
      filtered = filtered.filter((device) =>
        [
          device.brandName,
          device.deviceType,
          device.deviceModel,
          device.price,
        ].some((field) =>
          field && typeof field === "string"
            ? field.toLowerCase().includes(searchTxt.toLowerCase())
            : false
        )
      );
    }
    return filtered.sort((a, b) =>
      a.createdAt && b.createdAt
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : 0
    );
  }, [devices, searchTxt, activeStartPrice, activeEndPrice]);
  const handleDeleteProduct = async () => {
    if (!selectedCard?.id) return;

    try {
      const deletedItemRef = doc(db, "SOLDOUT_ITEMS", selectedCard.id);
      await setDoc(deletedItemRef, {
        ...selectedCard,
        deletedAt: new Date().toISOString(),
        type: "accessory",
      });

      await deleteDoc(doc(db, "ACCESSORIES", selectedCard.id));

      setDevices((prev) =>
        prev.filter((device) => device.id !== selectedCard.id)
      );
      toast.success("Product marked as sold out!");
      setIsUpdateModalOpen(false);
      setIsOpen(false);
      setSelectedCard(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to mark product as sold out.");
    }
  };


  const handleUpdateClick = () => {
    setSellModalOpen(true);
  };

  const handleClearFilter = () => {
    setStartPriceInput("");
    setEndPriceInput("");
    setActiveStartPrice("");
    setActiveEndPrice("");
    setIsFilter(false);
  };


  const handleApplyFilter = () => {
    setActiveStartPrice(startPriceInput);
    setActiveEndPrice(endPriceInput);
  };

  return (
    <div>
      <div className="mobile-summary-header mobiles-summary-header">
        <div className="mobiles-status-title">Accessories</div>
        <div className="action-btn-container">
          {role !== "user" && (
            <button
              onClick={() => setSellModalOpen(true)}
              style={{ backgroundColor: "#ef3f2c" }}
              className="action-btn filter-btn-container"
            >
              <Plus size={20} /> Sell Your Product
            </button>
          )}
          {role === "user" && (
            <button
              onClick={() => setIsSellerApplicationOpen(true)}
              className="action-btn filter-btn-container"
              style={{ backgroundColor: "#ef3f2c" }}
            >
              <Store size={15} />
              Apply for Seller
            </button>
          )}
          <div className="filter-container">
            <button
              onClick={() => {
                setIsFilter((prev) => !prev);
              }}
              className="action-btn filter-btn-container"
            >
              <Funnel size={15} /> <p>Range Filter</p>
            </button>
            {isFilter && (
              <div className="range-filter-container">
                <div className="range-filter-input-container">
                  <input
                    type="number"
                    value={startPriceInput}
                    min={0}
                    onChange={(e) => setStartPriceInput(e.target.value)}
                    placeholder="Start Price"
                    className="range-filter-input"
                  />
                  to
                  <input
                    type="number"
                    value={endPriceInput}
                    min={startPriceInput || 0}
                    onChange={(e) => setEndPriceInput(e.target.value)}
                    placeholder="End Price"
                    className="range-filter-input"
                  />
                </div>
                <div className="range-filter-btn-container">
                  <button
                    onClick={handleApplyFilter}
                    className="filter-apply-btn"
                  >
                    Apply
                  </button>
                  {endPriceInput && startPriceInput && (
                    <button
                      onClick={handleClearFilter}
                      className="filter-apply-btn"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mobiles-container">
        {loading ? (
          <Loader loading={true} />
        ) : filteredMobilesData.length > 0 ? (
          filteredMobilesData.map((device, index) => (
            <div
              onClick={() => {
                setIsOpen(true);
                setSelectedCard(device);
              }}
              className="mobile-card accessories-card"
              key={device.id || index}
            >
              <Slider
                slides={device.images?.length ? device.images : fallbackImages}
              />
              <div className="mobile-card__info_content">
                <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                  <h3>{device.deviceModel}</h3>
                  <h3 className="mobile-card__role">{device.brandName}</h3>
                </div>
                <div className="mobile-card_details_container">
                  {device.fields?.length > 0 &&
                    device.fields.slice(0, 2).map((selectedDevice, idx) => (
                      <p key={idx} className="mobile_card_details">
                        <strong>{selectedDevice.fieldName}:</strong>
                        <span className="dashed-line"></span>
                        {selectedDevice.body}
                      </p>
                    ))}
                  <p style={{ color: "red" }} className="mobile_card_details">
                    <strong>Price:</strong>
                    <span className="dashed-line"></span>
                    {device.price} PKR
                  </p>
                </div>
                <div
                  style={{
                    paddingTop: "10px",
                  }}
                  className="mobile_card_details"
                >
                  <p
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <strong>Description: </strong>
                    {device.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">No Devices</div>
        )}
      </div>

      {isOpen && selectedCard && (
        <div className="modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="modal-card">
            <div className="modal-header">
              <button
                className="back-button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedCard(null);
                }}
              >
                ❮
              </button>
              <h3 className="modal-title">{selectedCard.deviceModel}</h3>
            </div>
            <div className="mobile-card mobile-modal-card">
              <Slider
                slides={
                  selectedCard.images?.length
                    ? selectedCard.images
                    : fallbackImages
                }
              />
              <div className="mobile-card__info_content">
                <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                  <h3>{selectedCard.brandName}</h3>
                  {(role === "admin" ||
                    currentUser?.email === selectedCard.createdByEmail) && (
                    <h3
                      onClick={() => {
                        setIsUpdateModalOpen(true);
                      }}
                      style={{
                        cursor: "pointer",
                        padding: "3px 13px",
                        fontSize: "12px",
                      }}
                      className="mobile-card__role"
                    >
                      Update
                    </h3>
                  )}
                </div>
                <div className="mobile-card_details_container">
                  {selectedCard.fields?.length > 0 &&
                    selectedCard.fields.map((selectedDevice, idx) => (
                      <p key={idx} className="mobile_card_details">
                        <strong>{selectedDevice.fieldName}:</strong>
                        <span className="dashed-line"></span>
                        {selectedDevice.body}
                      </p>
                    ))}
                  <p
                    style={{ color: "#00a400" }}
                    className="mobile_card_details"
                  >
                    <strong>Sell By:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdByEmail === currentUser?.email ? (
                      "You"
                    ) : (
                      selectedCard.createdBy
                    )}
                  </p>
                  <p
                    style={{ color: "#00c000" }}
                    className="mobile_card_details"
                  >
                    <strong>Seller Mail:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdByEmail}
                  </p>
                  <p
                    style={{ color: "#00c000" }}
                    className="mobile_card_details"
                  >
                    <strong>Seller Number:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdByPhoneNumber}
                  </p>
                  <p style={{ color: "red" }} className="mobile_card_details">
                    <strong>Price:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.price} PKR
                  </p>
                </div>
                <div
                  style={{
                    paddingTop: "10px",
                  }}
                  className="mobile_card_details"
                >
                  <p>
                    <strong>Description: </strong>
                    {selectedCard.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div
          onClick={() => {
            setIsUpdateModalOpen(false);
          }}
          className="modal-overlay"
        >
          <div style={{ minWidth: "350px" }} className="modal-content">
            <div className="sidebar-modal">
              <div className="contentWrapper">
                <MessageCircleWarning color="red" size={50} />
                <h3>Change Your Product!!!</h3>
                <p>Are You Sure to Update or Sold Out</p>
              </div>
              <div className="logout-btn-container">
                <button
                  className="logout-cencel-btn logout-delte-btn-same"
                  onClick={handleDeleteProduct}
                >
                  Sold Out
                </button>
                <button
                  className="logout-delte-btn logout-delte-btn-same"
                  onClick={handleUpdateClick}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {sellModalOpen && (
        <SellAccessories
          key={selectedCard ? "update" : "sell"}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedCard(null);
          }}
          productToUpdate={selectedCard}
        />
      )}
      {isSellerApplicationOpen && (
        <SellerApplication
          onClose={() => {
            setIsSellerApplicationOpen(false);
          }}
          productToUpdate={selectedCard}
        />
      )}
    </div>
  );
};

export default Accessories;
