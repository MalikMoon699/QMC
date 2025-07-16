import {
  ChevronDown,
  ChevronUp,
  Moon,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { fetchCurrentUser } from "../utils/Helpers";
import { db } from "../utils/FirebaseConfig";
import { toast } from "react-toastify";

const Theme = ({ onclose }) => {
  const { currentUser } = useAuth();
  const [currentUserDetails, setCurrentUserDetails] = useState(null);
  const [firstcolor, setFirstcolor] = useState("black");
  const [secondcolor, setSecondcolor] = useState("#e53935");
  const [thirdcolor, setThirdcolor] = useState("white");
  const [fourthcolor, setFourthcolor] = useState("rgb(62, 200, 51)");
  const [fifthcolor, setFifthcolor] = useState("#ec5d7d12");
  const [sixthcolor, setsixthcolor] = useState("#ec5d7d");
  const [selectedTheme, setSelectedTheme] = useState("light");

  const getUserData = async () => {
    if (!currentUser) return;
    const userDoc = await fetchCurrentUser(currentUser);

    const userTheme = userDoc?.userData?.theme;

    if (userTheme) {
      setSelectedTheme(userTheme.selectedTheme || "light");
      setFirstcolor(userTheme.firstcolor || "black");
      setSecondcolor(userTheme.secondcolor || "#e53935");
      setThirdcolor(userTheme.thirdcolor || "white");
      setFourthcolor(userTheme.fourthcolor || "rgb(62, 200, 51)");
      setFifthcolor(userTheme.fifthcolor || "#ec5d7d12");
      setsixthcolor(userTheme.sixthcolor || "#ec5d7d");
    }

    setCurrentUserDetails(userDoc);
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (
      firstcolor &&
      secondcolor &&
      thirdcolor &&
      fourthcolor &&
      fifthcolor &&
      sixthcolor
    ) {
      document.documentElement.style.setProperty("--firstcolor", firstcolor);
      document.documentElement.style.setProperty("--secondcolor", secondcolor);
      document.documentElement.style.setProperty("--thirdcolor", thirdcolor);
      document.documentElement.style.setProperty("--fourthcolor", fourthcolor);
      document.documentElement.style.setProperty("--fifthcolor", fifthcolor);
      document.documentElement.style.setProperty("--sixthcolor", sixthcolor);
    }
  }, [
    firstcolor,
    secondcolor,
    thirdcolor,
    fourthcolor,
    fifthcolor,
    sixthcolor,
  ]);

  const handleThemeChange = async () => {
    if (!currentUserDetails?.collectionName || !currentUserDetails?.userId)
      return;

    let colors = {
      firstcolor,
      secondcolor,
      thirdcolor,
      fourthcolor,
      fifthcolor,
      sixthcolor,
    };

    if (selectedTheme === "light") {
      colors = {
        firstcolor: "black",
        secondcolor: "#e53935",
        thirdcolor: "white",
        fourthcolor: "rgb(62, 200, 51)",
        fifthcolor: "#ec5d7d12",
        sixthcolor: "#ec5d7d",
      };
    } else if (selectedTheme === "dark") {
      colors = {
        firstcolor: "white",
        secondcolor: "#eb3c2f",
        thirdcolor: "black",
        fourthcolor: "rgb(62, 200, 51)",
        fifthcolor: "#ec5d7d12",
        sixthcolor: "#ec5d7d",
      };
    }

    try {
      const { collectionName, userId } = currentUserDetails;
      const userRef = doc(db, collectionName, userId);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.error("User document does not exist.");
        return;
      }

      await updateDoc(userRef, {
        theme: {
          selectedTheme,
          ...colors,
        },
      });

      toast.success("Theme saved!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="sidebar-modal-container theme-modal-container"
    >
      <div className="modal-header theme-modal-header">
        <button className="back-button" onClick={onclose}>
          ❮
        </button>
        <h3 className="modal-title">Edit Theme</h3>
      </div>

      <div className="theme-modal-content sidebar-modal">
        <button
          onClick={() => setSelectedTheme("light")}
          className={`light-mode-button theme-modal-button ${
            selectedTheme === "light" ? "selected-theme-active" : ""
          }`}
        >
          <span className="light-mode-label">
            <Sun size={12} />
          </span>
          Light Mode
        </button>

        <button
          onClick={() => setSelectedTheme("dark")}
          className={`dark-mode-button theme-modal-button ${
            selectedTheme === "dark" ? "selected-theme-active" : ""
          }`}
        >
          <span className="light-mode-label">
            <Moon size={12} />
          </span>
          Dark Mode
        </button>

        <div
          style={{ flexDirection: "column", cursor: "default" }}
          className={`theme-modal-button ${
            selectedTheme === "customize" ? "selected-theme-active" : ""
          }`}
        >
          <button
            onClick={() => setSelectedTheme("customize")}
            className={`custom-mode-button ${
              selectedTheme === "customize" ? "selected-theme-active" : ""
            }`}
          >
            <div>
              <span className="light-mode-label">
                <SlidersHorizontal size={12} />
              </span>
              Custom Mode
            </div>
            <span style={{ marginBottom: "-5px" }}>
              {selectedTheme === "customize" ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronUp size={15} />
              )}
            </span>
          </button>

          {selectedTheme === "customize" && (
            <div className="color-picker-container">
              <div>
                {firstcolor} Color:
                <input
                  type="color"
                  value={firstcolor}
                  onChange={(e) => setFirstcolor(e.target.value)}
                />
              </div>
              <div>
                {secondcolor} Color:
                <input
                  type="color"
                  value={secondcolor}
                  onChange={(e) => setSecondcolor(e.target.value)}
                />
              </div>
              <div>
                {thirdcolor} Color:
                <input
                  type="color"
                  value={thirdcolor}
                  onChange={(e) => setThirdcolor(e.target.value)}
                />
              </div>
              <div>
                {fourthcolor} Color:
                <input
                  type="color"
                  value={fourthcolor}
                  onChange={(e) => setFourthcolor(e.target.value)}
                />{" "}
              </div>
              <div>
                {fifthcolor} Color:
                <input
                  type="color"
                  value={fifthcolor}
                  onChange={(e) => setFifthcolor(e.target.value)}
                />{" "}
              </div>
              <div>
                {sixthcolor} Color:
                <input
                  type="color"
                  value={sixthcolor}
                  onChange={(e) => setsixthcolor(e.target.value)}
                />{" "}
              </div>
            </div>
          )}
        </div>

        <div className="logout-btn-container">
          <button
            onClick={() => {
              setSelectedTheme("light");
              setFirstcolor("white");
              setSecondcolor("#eb3c2f");
              setThirdcolor("black");
            }}
            className="logout-cencel-btn logout-delte-btn-same"
          >
            Reset
          </button>
          <button
            onClick={handleThemeChange}
            className="logout-delte-btn logout-delte-btn-same"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Theme;
