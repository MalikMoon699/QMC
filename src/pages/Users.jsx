import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import "../assets/styles/Users.css";
import Loader from "../components/Loader";
import { AlertTriangle, Mail, Phone } from "lucide-react";
import ImageViewer from "../components/ImageViewer";

const ProfileImage = "https://media-hosting.imagekit.io/65285a76faae4aaf...";

const Users = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [imageViewer, setImageViewer] = useState(false);
  const [updateRole, setUpdateRole] = useState(null);

  const slected0Img =
    "data:image/jpeg;base64,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";
  const slectedImg =
    "data:image/jpeg;base64,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";
  const CropDemoimage3 =
    "https://www.symbios.pk/image/cache/data/8/879dd4cbdbb63fd208f29c688bd178b9-500x500.jpg";
  const CropDemoimage4 =
    "data:image/jpeg;base64,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";


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
        <button
          onClick={() => {
            setImageViewer(true);
          }}
        >
          ImageViewer
        </button>
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
      {imageViewer && (
        <ImageViewer
          imgUrl={slectedImg}
          onClose={() => {
            setImageViewer(false);
          }}
        />
      )}
    </div>
  );
};

export default Users;
