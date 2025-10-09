import React from "react";
import "../assets/styles/Loader.css";
import { tailChase } from "ldrs";
import { dotWave } from "ldrs";

const Loader = ({
  loading,
  className = "loaderWrapper",
  size = "40",
  speed = "1.75",
  color = "var(--loadercolor)",
  style,
}) => {
  tailChase.register();
  dotWave.register();
  return (
    <div style={style} className={className}>
      {loading ? (
        <l-tail-chase size={size} speed={speed} color={color} />
      ) : (
        <l-dot-wave size={size} speed={speed} color={color} />
      )}
    </div>
  );
};

export default Loader;
