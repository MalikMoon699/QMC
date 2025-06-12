import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";

const AppLayout = () => {
  const [searchTxt, setSearchText] = useState("");

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar searchTxt={searchTxt} setSearchText={setSearchText} />
        <Outlet context={{ searchTxt, setSearchText }} />
      </div>
    </div>
  );
};

export default AppLayout;
