import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import "../assets/styles/Events.css";
import { useAuth } from "../context/AuthContext";
import { demo1, demo2, demo3, demo4 } from "../utils/Demoimages";
import Slider from "../components/Slider";
import { MessageCircleWarning, Plus, ReceiptText, Store } from "lucide-react";
import { db } from "../utils/FirebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import SellerApplication from "../components/SellerApplication";
import AddEvents from "../components/AddEvents";

const Events = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedEventCard, setSelectedEventCard] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "EVENTS"),
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

    if (searchTxt.trim()) {
      filtered = filtered.filter((device) =>
        [device.eventName].some((field) =>
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
  }, [devices, searchTxt]);

  const handleDeleteEvent = async () => {
    if (!selectedCard?.id) return;
    try {
      await deleteDoc(doc(db, "EVENTS", selectedCard.id));
      setDevices((prev) =>
        prev.filter((device) => device.id !== selectedCard.id)
      );
      toast.success("Event marked as Delete!");
      setIsUpdateModal(false);
      setIsOpen(false);
      setSelectedCard(null);
    } catch (error) {
      console.error("Error deleting Event:", error);
      toast.error("Failed to mark Event as Delete.");
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
          {role === "admin" && (
            <button
              onClick={() => setSellModalOpen(true)}
              style={{ backgroundColor: "#ef3f2c" }}
              className="action-btn"
            >
              <Plus size={20} />
              Add Event Sale
            </button>
          )}
        </div>
      </div>
      <div className="events-container">
        {loading ? (
          <Loader loading={true} />
        ) : filteredMobilesData.length > 0 ? (
          filteredMobilesData.map((device, index) => (
            <div className="event-card" key={device.id || index}>
              <div className="events-type-container">
                <h1
                  style={{
                    width: "50%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {device.eventName}
                </h1>
                <button
                  className="action-btn"
                  style={{ backgroundColor: "#ef3f2c" }}
                  onClick={() => {
                    setIsOpen(true);
                    setSelectedCard(device);
                  }}
                >
                  <ReceiptText size={20} />
                  Event Details
                </button>
              </div>
              <div className="mobiles-container single-event-container">
                {device.selectedEvents?.length > 0 ? (
                  device.selectedEvents.map((selectedDevice, idx) => (
                    <div
                      onClick={() => {
                        setSelectedEventCard(selectedDevice);
                        setIsEventOpen(true);
                      }}
                      key={idx}
                      className="mobile-card"
                    >
                      <Slider
                        slides={
                          selectedDevice.images?.length
                            ? selectedDevice.images
                            : fallbackImages
                        }
                      />
                      <div className="mobile-card__info_content">
                        <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                          <h3>{selectedDevice.deviceModel}</h3>
                          <h3 className="mobile-card__role">
                            {selectedDevice.brandName}
                          </h3>
                        </div>
                        {selectedDevice.fields
                          ?.slice(0, 2)
                          .map((field, idx) => (
                            <p key={idx} className="mobile_card_details">
                              <strong>{field.fieldName}:</strong>
                              <span className="dashed-line"></span>
                              {field.body}
                            </p>
                          ))}
                        <div className="mobile-card_details_container">
                          {selectedDevice.ram && (
                            <p className="mobile_card_details">
                              <strong>RAM:</strong>
                              <span className="dashed-line"></span>
                              {selectedDevice.ram}GB
                            </p>
                          )}
                          {selectedDevice.batteryHealth && (
                            <p className="mobile_card_details">
                              <strong>Battery Health:</strong>
                              <span className="dashed-line"></span>
                              {selectedDevice.batteryHelth || "N/A"}%
                            </p>
                          )}
                          {selectedDevice.memory && (
                            <p className="mobile_card_details">
                              <strong>Memory:</strong>
                              <span className="dashed-line"></span>
                              {selectedDevice.memory}GB
                            </p>
                          )}
                          <p
                            style={{ color: "green" }}
                            className="mobile_card_details"
                          >
                            <strong>Off:</strong>
                            <span className="dashed-line"></span>
                            <span> {device.eventoff}</span>
                            <span>%</span>
                          </p>
                          <p
                            style={{ color: "red" }}
                            className="mobile_card_details"
                          >
                            <strong>Price:</strong>
                            <span className="dashed-line"></span>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "grey",
                                fontSize: "10px",
                                fontWeight: "300",
                              }}
                            >
                              {`[${selectedDevice.price}]`}
                            </span>
                            <span>
                              {" "}
                              {Math.round(
                                selectedDevice.price *
                                  (1 - device.eventoff / 100)
                              )}
                            </span>
                            <span>PKR</span>
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
                            {selectedDevice.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No devices selected for this event</p>
                )}
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
              <h3 className="modal-title">{selectedCard.eventName}</h3>
            </div>
            <div className="mobile-card mobile-modal-card">
              <div className="mobile-card__info_content">
                <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                  <h3>-{selectedCard.eventoff}%</h3>
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
                    <strong>Created At:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdAt.toDate().toLocaleString("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Karachi",
                    })}
                  </p>

                  <p className="mobile_card_details">
                    <strong>Total Devices:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.selectedEvents.length}
                  </p>
                  <p
                    style={{ color: "#00a400" }}
                    className="mobile_card_details"
                  >
                    <strong>Event By:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdBy}
                  </p>
                  <p
                    style={{ color: "#00c000" }}
                    className="mobile_card_details"
                  >
                    <strong>Mail:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdByEmail}
                  </p>
                  <p
                    style={{ color: "#00c000" }}
                    className="mobile_card_details"
                  >
                    <strong>Number:</strong>
                    <span className="dashed-line"></span>
                    {selectedCard.createdByPhoneNumber}
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
                    {selectedCard.description ||
                      "------------------------------------"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEventOpen && selectedEventCard && (
        <div className="modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="modal-card">
            <div className="modal-header">
              <button
                className="back-button"
                onClick={() => {
                  setIsEventOpen(false);
                  setSelectedEventCard(null);
                }}
              >
                ❮
              </button>
              <h3 className="modal-title">{selectedEventCard.deviceModel}</h3>
            </div>
            <div className="mobile-card mobile-modal-card">
              <Slider
                slides={
                  selectedEventCard.images?.length
                    ? selectedEventCard.images
                    : fallbackImages
                }
              />
              <div className="mobile-card__info_content">
                <div className="mobile-card__text mobile-card__info mobile-card_details_container">
                  <h3>{selectedEventCard.deviceModel}</h3>
                  <h3 className="mobile-card__role">
                    {selectedEventCard.brandName}
                  </h3>
                </div>
                <div className="mobile-card_details_container">
                  {selectedEventCard.fields?.length > 0 &&
                    selectedEventCard.fields.map((selectedDevice, idx) => (
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
                    {selectedEventCard.createdBy}
                  </p>
                  <p
                    style={{ color: "#00c000" }}
                    className="mobile_card_details"
                  >
                    <strong>Seller Mail:</strong>
                    <span className="dashed-line"></span>
                    {selectedEventCard.createdByEmail}
                  </p>
                  <p
                    style={{ color: "#00c000" }}
                    className="mobile_card_details"
                  >
                    <strong>Seller Number:</strong>
                    <span className="dashed-line"></span>
                    {selectedEventCard.createdByPhoneNumber}
                  </p>
                  <p style={{ color: "red" }} className="mobile_card_details">
                    <strong>Price:</strong>
                    <span className="dashed-line"></span>
                    {selectedEventCard.price} PKR
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
                    {selectedEventCard.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUpdateModal && (
        <div
          className="modal-overlay"
        >
          <div style={{ minWidth: "350px" }} className="modal-content">
            <div className="sidebar-modal">
              <div className="contentWrapper">
                <MessageCircleWarning color="red" size={50} />
                <h3>Change Your Event!!!</h3>
                <p>Are You Sure to Update or Delete</p>
              </div>
              <div className="logout-btn-container">
                <button
                  className="logout-cencel-btn logout-delte-btn-same"
                  onClick={() => {
                    setIsUpdateModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="logout-cencel-btn logout-delte-btn-same"
                  onClick={handleDeleteEvent}
                >
                  Delete
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
        <AddEvents
          onClose={() => {
            setSellModalOpen(false);
            setSelectedCard(null);
          }}
          EventToUpdate={selectedCard}
        />
      )}
    </div>
  );
};

export default Events;
