import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/TopBar.css";
import SearchIcon from "../assets/images/icons/Search.png";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/FirebaseConfig";
import TopBarModal from "./TopBarModal";
import { collection, query, where, onSnapshot } from "firebase/firestore";
// import Notifications from "./Notifications";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";

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
      name: currentUser?.displayName || "Unknown User",
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
        seller: "SELLERS",
        admin: "ADMIN",
      };
      const collectionName = collectionMap[role.toLowerCase()];
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
                name: data.name || currentUser.displayName || "Unknown User",
                userEmail: data.userEmail || "",
                phoneNumber: data.phoneNumber || "",
                profileImg: data.profileImg || "",
              },
              userCustomId: data.customId || userDoc.id,
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
            className={`searchWrapper ${
              isSearch ? "" : "deActiveSearchWrapper"
            }`}
          >
            {location.pathname !== "/" ? (
              <>
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchTxt}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <img
                  onClick={() => {
                    setIsSearch((prev) => !prev);
                  }}
                  src={SearchIcon}
                  alt="Search"
                />
              </>
            ) : (
              <div>DashBoard</div>
            )}
          </div>
          <div className="topBarActionsWrapper">
            {/* <Notifications /> */}
            <div
              onClick={() =>
                setState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
              }
              className={`profile-card ${
                isSearch ? "deActiveSearchprofile-card" : ""
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
                    isSearch ? "deActiveSearchprofile-name" : "profile-name"
                  }`}
                >
                  {state.userData.name || "N/A"}
                </span>
              </div>
              <span
                className={`${
                  isSearch ? "deActiveSearchDetailArrow" : "topbarDetailArrow"
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
          <div className="searchWrapper">
            {location.pathname !== "/" ? (
              <>
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchTxt}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <img src={SearchIcon} alt="Search" />
              </>
            ) : (
              <div>DashBoard</div>
            )}
          </div>
          <div className="topBarActionsWrapper">
            {/* <Notifications /> */}
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
              sellers: "SELLERS",
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
