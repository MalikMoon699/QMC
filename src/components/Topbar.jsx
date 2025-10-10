import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/TopBar.css";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/FirebaseConfig";
import TopBarModal from "./TopBarModal";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import Theme from "./Theme";

const ProfileImage =
  "https://png.pngtree.com/png-clipart/20200701/original/pngtree-single-person-character-in-vector-png-image_5359691.jpg";

const TopBar = ({ searchTxt, setSearchText }) => {
  const { currentUser, role } = useAuth();
  const [isSearch, setIsSearch] = useState(false);
  const location = useLocation();
  const [state, setState] = useState({
    isOpen: false,
    loading: true,
    error: "",
    userCustomId: null,
    userData: {
      name: "",
      userEmail: "",
      phoneNumber: "",
      profileImg: "",
    },
  });

  const unsubscribeRef = useRef({
    user: null,
  });

  useEffect(() => {
    if (!currentUser || !role) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const setupListeners = () => {
      const collectionMap = {
        user: "USERS",
        admin: "ADMIN",
        seller: "USERS",
      };
      const collectionName = collectionMap[role.toLowerCase()];
      const userQuery = query(
        collection(db, collectionName),
        where("uid", "==", currentUser.uid)
      );

      unsubscribeRef.current.user = onSnapshot(
        userQuery,
        (querySnapshot) => {
          if (!collectionName) {
            console.error("No collection mapped for role:", role);
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "Invalid user role",
            }));
            return;
          }
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data();
            setState((prev) => ({
              ...prev,
              userData: {
                name: data.name || "",
                userEmail: data.email || "",
                phoneNumber: data.phoneNumber || "",
                profileImg: data.profileImg || "",
              },
              userCustomId: userDoc.id,
              loading: false,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              userData: {
                name: currentUser.displayName || "Unknown User",
                profileImg: "",
              },
              loading: false,
            }));
          }
        },
        (err) => {
          console.error("Error fetching user data:", err);
          setState((prev) => ({
            ...prev,
            error: "Failed to load user data.",
            loading: false,
          }));
        }
      );
    };

    setupListeners();

    return () => {
      if (unsubscribeRef.current.user) unsubscribeRef.current.user();
    };
  }, [currentUser, role]);

  return (
    <>
      <div className="topBarContainer mobiletopBarContainer">
        <div className="topBarInnerContainer">
          <div
            className={`${
              location.pathname === "/" || location.pathname === "/aboutUs"
                ? "nameWrapp"
                : "searchWrapper"
            } ${isSearch ? "" : "deActiveSearchWrapper"}`}
          >
            {location.pathname === "/" ? (
              <div className="topbar-name-wrapper">
                <span style={{ border: "none", padding: "0px" }}>Hi!</span>
                {state.userData.name || "N/A"}
              </div>
            ) : location.pathname === "/aboutUs" ? (
              <div className="topbar-name-wrapper">About Us</div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTxt}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <span>
                  <Search
                    onClick={() => {
                      setIsSearch((prev) => !prev);
                    }}
                    className="icon"
                    size={20}
                    color="black"
                  />
                </span>
              </>
            )}
          </div>
          <Theme />
          <div className="topBarActionsWrapper">
            <div
              onClick={() =>
                setState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
              }
              className={`profile-card ${
                isSearch ||
                location.pathname === "/" ||
                location.pathname === "/aboutUs"
                  ? "deActiveSearchprofile-card"
                  : ""
              }`}
            >
              <div className="profile-info">
                <img
                  className="profile-image"
                  src={state.userData.profileImg || ProfileImage}
                  alt="Profile"
                />
                <span
                  className={`${
                    isSearch ||
                    location.pathname === "/" ||
                    location.pathname === "/aboutUs"
                      ? "deActiveSearchprofile-name"
                      : "profile-name"
                  }`}
                >
                  {state.userData.name || "N/A"}
                </span>
              </div>
              <span
                className={`${
                  isSearch ||
                  location.pathname === "/" ||
                  location.pathname === "/aboutUs"
                    ? "deActiveSearchDetailArrow"
                    : "topbarDetailArrow"
                } arrow ${state.isOpen ? "rotated" : ""}`}
              >
                ❮
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="topBarContainer">
        <div className="topBarInnerContainer">
          <div className={location.pathname !== "/" ? "searchWrapper" : ""}>
            {location.pathname === "/" ? (
              <div className="topbar-name-wrapper">
                <span style={{ border: "none", padding: "0px" }}>Hi!</span>
                {state.userData.name || "N/A"}
              </div>
            ) : location.pathname === "/aboutUs" ? (
              <div className="topbar-name-wrapper">About Us</div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTxt}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <span>
                  <Search
                    onClick={() => {
                      setIsSearch((prev) => !prev);
                    }}
                    className="icon"
                    size={20}
                    color="black"
                  />
                </span>
              </>
            )}
          </div>
          <div className="topBarActionsWrapper">
            <Theme />
            <div
              onClick={() =>
                setState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
              }
              className="profile-card"
            >
              <div className="profile-info">
                <img
                  className="profile-image"
                  src={state.userData.profileImg || ProfileImage}
                  alt="Profile"
                />
                <span className="profile-name">
                  {state.userData.name || "N/A"}
                </span>
              </div>
              <span
                className={`topbarDetailArrow arrow ${
                  state.isOpen ? "rotated" : ""
                }`}
              >
                ❮
              </span>
            </div>
          </div>
        </div>
      </div>
      {state.isOpen && (
        <TopBarModal
          userData={state.userData}
          onProfileUpdate={() => {
            if (unsubscribeRef.current.user) unsubscribeRef.current.user();
            const collectionMap = {
              user: "USERS",
              admin: "ADMIN",
            };
            const collectionName =
              collectionMap[role.toLowerCase()] || "EMPLOYEES";
            const userQuery = query(
              collection(db, collectionName),
              where("uid", "==", currentUser.uid)
            );
            unsubscribeRef.current.user = onSnapshot(
              userQuery,
              (querySnapshot) => {
                if (!querySnapshot.empty) {
                  const userDoc = querySnapshot.docs[0];
                  const data = userDoc.data();
                  setState((prev) => ({
                    ...prev,
                    userData: {
                      name:
                        data.name || currentUser.displayName || "Unknown User",
                      userEmail: data.userEmail || "",
                      phoneNumber: data.phoneNumber || "",
                      profileImg: data.profileImg || "",
                    },
                    userCustomId: data.customId || userDoc.id,
                  }));
                }
              }
            );
          }}
          isOpen={state.isOpen}
          setIsOpen={(value) =>
            setState((prev) => ({ ...prev, isOpen: value }))
          }
        />
      )}
    </>
  );
};

export default TopBar;
