import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../utils/FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import QMCLogo from "../assets/images/logo/QMCLogo.png";
import { toast } from "react-toastify";
import { useState } from "react";
import { Fan, LayoutDashboard, LogOut, Menu, SquareX, TabletSmartphone, Users, Watch } from "lucide-react";

const Sidebar = () => {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logout successful!", {
        autoClose: 2000,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenuOpen = () => {
    setIsOpen(true);
  };

  const toggleMenuClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="mobile-navbar">
        <div className="mobile-nav">
          <div
            onClick={() => {
              navigate("/");
            }}
            className="logo-container"
          >
            M<span>CQ</span>
          </div>
          <button className="hamburger-btn" onClick={toggleMenuOpen}>
            <Menu />
          </button>
        </div>
        {isOpen && (
          <div className="mobile-sidebar sidebar">
            <div>
              <div className="sidebar-brand-logo">
                <div style={{ margin: "0px" }} className="sidebar-brand-logo">
                  <img src={QMCLogo} alt="UnicodeTech Logo" />
                  Unicode<span>Tech</span>
                </div>
                <button className="sideBarCross">
                  <SquareX
                    size={20}
                    color="#e53935"
                    onClick={toggleMenuClose}
                  />
                </button>
              </div>
              <nav>
                <ul>
                  <li
                    className={location.pathname === "/" ? "active" : ""}
                    onClick={() => {
                      toggleMenuClose();
                      navigate("/");
                    }}
                  >
                    <span className="sidebarIcon">
                      <LayoutDashboard />
                    </span>
                    Dashboard
                  </li>
                  {role !== "user" && (
                    <li
                      className={location.pathname === "/Users" ? "active" : ""}
                      onClick={() => {
                        toggleMenuClose();
                        navigate("/Users");
                      }}
                    >
                      <span className="sidebarIcon">
                        <Users />
                      </span>
                      Users
                    </li>
                  )}
                  <li
                    className={location.pathname === "/devices" ? "active" : ""}
                    onClick={() => {
                      toggleMenuClose();
                      navigate("/devices");
                    }}
                  >
                    <span className="sidebarIcon">
                      <TabletSmartphone />
                    </span>
                    Smart Devices
                  </li>
                  <li
                    className={location.pathname === "/watches" ? "active" : ""}
                    onClick={() => {
                      toggleMenuClose();
                      navigate("/watches");
                    }}
                  >
                    <span className="sidebarIcon">
                      <Watch />
                    </span>
                    Smart Watches
                  </li>
                  <li
                    className={
                      location.pathname === "/accessories" ? "active" : ""
                    }
                    onClick={() => {
                      toggleMenuClose();
                      navigate("/accessories");
                    }}
                  >
                    <span className="sidebarIcon">
                      <Fan />
                    </span>
                    Accessories
                  </li>
                </ul>
              </nav>
            </div>
            <div className="logOut-container">
              <div className="logOut" onClick={() => setIsModalOpen(true)}>
                Logout
                <img src={LogoutIcon} alt="Logout Icon" />
              </div>
            </div>
            {isModalOpen && (
              <div
                onClick={() => setIsModalOpen(false)}
                className="modal-overlay"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="modal-content"
                  style={{ width: "26%" }}
                >
                  <div className="sidebar-modal">
                    <div className="contentWrapper">
                      <img src={AlertIcon} alt="Alert" />
                      <h3>Come Back Soon!!!</h3>
                      <p>Are you sure you want to logout</p>
                    </div>
                    <div className="attendance-delte-btn-container">
                      <button
                        className="attendance-cencel-btn attendance-delte-btn-same"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="attendance-delte-btn attendance-delte-btn-same"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {isModalOpen && (
          <div onClick={() => setIsModalOpen(false)} className="modal-overlay">
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="modal-content"
              style={{ width: "26%" }}
            >
              <div className="sidebar-modal">
                <div className="contentWrapper">
                  <img src={AlertIcon} alt="Alert" />
                  <h3>Come Back Soon!!!</h3>
                  <p>Are you sure you want to logout</p>
                </div>
                <div className="attendance-delte-btn-container">
                  <button
                    className="attendance-cencel-btn attendance-delte-btn-same"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="attendance-delte-btn attendance-delte-btn-same"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="sidebar">
        <div>
          <div className="sidebar-brand-logo">
            <img src={QMCLogo} alt="UnicodeTech Logo" />M<span>CQ</span>
          </div>
          <nav>
            <ul>
              <li
                className={location.pathname === "/" ? "active" : ""}
                onClick={() => navigate("/")}
              >
                <span className="sidebarIcon">
                  <LayoutDashboard />
                </span>
                Dashboard
              </li>
              {role !== "user" && (
                <li
                  className={location.pathname === "/Users" ? "active" : ""}
                  onClick={() => navigate("/Users")}
                >
                  <span className="sidebarIcon">
                    <Users />
                  </span>
                  Users
                </li>
              )}
              <li
                className={location.pathname === "/devices" ? "active" : ""}
                onClick={() => navigate("/devices")}
              >
                <span className="sidebarIcon">
                  <TabletSmartphone />
                </span>
                Smart Phones
              </li>
              <li
                className={location.pathname === "/watches" ? "active" : ""}
                onClick={() => navigate("/watches")}
              >
                <span className="sidebarIcon">
                  <Watch />
                </span>
                Tasks
              </li>
              <li
                className={
                  location.pathname === "/accessories" ? "active" : ""
                }
                onClick={() => navigate("/accessories")}
              >
                <span className="sidebarIcon">
                  <Fan />
                </span>
                Accessories
              </li>
            </ul>
          </nav>
        </div>
        <div className="logOut-container">
          <div className="logOut" onClick={() => setIsModalOpen(true)}>
            Logout
            <LogOut />
          </div>
        </div>
        {isModalOpen && (
          <div onClick={() => setIsModalOpen(false)} className="modal-overlay">
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="modal-content"
              style={{ width: "26%" }}
            >
              <div className="sidebar-modal">
                <div className="contentWrapper">
                  <img src={AlertIcon} alt="Alert" />
                  <h3>Come Back Soon!!!</h3>
                  <p>Are you sure you want to logout</p>
                </div>
                <div className="attendance-delte-btn-container">
                  <button
                    className="attendance-cencel-btn attendance-delte-btn-same"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="attendance-delte-btn attendance-delte-btn-same"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
