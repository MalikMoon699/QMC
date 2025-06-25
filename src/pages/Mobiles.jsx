import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import "../assets/styles/Mobile.css";
import { useAuth } from "../context/AuthContext";
import { demo1, demo2, demo3, demo4 } from "../utils/Demoimages";
import Slider from "../components/Slider";
import { MessageCircleWarning, Plus, Store } from "lucide-react";
import SellProducts from "../components/SellProducts";
import { db } from "../utils/FirebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import SellerApplication from "../components/SellerApplication";

const Mobiles = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [isSellerApplicationOpen, setIsSellerApplicationOpen] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "SMARTDEVICES"),
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
    if (statusFilter !== "All") {
      filtered = devices.filter(
        (record) =>
          record.deviceType.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (searchTxt.trim()) {
      filtered = filtered.filter((device) =>
        [
          device.brandName,
          device.deviceType,
          device.deviceModel,
          device.memory,
          device.ram,
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
  }, [devices, statusFilter, searchTxt]);

  const handleDeleteProduct = async () => {
    if (!selectedCard?.id) return;
    try {
      await deleteDoc(doc(db, "SMARTDEVICES", selectedCard.id));
      setDevices((prev) =>
        prev.filter((device) => device.id !== selectedCard.id)
      );
      toast.success("Product marked as sold out!");
      setIsUpdateModal(false);
      setIsOpen(false);
      setSelectedCard(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to mark product as sold out.");
    }
  };

  const handleOpenUpdateModal = () => {
    setIsUpdateModal(false);
    setSellModalOpen(true);
  };

  return (
    <div>
      <div className="mobile-summary-header mobiles-summary-header">
        <div className="mobiles-status-title">Smart Devices</div>
        <div className="action-btn-container">
          {role !== "user" && (
            <button
              onClick={() => setSellModalOpen(true)}
              style={{ backgroundColor: "#ef3f2c" }}
              className="action-btn"
            >
              <Plus size={20} /> Sell Your Product
            </button>
          )}
          {role === "user" && (
            <button
              onClick={() => setIsSellerApplicationOpen(true)}
              className="action-btn"
              style={{ backgroundColor: "#ef3f2c" }}
            >
              <Store size={15} />
              Apply for Seller
            </button>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-select"
          >
            <option value="All">All</option>
            <option value="android">Android</option>
            <option value="iphone">IPhone</option>
            <option value="ipad">IPad</option>
            <option value="tablet">Tablet</option>
          </select>
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
              className="mobile-card"
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
                  {device.ram ? (
                    <p className="mobile_card_details">
                      <strong>RAM:</strong>
                      <span className="dashed-line"></span>
                      {device.ram}GB
                    </p>
                  ) : (
                    <p className="mobile_card_details">
                      <strong>Battery Health:</strong>
                      <span className="dashed-line"></span>
                      {device.batteryHelth || "N/A"}%
                    </p>
                  )}
                  <p className="mobile_card_details">
                    <strong>Memory:</strong>
                    <span className="dashed-line"></span>
                    {device.memory}GB
                  </p>
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
        <div
          className="modal-overlay"
        >
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
                style={{ maxHeight: "450px" }}
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
                        setIsUpdateModal(true);
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
                  <p className="mobile_card_details">
                    <strong>DeviceType:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.deviceType}
                  </p>
                  {selectedCard.ram ? (
                    <p className="mobile_card_details">
                      <strong>RAM:</strong>
                      <span className="dashed-line"></span>
                      {selectedCard.ram}GB
                    </p>
                  ) : (
                    <p className="mobile_card_details">
                      <strong>Battery Health:</strong>
                      <span className="dashed-line"></span>
                      {selectedCard.batteryHelth || "N/A"}%
                    </p>
                  )}
                  <p className="mobile_card_details">
                    <strong>Memory:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.memory}GB
                  </p>
                  <p
                    style={{ color: "#00a400" }}
                    className="mobile_card_details"
                  >
                    <strong>Sell By:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdBy}
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

      {isUpdateModal && (
        <div
          onClick={() => {
            setIsUpdateModal(false);
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
                  onClick={handleOpenUpdateModal}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {sellModalOpen && (
        <SellProducts
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

export default Mobiles;
