import { ArrowUpFromLine, Plus } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import { demo5 } from "../utils/Demoimages";
import Loader from "../components/Loader";

const AboutUs = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);

  const fetchAdmin = useCallback(async () => {
    try {
      const collections = ["ADMIN"];
      let allAdmins = [];

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        allAdmins = [
          ...allAdmins,
          ...querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            collection: collectionName,
          })),
        ];
      }

      const formattedAdmins = allAdmins.map((adminData) => ({
        name: adminData.name || "Unnamed User",
        profileImg: adminData.profileImg || demo5,
        email: adminData.email || "N/A",
        phoneNumber: adminData.phoneNumber || "N/A",
      }));

      setAdminData(formattedAdmins);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAdminData([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  if (loading) {
    return (
      <div>
        <Loader loading={true} />
      </div>
    );
  }

  return (
    <div>
      <div className="mobiles-summary-header">
        <div className="mobiles-status-title">About Us</div>
        <button
          style={{ backgroundColor: "red", padding: "10px 20px", gap: "12px" }}
          className="action-btn"
          onClick={() => {
            setUpdate(true);
          }}
        >
          <ArrowUpFromLine size={20} />
          Update
        </button>
      </div>
      <div>
        <div>
          {adminData.length > 0 ? (
            adminData.map((admin, index) => (
              <div key={index} className="mobile-summary-header">
                <img src={admin.profileImg} alt={`${admin.name}'s profile`} />
                <h2>{admin.name}</h2>
                <h2>{admin.email}</h2>
                <h2>{admin.phoneNumber}</h2>
              </div>
            ))
          ) : (
            <div>No admin data available</div>
          )}
        </div>
      </div>
      {update && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <button onClick={()=>{setUpdate(false);}} className="back-button">❮</button>
              <h3 className="modal-title">Update</h3>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUs;
