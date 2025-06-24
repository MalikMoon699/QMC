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

export const fetchAllUsers = async () => {
  const collectionsToCheck = ["SELLERS", "USERS"];
  const allUsers = [];

  for (const collectionName of collectionsToCheck) {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    querySnapshot.forEach((doc) => {
      allUsers.push({
        collectionName,
        userId: doc.id,
        userData: doc.data(),
      });
    });
  }

  return allUsers;
};

export const getCroppedImg=(imageSrc, pixelCrop)=>{
  const canvas = document.createElement("canvas");
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    };

    image.src = imageSrc;
  });
}
