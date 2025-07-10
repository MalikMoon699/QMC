import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import "../assets/styles/Users.css";
import Loader from "../components/Loader";
import { AlertTriangle, Mail, Phone } from "lucide-react";
import { fetchAllUsers } from "../utils/Helpers";

const ProfileImage = "https://media-hosting.imagekit.io/65285a76faae4aaf...";

const Users = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updateRole, setUpdateRole] = useState(null);

  useEffect(() => {
    getUsers();
  }, [currentUser, role]);

  const getUsers = async () => {
    try {
      const users = await fetchAllUsers();

      let userByRole = [];

      if (role === "admin") {
        userByRole = users;
      } else if (role === "seller") {
        userByRole = users.filter((user) => user.role === "user");
      }

      setUsers(userByRole);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = useCallback(
    async (userId, collection, currentStatus) => {
      try {
        const newStatus = !currentStatus;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isActive: newStatus } : user
          )
        );

        const userDocRef = doc(db, collection, userId);
        await updateDoc(userDocRef, { isActive: newStatus });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    },
    []
  );

  const handleUpdateRole = useCallback(async () => {
    if (!updateRole) return;
    const { userId, collection, currentRole } = updateRole;
    const newRole = currentRole === "user" ? "seller" : "user";
    try {
      setLoading(true);
      const userDocRef = doc(db, collection, userId);
      await updateDoc(userDocRef, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setUpdateRole(null);
      setLoading(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      setLoading(false);
    }
  }, [updateRole]);

  const filteredUsersData = useMemo(() => {
    let filtered = users;
    if (statusFilter !== "All") {
      filtered = users.filter(
        (record) =>
          (statusFilter === "Active" && record.UserType === true) ||
          (statusFilter === "InActive" && record.UserType === false)
      );
    }
    if (searchTxt.trim()) {
      filtered = filtered.filter((user) =>
        [
          user.name,
          user.email,
          user.role,
          user.userEmail,
          user.phoneNumber,
        ].some((field) =>
          field && typeof field === "string"
            ? field.toLowerCase().includes(searchTxt.toLowerCase())
            : false
        )
      );
    }
    return filtered;
  }, [users, statusFilter, searchTxt]);

  if (loading) {
    return <Loader loading={true} />;
  }

  return (
    <div>
      <div className="users-summary-header">
        <div className="users-status-title">Users</div>
        <div className="action-btn-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-select"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="InActive">InActive</option>
          </select>
        </div>
      </div>
      <div className="users-container">
        {filteredUsersData.length > 0 ? (
          filteredUsersData
            .slice()
            .reverse()
            .map((user, index) => (
              <div className="user-card" key={index}>
                <div className="user-card__info_img">
                  <img src={user.profileImg || ProfileImage} alt="Profile" />
                </div>
                <div className="user-card__info_content">
                  <div className="user-card__text user-card__info">
                    <h3>{user.name}</h3>
                    {role === "admin" ? (
                      <h3
                        className="user-card__role"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setUpdateRole({
                            userId: user.id,
                            collection: user.collection,
                            currentRole: user.role,
                          })
                        }
                      >
                        {user.role === "user" ? "Customer" : "Seller"}
                      </h3>
                    ) : (
                      <h3 className="user-card__role">
                        {user.role === "user" ? "Customer" : "Seller"}
                      </h3>
                    )}
                  </div>
                  <div className="user-card_details_container"></div>
                  <div className="user-card_personal_details_container ">
                    <div className="user-card__contact">
                      <Mail />
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.userEmail}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h4>{user.email}</h4>
                      </a>
                    </div>
                    {user.phoneNumber && (
                      <div className="user-card__contact">
                        <Phone />
                        <a
                          href={`https://wa.me/${user.phoneNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <h4>{user.phoneNumber}</h4>
                        </a>
                      </div>
                    )}
                    {role === "admin" ? (
                      <div className="user-card__status">
                        <div
                          onClick={() =>
                            updateUserStatus(
                              user.id,
                              user.collection,
                              user.isActive
                            )
                          }
                          className={`user-card__status user-card__status-${
                            user.isActive === true ? "Active" : "InActive"
                          }`}
                        >
                          <span
                            className="user-card__status-indicator"
                            style={{
                              backgroundColor:
                                user.isActive === false ? "#ee3f24" : "green",
                            }}
                          ></span>
                          {user.isActive === false ? "InActive" : "Active"}
                        </div>
                      </div>
                    ) : (
                      <div className="user-card__status">
                        <div
                          className={`user-card__status user-card__status-${
                            user.isActive === true ? "Active" : "InActive"
                          }`}
                        >
                          <span
                            className="user-card__status-indicator"
                            style={{
                              backgroundColor:
                                user.isActive === false ? "#ee3f24" : "green",
                            }}
                          ></span>
                          {user.isActive === false ? "InActive" : "Active"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="empty-message">No Users</div>
        )}
      </div>
      {updateRole && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "400px" }}>
            <div className="sidebar-modal">
              <div className="contentWrapper">
                <AlertTriangle color="red" size={80} />
                <h3>Update User Role</h3>
                <p>{`Are you sure you want to update the role of this user from ${
                  updateRole.currentRole === "user" ? "Customer" : "Seller"
                } to ${
                  updateRole.currentRole === "user" ? "Seller" : "Customer"
                }?`}</p>
              </div>
              <div className="update-role-container">
                <div className="logout-btn-container">
                  <button
                    onClick={() => setUpdateRole(null)}
                    className="logout-cencel-btn logout-delte-btn-same"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    className="logout-delte-btn logout-delte-btn-same"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
