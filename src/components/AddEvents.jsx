import React, { useState, useEffect } from "react";
import { auth, db } from "../utils/FirebaseConfig";
import "../assets/styles/Events.css";
import { Search } from "lucide-react";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { generateCustomId, fetchCurrentUser } from "../utils/Helpers";
import { demo1 } from "../utils/Demoimages";

const AddEvents = ({ onClose, EventToUpdate }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventoff, setEventoff] = useState("");
  const [currentUserDetails, setCurrentUserDetails] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("SMARTDEVICES");
  const [devices, setDevices] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (EventToUpdate) {
      setEventName(EventToUpdate.eventName || "");
      setEventoff(EventToUpdate.eventoff || "");
      setEventDescription(EventToUpdate.eventDescription || "");
      setSelectedEvents(EventToUpdate.selectedEvents || []);
    }
  }, [EventToUpdate]);

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

  useEffect(() => {
    if (!currentUser?.email) return;

    setLoading(true);

    const q = query(
      collection(db, activeTab),
      where("createdByEmail", "==", currentUser.email)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const devicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(devicesData);
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${activeTab}:`, error);
        setLoading(false);
        toast.error(`Failed to fetch ${activeTab.toLowerCase()}.`);
      }
    );

    return () => unsubscribe();
  }, [activeTab, currentUser?.email]);

  const handleNextStep = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!eventName) newErrors.eventName = "Event Name is required!!!";
    if (!eventoff) newErrors.eventoff = "Event Off is required. At least 1%!!!";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (selectedEvents.length === 0)
      newErrors.deviceModel = "Select at least 1 device!!!";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setUploading(true);
    try {
      const productData = {
        createdBy: currentUserDetails.name,
        createdByEmail: currentUserDetails.email,
        createdByPhoneNumber: currentUserDetails.phoneNumber,
        eventName: eventName,
        selectedEvents: selectedEvents,
        eventoff: eventoff,
        description: eventDescription,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      };

      if (EventToUpdate) {
        await updateDoc(doc(db, "EVENTS", EventToUpdate.id), productData);
        toast.success("Product updated successfully!");
      } else {
        const customId = await generateCustomId("EVENTS");
        await setDoc(doc(db, "EVENTS", customId), productData);
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
    setEventName("");
    setEventoff("");
    setEventDescription("");
    setSelectedEvents([]);
    onClose();
  };

  const filteredDevices = devices.filter((device) =>
    searchQuery
      ? device.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleDeviceSelection = (device) => {
    setSelectedEvents((prev) => {
      const isSelected = prev.some((item) => item.id === device.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== device.id);
      } else {
        return [...prev, device];
      }
    });
  };

  const handleSelectAll = () => {
    const allSelected = filteredDevices.every((device) =>
      selectedEvents.some((selected) => selected.id === device.id)
    );

    if (allSelected) {
      setSelectedEvents((prev) =>
        prev.filter(
          (item) => !filteredDevices.some((device) => device.id === item.id)
        )
      );
    } else {
      setSelectedEvents((prev) => [
        ...prev,
        ...filteredDevices.filter(
          (device) => !prev.some((item) => item.id === device.id)
        ),
      ]);
    }
  };

  const isDeviceSelected = (deviceId) => {
    return selectedEvents.some((item) => item.id === deviceId);
  };

  const isAllSelected =
    filteredDevices.length > 0 &&
    filteredDevices.every((device) => isDeviceSelected(device.id));

  return (
    <div className="modal-overlay">
      <div
        style={{ width: step === 1 ? "300px" : "auto" }}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <button
            onClick={() => (step === 1 ? handleClose() : onBack())}
            className="back-button"
          >
            ❮
          </button>
          <h3 className="modal-title">
            {EventToUpdate ? "Update Event" : "Add Event Sale"}
          </h3>
        </div>
        <form style={{ padding: "20px" }}>
          {step === 1 && (
            <>
              <input
                className="login-input"
                type="text"
                placeholder="Event Name."
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                  setErrors((prev) => ({ ...prev, eventName: "" }));
                }}
              />
              {errors.eventName && (
                <p className="login-form-error">{errors.eventName}</p>
              )}
              <input
                className="login-input"
                type="number"
                placeholder="How much Off%."
                value={eventoff}
                onChange={(e) => {
                  setEventoff(e.target.value);
                  setErrors((prev) => ({ ...prev, eventoff: "" }));
                }}
              />
              {errors.eventoff && (
                <p className="login-form-error">{errors.eventoff}</p>
              )}
              <input
                className="login-input"
                type="text"
                placeholder="Event Description Optional."
                value={eventDescription}
                onChange={(e) => {
                  setEventDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, eventDescription: "" }));
                }}
              />
              {errors.eventDescription && (
                <p className="login-form-error">{errors.eventDescription}</p>
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
              <div className="event-sale-tab">
                <div
                  className={`tab tab-${
                    activeTab === "SMARTDEVICES" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("SMARTDEVICES")}
                >
                  Devices
                </div>
                <div
                  className={`tab tab-${
                    activeTab === "ACCESSORIES" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("ACCESSORIES")}
                >
                  Accessories
                </div>
              </div>
              <div className="add-event-search-container">
                <div
                  className="select-all-container"
                  style={{ margin: "10px 0" }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={filteredDevices.length === 0}
                  />
                </div>
                <div className="searchWrapper">
                  <input
                    style={{ borderRadius: "8px" }}
                    type="text"
                    className="search"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search color="black" className="icon" size={20} />
                </div>
              </div>
              <div className="devices-list">
                {loading ? (
                  <div
                    style={{
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Loader loading={true} />
                  </div>
                ) : filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <div key={device.id} className="device-item">
                      <input
                        type="checkbox"
                        checked={isDeviceSelected(device.id)}
                        onChange={() => handleDeviceSelection(device)}
                      />
                      <img src={device.images?.[0] || demo1} />
                      <div style={{ overflow: "hidden" }}>
                        <h3
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "noWrap",
                          }}
                        >
                          {device.deviceModel}
                        </h3>
                        <p>{device.brandName}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No devices found.</p>
                )}
              </div>
              {errors.deviceModel && (
                <p className="login-form-error">{errors.deviceModel}</p>
              )}
              {errors.submit && (
                <p className="login-form-error">{errors.submit}</p>
              )}
              <div className="action-btn-container">
                <button
                  style={{ width: "100%", justifyContent: "center" }}
                  className="continue-btn"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading
                    ? "Processing..."
                    : EventToUpdate
                    ? "Update Event"
                    : "Add Event"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddEvents;
