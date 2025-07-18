import React from "react";
import { useTheme } from "../context/ThemeContext";
import Loader from "./Loader";

export const ThemeLoader = ({ children, fallback }) => {
  const { colorsLoaded } = useTheme();

  const [cssVarsReady, setCssVarsReady] = React.useState(false);

  React.useEffect(() => {
    if (colorsLoaded) {
      const checkCssVars = () => {
        const style = getComputedStyle(document.documentElement);
        const primaryColor = style.getPropertyValue("--firstcolor").trim();
        setCssVarsReady(!!primaryColor);
      };
      checkCssVars();
      if (!cssVarsReady) {
        const interval = setInterval(checkCssVars, 100);
        return () => clearInterval(interval);
      }
    }
  }, [colorsLoaded]);

  if (!colorsLoaded || !cssVarsReady) {
    return (
      fallback || (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f5f5f5",
          }}
        >
          <button
            style={{ display: "flex",alignItems:"end",gap:"3px" }}
            className="logout-delte-btn logout-delte-btn-same"
          >
            Loading theme
            <span className="loader" style={{width: "12px",paddingBottom:"14px" }}></span>
          </button>
        </div>
      )
    );
  }

  return children;
};
export const withThemeLoader = (Component) => (props) =>
  (
    <ThemeLoader>
      <Component {...props} />
    </ThemeLoader>
  );
