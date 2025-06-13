import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import "../assets/styles/Mobile.css";
import { useAuth } from "../context/AuthContext";
import { demo1, demo2, demo3, demo4 } from "../utils/Demoimages";
import Slider from "../components/Slider";
import { Plus, Store } from "lucide-react";

const SmartWatches = () => {
  const { role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(false);

  const data = [
    {
      img: [demo1, demo2, demo3, demo4],
      brandName: "Vivo",
      deviceType: "android",
      deviceModal: "Vivo S1",
      memory: "128",
      ram: "4",
      description:
        "Condition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition ok",
      price: "25000",
    },
    {
      img: [demo1, demo2, demo3, demo4],
      brandName: "Apple",
      deviceType: "IPhone",
      deviceModal: "Iphone 8Plus",
      memory: "64",
      betteryHelth: "86",
      description: "Condition ok",
      price: "20000",
    },
    {
      img: [demo1, demo2, demo3, demo4],
      brandName: "Apple",
      deviceType: "Ipad",
      deviceModal: "Ipad mini 4",
      memory: "128",
      betteryHelth: "80",
      description: "Condition ok",
      price: "25000",
    },
    {
      img: [demo1, demo2, demo3, demo4],
      brandName: "Samsung",
      deviceType: "Tablet",
      deviceModal: "Samsung Tab A9",
      memory: "128",
      ram: "8",
      description:
        "Condition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition okCondition ok",
      price: "30000",
    },
  ];

  const filteredmobilesData = useMemo(() => {
    let filtered = data;
    if (statusFilter !== "All") {
      filtered = data.filter(
        (record) =>
          record.deviceType.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (searchTxt.trim()) {
      filtered = filtered.filter((mobile) =>
        [
          mobile.brandName,
          mobile.deviceType,
          mobile.deviceModal,
          mobile.memory,
          mobile.ram,
          mobile.price,
        ].some((field) =>
          field && typeof field === "string"
            ? field.toLowerCase().includes(searchTxt.toLowerCase())
            : false
        )
      );
    }
    return filtered;
  }, [data, statusFilter, searchTxt]);

  return (
    <div>
      <div className="mobile-summary-header mobiles-summary-header">
        <div className="mobiles-status-title">Smart Watch</div>
        <div className="action-btn-container">
          {role !== "user" && (
            <button
              style={{ backgroundColor: "#ef3f2c" }}
              className="action-btn"
            >
              <Plus size={20} /> Sell Your product
            </button>
          )}
          {role === "user" && (
            <button
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
        {filteredmobilesData.length > 0 ? (
          filteredmobilesData.map((device, index) => (
            <div
              onClick={() => {
                setIsOpen(true);
                setSelectedCard(device);
              }}
              className="mobile-card"
              key={index}
            >
              <Slider slides={device.img} />
              <div className="mobile-card__info_content">
                <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                  <h3>{device.deviceModal}</h3>
                  <h3 className="mobile-card__role">{device.brandName}</h3>
                </div>
                <div className="mobile-card_details_container">
                  <p className="mobile_card_details">
                    <strong>DeviceType:</strong>
                    <span className="dashed-line"></span>
                    {device.deviceType}
                  </p>
                  {device.ram ? (
                    <p className="mobile_card_details">
                      <strong>RAM:</strong>
                      <span className="dashed-line"></span>
                      {device.ram}GB
                    </p>
                  ) : (
                    <p className="mobile_card_details">
                      <strong>Battery Helth:</strong>
                      <span className="dashed-line"></span>
                      {device.betteryHelth}%
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
        <div onClick={() => setIsOpen(false)} className="modal-overlay">
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="modal-card"
          >
            <div className="modal-header">
              <button className="back-button" onClick={() => setIsOpen(false)}>
                ❮
              </button>
              <h3 className="modal-title">{selectedCard.deviceModal}</h3>
            </div>
            <div
              style={{
                borderRadius: "0px",
                maxWidth: "500px",
                cursor: "default",
              }}
              className="mobile-card"
            >
              <Slider slides={selectedCard.img} />
              <div className="mobile-card__info_content">
                <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                  <h3>{selectedCard.brandName}</h3>
                  <h3
                    style={{
                      cursor: "pointer",
                      padding: "3px 13px ",
                      fontSize: "12px",
                    }}
                    className="mobile-card__role"
                  >
                    Update
                  </h3>
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
                      <strong>Battery Helth:</strong>
                      <span className="dashed-line"></span>
                      {selectedCard.betteryHelth}%
                    </p>
                  )}
                  <p className="mobile_card_details">
                    <strong>Memory:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.memory}GB
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
    </div>
  );
};

export default SmartWatches;
