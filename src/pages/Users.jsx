import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import "../assets/styles/Users.css";
import Loader from "../components/Loader";
import { Mail, Phone } from "lucide-react";

const ProfileImage = "https://media-hosting.imagekit.io/65285a76faae4aaf...";

const Users = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const collections = ["SELLERS", "USERS"];
      let allUsers = [];

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        allUsers = [
          ...allUsers,
          ...querySnapshot.docs
            .map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
              collection: collectionName,
            }))
            .filter((userData) => userData.email !== currentUser?.email)
            .map((userData) => ({
              id: userData.id,
              name: userData.name || "Unnamed User",
              profileImg: userData.profileImg || ProfileImage,
              email: userData.email,
              role: userData.role,
              userEmail: userData.userEmail,
              phoneNumber: userData.phoneNumber,
              UserType: userData.isActive != null ? userData.isActive : "N/A",
              collection: userData.collection,
            })),
        ];
      }
      setUsers(allUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && role) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser, role, fetchUsers]);

  const updateUserStatus = useCallback(
    async (userId, collection, currentStatus) => {
      try {
        const newStatus = !currentStatus;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, UserType: newStatus } : user
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
          filteredUsersData.map((user, index) => (
            <div className="user-card" key={index}>
              <div className="user-card__info_img">
                <img src={user.profileImg || ProfileImage} alt="Profile" />
              </div>
              <div className="user-card__info_content">
                <div className="user-card__text user-card__info">
                  <h3>{user.name}</h3>
                  <h3 className="user-card__role">
                    {user.role === "user" ? "Customer" : "Seller"}
                  </h3>
                </div>
                <div className="user-card_details_container">

                </div>
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
                  <div className="user-card__status">
                    <div
                      onClick={() =>
                        updateUserStatus(
                          user.id,
                          user.collection,
                          user.UserType
                        )
                      }
                      className={`user-card__status user-card__status-${
                        user.UserType === true ? "Active" : "InActive"
                      }`}
                    >
                      <span
                        className="user-card__status-indicator"
                        style={{
                          backgroundColor:
                            user.UserType === false ? "#ee3f24" : "green",
                        }}
                      ></span>
                      {user.UserType === false ? "InActive" : "Active"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">No Users</div>
        )}
      </div>
    </div>
  );
};

export default Users;
