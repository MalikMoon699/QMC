import { Plus } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import { demo5 } from "../utils/Demoimages"; 

const AboutUs = () => {
  const { currentUser, role } = useAuth();
  const { searchTxt } = useOutletContext();
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      {adminData.length > 0 ? (
        adminData.map((admin, index) => (
          <div
            key={index}
            className="mobile-summary-header mobiles-summary-header"
          >
            <div className="mobiles-status-title">About Us</div>
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
  );
};

export default AboutUs;
