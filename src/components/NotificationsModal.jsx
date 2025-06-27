import React, { useState } from "react";
import moment from "moment";
import { ChevronDown, ChevronUp } from "lucide-react";

const NotificationsModal = ({ onClose, selectedNotifications }) => {
  const [isAboutUser, setIsAboutUser] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "410px" }}>
        <div className="modal-header">
          <button className="back-button" onClick={onClose}>
            ❮
          </button>
          <h3 className="modal-title">
            {selectedNotifications.notificationType.charAt(0).toUpperCase() +
              selectedNotifications.notificationType.slice(1)}
          </h3>
        </div>
        <div className="sidebar-modal">
          <div className="sender_Details_Container">
            <img src={selectedNotifications.userImg} />
            <div className="sender_Details">
              <strong>
                {selectedNotifications.notificationType
                  .charAt(0)
                  .toUpperCase() +
                  selectedNotifications.notificationType.slice(1)}
              </strong>
              <p>{selectedNotifications.userName}</p>
              <p>{selectedNotifications.userEmail}</p>
            </div>
          </div>
          <div
            style={{ marginTop: "20px" }}
            className="report-user-container report-description-container"
          >
            <p>{selectedNotifications.description}</p>
          </div>
          <div className="report-user-container">
            <button
              onClick={() => {
                setIsAboutUser((prev) => !prev);
              }}
              className="report-user-button"
            >
              <p># Tagged Users</p>
              <span>{isAboutUser ? <ChevronUp /> : <ChevronDown />}</span>
            </button>
            {isAboutUser && (
              <div className="report-user-list">
                <div className="devices-list">
                  {selectedNotifications.reportAbout.map((report, index) => (
                    <div
                      className="device-item"
                      style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 20px" }}
                      key={index}
                    >
                      <strong>{index + 1}.</strong>
                      <img src={report.userImg} />
                      <div className="tag-users-detail" style={{ overflow: "hidden" }}>
                        <h3>{report.name}</h3>
                        <p>
                          {report.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div
            style={{ alignItems: "start" }}
            className="report-user-container"
          >
            <p>
              <strong>Time:</strong>{" "}
              {selectedNotifications?.createdAt
                ? moment(
                    selectedNotifications.createdAt,
                    "YYYY-MM-DD HH:mm:ss.SSS Z"
                  )
                    .fromNow()
                    .charAt(0)
                    .toUpperCase() +
                  moment(
                    selectedNotifications.createdAt,
                    "YYYY-MM-DD HH:mm:ss.SSS Z"
                  )
                    .fromNow()
                    .slice(1)
                : "DD-MM-YYYY"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
