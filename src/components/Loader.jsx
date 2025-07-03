import React from "react";
import "../assets/styles/Loader.css";
import { tailChase } from "ldrs";

const Loader = ({ loading, className, size = "40", color = "#e53935" }) => {
  tailChase.register();
  return (
    loading && (
      <div className="loaderWrapper">
        <l-tail-chase
          className={className}
          size={size}
          speed="1.75"
          color={color}
        ></l-tail-chase>
      </div>
    )
  );
};

export default Loader;
