import React, { useEffect, useState } from "react";
import { demo1, demo2, demo3, demo4 } from "../utils/Demoimages";
import moment from "moment";
import Slider from "../components/Slider";


const AllSoldOut = ({ soldOutData, onClose,fetchType, currentUser}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [soldOutItemsDetails, setSoldOutItemsDetails] = useState(false);

  const handleOpenDetailsModal = (item) => {
    setSoldOutItemsDetails(true);
    setSelectedItem(item);
  };

  const handleCloseDetailsModal = (item) => {
    setSoldOutItemsDetails(false);
    setSelectedItem(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <button onClick={onClose} className="back-button">
            ❮
          </button>
          <h3 className="modal-title">All Your Sold Out</h3>
        </div>
        <div className="recent-sold-item-modal recent-sold-item-iner-container">
          {soldOutData.map((item, index) => (
            <div
              onClick={() => handleOpenDetailsModal(item)}
              className="recent-sold-item"
              key={item.id || index}
            >
              <div className="recent-sold-content-detail">
                <div className="recent-sold-image-container">
                  <img src={(item.images && item.images[0]) || demo1} />
                </div>
                <div>
                  {fetchType === "Admin" ? (
                    <p className="recent-sold-type">
                      {item.type === "accessory"
                        ? "Accessories"
                        : "SmartDevices"}
                    </p>
                  ) : (
                    <p className="recent-sold-type">
                      {item.createdByEmail === currentUser?.email
                        ? "You"
                        : item.createdBy}
                    </p>
                  )}
                  <p className="recent-sold-name">
                    {item.deviceModel || "Unnamed Device"}
                  </p>
                </div>
              </div>
              <div className="recent-sold-info">
                <p className="recent-sold-price">
                  {item.deletedAt
                    ? moment(item.deletedAt.toDate?.() || item.deletedAt)
                        .fromNow()
                        .replace(/^./, (c) => c.toUpperCase())
                    : "Unknown Time"}
                </p>
                <span className="status completed">
                  {item.price || "0.00"} PKR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {soldOutItemsDetails && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <button onClick={handleCloseDetailsModal} className="back-button">
                ❮
              </button>
              <h3 className="modal-title">{selectedItem.deviceModel}</h3>
            </div>
            {selectedItem.type === "accessory" ? (
              <div className="mobile-card mobile-modal-card">
                <Slider
                  slides={
                    selectedItem.images?.length
                      ? selectedItem.images
                      : [demo1, demo2, demo3, demo4]
                  }
                />
                <div className="mobile-card__info_content">
                  <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                    <h3>{selectedItem.brandName}</h3>
                    <h3
                      style={{
                        padding: "3px 13px",
                        fontSize: "12px",
                      }}
                      className="mobile-card__role"
                    >
                      Sold Out
                    </h3>
                  </div>
                  <div className="mobile-card_details_container">
                    {selectedItem.fields?.length > 0 &&
                      selectedItem.fields.map((selectedItem, idx) => (
                        <p key={idx} className="mobile_card_details">
                          <strong>{selectedItem.fieldName}:</strong>
                          <span className="dashed-line"></span>
                          {selectedItem.body}
                        </p>
                      ))}
                    <p
                      style={{ color: "var(--fourthcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Sell By:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByEmail === currentUser?.email
                        ? "You"
                        : selectedItem.createdBy}
                    </p>
                    <p
                      style={{ color: "var(--fourthcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Mail:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByEmail}
                    </p>
                    <p
                      style={{ color: "var(--fourthcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Number:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByPhoneNumber}
                    </p>
                    <p
                      style={{ color: "var(--secondcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Price:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.price} PKR
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
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mobile-card mobile-modal-card">
                <Slider
                  slides={
                    selectedItem.images?.length
                      ? selectedItem.images
                      : [demo1, demo2, demo3, demo4]
                  }
                />
                <div className="mobile-card__info_content">
                  <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                    <h3>{selectedItem.brandName}</h3>
                    <h3
                      style={{
                        cursor: "pointer",
                        padding: "3px 13px",
                        fontSize: "12px",
                      }}
                      className="mobile-card__role"
                    >
                      Sold Out
                    </h3>
                  </div>
                  <div className="mobile-card_details_container">
                    <p className="mobile_card_details">
                      <strong>DeviceType:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.deviceType}
                    </p>
                    {selectedItem.ram ? (
                      <p className="mobile_card_details">
                        <strong>RAM:</strong>
                        <span className="dashed-line"></span>
                        {selectedItem.ram}GB
                      </p>
                    ) : (
                      <p className="mobile_card_details">
                        <strong>Battery Health:</strong>
                        <span className="dashed-line"></span>
                        {selectedItem.batteryHelth || "N/A"}%
                      </p>
                    )}
                    <p className="mobile_card_details">
                      <strong>Memory:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.memory}GB
                    </p>
                    <p
                      style={{ color: "var(--fourthcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Sell By:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdBy}
                    </p>
                    <p
                      style={{ color: "var(--fourthcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Mail:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByEmail}
                    </p>
                    <p
                      style={{ color: "var(--fourthcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Number:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByPhoneNumber}
                    </p>
                    <p
                      style={{ color: "var(--secondcolor)" }}
                      className="mobile_card_details"
                    >
                      <strong>Price:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.price} PKR
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
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSoldOut;
