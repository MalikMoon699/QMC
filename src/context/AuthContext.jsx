import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../utils/FirebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import { generateCustomId } from "../utils/Helpers";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [hasProfileDetails, setHasProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const createUserDocument = async (
    user,
    userRole = "user",
    additionalData = {}
  ) => {
    if (!user) {
      throw new Error("No user provided");
    }

    try {
      const collectionName =
        userRole === "user" ? "USERS" : userRole.toUpperCase();
      const customId = await generateCustomId(collectionName);
      const userDocRef = doc(db, collectionName, customId);
      const userData = {
        email: user.email,
        role: userRole,
        isActive: true,
        profileImg: "",
        name: additionalData.name || "",
        phoneNumber: additionalData.phoneNumber || "",
        uid: user.uid,
      };

      await setDoc(userDocRef, userData);
      setRole(userRole);
      setHasProfileDetails(
        !!(additionalData.name && additionalData.phoneNumber)
      );
      setIsNewUser(true);
      return userData;
    } catch (error) {
      console.error("Error creating user document:", error);
      throw error;
    }
  };

  const findUserDoc = async (user) => {
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
    return null;
  };

  const logout = async (message = "Your account has been deactivated.") => {
    await signOut(auth);
    setCurrentUser(null);
    setRole(null);
    setHasProfileDetails(null);
    setIsNewUser(false);
    if (location.pathname !== "/login") {
      navigate("/login", { state: { message } });
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userInfo = await findUserDoc(user);

      if (userInfo) {
        const { userData } = userInfo;
        if (userData.isActive === false) {
          await signOut(auth);
          throw new Error("Your account is inactive.");
        }
        setCurrentUser(user);
        setRole(userData.role);

        const requiredFields = ["name", "phoneNumber"];
        const profileComplete = requiredFields.every(
          (field) => userData[field] && userData[field].trim() !== ""
        );
        setHasProfileDetails(profileComplete);

        if (profileComplete) {
          navigate("/");
        } else {
          navigate("/profileDetails");
        }

        return userData;
      } else {
        await createUserDocument(user);
        setRole("user");
        setHasProfileDetails(false);
        navigate("/profileDetails");
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          const cachedRole = localStorage.getItem(`userRole_${user.uid}`);
          if (cachedRole) {
            setRole(cachedRole);
          }

          const userInfo = await findUserDoc(user);
          if (userInfo) {
            const { userData } = userInfo;
            if (userData.isActive === false) {
              await logout("Your account is inactive.");
              return;
            }

            setRole(userData.role);
            localStorage.setItem(`userRole_${user.uid}`, userData.role);

            const requiredFields = ["name", "phoneNumber"];
            const profileComplete = requiredFields.every(
              (field) => userData[field] && userData[field].trim() !== ""
            );
            setHasProfileDetails(profileComplete);
            if (!profileComplete && location.pathname !== "/profileDetails") {
              navigate("/profileDetails");
            } else if (
              profileComplete &&
              location.pathname === "/profileDetails"
            ) {
              navigate("/");
            }
          } else if (!isNewUser) {
            await createUserDocument(user);
            navigate("/profileDetails");
          }
        } else {
          setRole(null);
          setHasProfileDetails(null);
          setIsNewUser(false);
          localStorage.removeItem(`userRole_${user?.uid}`);
          if (!["/login", "/signUp"].includes(location.pathname)) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setRole(null);
        setHasProfileDetails(null);
        setIsNewUser(false);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, [navigate, location.pathname, isNewUser]);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};
    if (currentUser) {
      findUserDoc(currentUser).then((userInfo) => {
        if (userInfo) {
          const { collectionName, userId } = userInfo;
          const userDocRef = doc(db, collectionName, userId);
          unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData.isActive === false) {
                  logout();
                }
                const requiredFields = ["name", "phoneNumber"];
                const profileComplete = requiredFields.every(
                  (field) => userData[field] && userData[field].trim() !== ""
                );
                setHasProfileDetails(profileComplete);
                if (
                  profileComplete &&
                  location.pathname === "/profileDetails"
                ) {
                  navigate("/");
                }
              } else {
                console.log(`User document not found for ${currentUser.email}`);
              }
            },
            (error) => {
              console.error("Error in isActive listener:", error);
            }
          );
        } else {
          console.log(
            "User document not found for isActive listener:",
            currentUser.email
          );
        }
      });
    }

    return () => {
      unsubscribeSnapshot();
    };
  }, [currentUser, navigate, location.pathname]);

  const value = {
    currentUser,
    role,
    loading,
    createUserDocument,
    hasProfileDetails,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loader loading={true} /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
