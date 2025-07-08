import React, { useEffect, useState } from "react";
import "../assets/styles/AdminDashboard.css";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import AllSoldOut from "../components/AllSoldOut";
import { useAuth } from "../context/AuthContext";
import { demo1, demo2, demo3, demo4 } from "../utils/Demoimages";
import moment from "moment";
import Slider from "../components/Slider";
import {
  fetchCurrentUser,
  fetchAdminUsers,
  fetchAllUsers,
  fetchSmartDevices,
  fetchEvents,
  fetchAccessories,
  fetchSoldOutItems,
} from "../utils/Helpers";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminDashboard = () => {
  const { currentUser, role } = useAuth();
  const [fetchType, setFetchType] = useState("Admin");
  const [soldOutData, setSoldOutData] = useState([]);
  const [switchData, setSwitchData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [soldOutItemsDetails, setSoldOutItemsDetails] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [soldOutAllItems, setSoldOutAllItems] = useState(false);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchSoldOutItems(fetchType, currentUser);
      setSoldOutData(result);
    };

    if (currentUser) {
      getData();
    }
  }, [fetchType, currentUser]);

  const getswitchData = async () => {
    const result = await fetchAdminUsers();
    if (result) {
      setSwitchData(result.isSwitch);
      setAdminId(result.id);
    }
  };

  useEffect(() => {
    fetchCurrentUser(currentUser);
    getswitchData();
    fetchAllUsers();
    fetchSmartDevices();
    fetchEvents();
    fetchAccessories();
  }, []);

  const handleOpenDetailsModal = (item) => {
    setSoldOutItemsDetails(true);
    setSelectedItem(item);
  };

  const handleCloseDetailsModal = (item) => {
    setSoldOutItemsDetails(false);
    setSelectedItem(null);
  };

  const handleUpdateSwitch = async () => {
    if (!adminId) return;

    const newSwitchValue = !switchData;
    setSwitchLoading(true);
    try {
      const adminDocRef = doc(db, "ADMIN", adminId);
      await updateDoc(adminDocRef, { isSwitch: newSwitchValue });
      setSwitchData(newSwitchValue);
      toast.success(
        `Shop is now ${newSwitchValue === true ? "Opened" : "Closed"}`
      );
    } catch (error) {
      console.error("Error updating switch:", error);
    } finally {
      setSwitchLoading(false);
    }
  };

  return (
    <div>
      <div className="users-summary-header">
        <div className="users-status-title shop-status">
          Now Shop is
          {role !== "admin" ? (
            switchData === true ? (
              " Open"
            ) : (
              " Closed"
            )
          ) : (
            <div
              onClick={handleUpdateSwitch}
              className={`toggle-switch ${switchData === true ? "on" : "off"}`}
            >
              {switchLoading ? (
                <Loader
                  loading={true}
                  size={13}
                  className={"switch-loader toggle-knob"}
                />
              ) : (
                <div className="toggle-knob"></div>
              )}
            </div>
          )}
        </div>
        {role === "admin" && (
          <div className="action-btn-container">
            <select
              value={fetchType}
              onChange={(e) => setFetchType(e.target.value)}
              className="custom-select"
            >
              <option value="All">All</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        )}
      </div>
      <div className="recent-solds-container">
        <h3 className="recent-solds-title">Recent Sold Out</h3>
        <div className="recent-sold-item-iner-container">
          {soldOutData.slice(0, 5).map((item, index) => (
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
                  <p className="recent-sold-type">
                    {item.type === "accessory" ? "Accessories" : "SmartDevices"}
                  </p>
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

        <div className="view-recent-solds_btn-container">
          <button
            onClick={() => {
              setSoldOutAllItems(true);
            }}
            className="view-recent-solds_btn"
          >
            View All Recent Solds
          </button>
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
                      {" "}
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
                      style={{ color: "#00a400" }}
                      className="mobile_card_details"
                    >
                      <strong>Sell By:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByEmail === currentUser?.email
                        ? "You"
                        : selectedItem.createdBy}
                    </p>
                    <p
                      style={{ color: "#00c000" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Mail:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByEmail}
                    </p>
                    <p
                      style={{ color: "#00c000" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Number:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByPhoneNumber}
                    </p>
                    <p style={{ color: "red" }} className="mobile_card_details">
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
                      style={{ color: "#00a400" }}
                      className="mobile_card_details"
                    >
                      <strong>Sell By:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdBy}
                    </p>
                    <p
                      style={{ color: "#00c000" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Mail:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByEmail}
                    </p>
                    <p
                      style={{ color: "#00c000" }}
                      className="mobile_card_details"
                    >
                      <strong>Seller Number:</strong>
                      <span className="dashed-line"></span>
                      {selectedItem.createdByPhoneNumber}
                    </p>
                    <p style={{ color: "red" }} className="mobile_card_details">
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

      {soldOutAllItems && (
        <AllSoldOut
          soldOutData={soldOutData}
          onClose={() => {
            setSoldOutAllItems(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
