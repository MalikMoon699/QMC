import React from "react";
import "../assets/styles/Loader.css";
import { tailChase } from "ldrs";

const Loader = ({
  loading,
  className = "loaderWrapper",
  size = "40",
  color = "#e53935",
}) => {
  tailChase.register();
  return (
    loading && (
      <div className={className}>
        <l-tail-chase size={size} speed="1.75" color={color}></l-tail-chase>
      </div>
    )
  );
};

export default Loader;
