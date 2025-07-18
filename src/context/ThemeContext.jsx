import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";
import { useAuth } from "./AuthContext";

const DEFAULT_THEME = {
  selectedTheme: "light",
  firstcolor: "#000000",
  secondcolor: "#e53935",
  thirdcolor: "#ffffff",
  fourthcolor: "#3ec833",
  fifthcolor: "#ec5d7d12",
  sixthcolor: "#ec5d7d", 
  seventhcolor: "#808080", 
  loadercolor: "#e53935", 
  shadowcolor: "#00000022",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [colorsLoaded, setColorsLoaded] = useState(false);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const applyThemeToDOM = (theme) => {
    document.documentElement.style.setProperty(
      "--firstcolor",
      theme.firstcolor
    );
    document.documentElement.style.setProperty(
      "--secondcolor",
      theme.secondcolor
    );
    document.documentElement.style.setProperty(
      "--thirdcolor",
      theme.thirdcolor
    );
    document.documentElement.style.setProperty(
      "--fourthcolor",
      theme.fourthcolor
    );
    document.documentElement.style.setProperty(
      "--fifthcolor",
      theme.fifthcolor
    );
    document.documentElement.style.setProperty(
      "--sixthcolor",
      theme.sixthcolor
    );
    document.documentElement.style.setProperty(
      "--seventhcolor",
      theme.seventhcolor
    );
    document.documentElement.style.setProperty(
      "--loadercolor",
      theme.loadercolor
    );
    document.documentElement.style.setProperty(
      "--shadowcolor",
      theme.shadowcolor
    );
  };

  const loadThemeFromFirebase = async () => {
    if (!currentUser) return DEFAULT_THEME;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists() && docSnap.data().theme) {
        return docSnap.data().theme;
      }
      return DEFAULT_THEME;
    } catch (error) {
      console.error("Error loading theme:", error);
      return DEFAULT_THEME;
    }
  };

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const loadedTheme = await loadThemeFromFirebase();
        setTheme(loadedTheme);
        applyThemeToDOM(loadedTheme);
        setColorsLoaded(true);
      } catch (error) {
        console.error("Error initializing theme:", error);
        applyThemeToDOM(DEFAULT_THEME);
        setColorsLoaded(true);
      }
    };

    initializeTheme();
  }, [currentUser]);
  
  const updateTheme = async (newTheme) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { theme: newTheme });
      setTheme(newTheme);
      applyThemeToDOM(newTheme);
      return true;
    } catch (error) {
      console.error("Error updating theme:", error);
      return false;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorsLoaded,
        updateTheme,
        applyTheme: applyThemeToDOM,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
