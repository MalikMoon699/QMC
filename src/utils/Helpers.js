import { db } from "../utils/FirebaseConfig";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";


export const generateCustomId = async (collectionName) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const docRef = doc(db, collectionName, result);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return generateCustomId(collectionName);
  }
  return result;
};

export const fetchCurrentUser = async (user) => {
  if (!user) {
    console.error("No user provided to fetchCurrentUser");
    return null;
  }

  const collectionsToCheck = ["ADMIN", "SELLERS", "USERS"];
  for (const collectionName of collectionsToCheck) {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        collectionName,
        userData: userDoc.data(),
        userId: userDoc.id,
      };
    }
  }
  console.error("No user document found for UID:", user.uid);
  return null;
};

export const fetchAdminUsers = async () => {
  const collectionRef = collection(db, "ADMIN");
  const querySnapshot = await getDocs(collectionRef);

  const firstDoc = querySnapshot.docs[0];
  if (firstDoc) {
    const userData = firstDoc.data();
    return {
      id: firstDoc.id,
      ...userData,
    };
  } else {
    return null;
  }
};

export const fetchAllUsers = async () => {
  const collectionsToCheck = ["SELLERS", "USERS"];
  const allUsers = [];

  for (const collectionName of collectionsToCheck) {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      allUsers.push({
        id: doc.id,
        collection: collectionName,
        ...data,
      });
    });
  }

  return allUsers;
};

export const fetchSmartDevices = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "SMARTDEVICES"));
    const smartDevicesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return smartDevicesData;
  } catch (error) {
    console.error("Error fetching smart devices:", error);
    return [];
  }
};

export const fetchEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "EVENTS"));
    const eventsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return eventsData;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const fetchAccessories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "ACCESSORIES"));
    const accessoriesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return accessoriesData;
  } catch (error) {
    console.error("Error fetching accessories:", error);
    return [];
  }
};

export const fetchSoldOutItems = async (fetchType = "Admin", currentUser = null) => {
  try {
    let userQuery;

    if (fetchType === "Admin" && currentUser?.email) {
      userQuery = query(
        collection(db, "SOLDOUT_ITEMS"),
        where("createdByEmail", "==", currentUser.email)
      );
    } else {
      userQuery = collection(db, "SOLDOUT_ITEMS");
    }

    const querySnapshot = await getDocs(userQuery);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    return items;
  } catch (error) {
    console.error("Error fetching sold-out items:", error);
    return [];
  }
};