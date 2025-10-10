import React, { useMemo, useState, useRef, useEffect } from "react";
import { StyledEngineProvider } from "@mui/styled-engine";
import { CssBaseline } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import moment from "moment";
import "../assets/styles/Chart.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import Loader from "./Loader";

const LineStatusChart = ({
  eventsData,
  devicesData,
  accessoriesData,
  soldOutData,
  displayArea,
  onDisplayChange,
  loading,
}) => {
  const [isType, setIsType] = useState(false);
  const [selectedType, setSelectedType] = useState("Devices");
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsType(false);
      }
    };

    if (isType) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isType]);

  const chartData = useMemo(() => {
    const createWeeklyData = (data) => {
      const weeklyCounts = Array(7).fill(0);
      const startOfWeek = moment().startOf("week");
      const endOfWeek = moment().endOf("week");

      data.forEach((item) => {
        const createdAt = item.createdAt
          ? moment(item.createdAt.toDate?.() || item.createdAt)
          : null;
        if (
          createdAt &&
          createdAt.isBetween(startOfWeek, endOfWeek, null, "[]")
        ) {
          const weekdayIndex = createdAt.day();
          weeklyCounts[weekdayIndex]++;
        }
      });

      const adjustedCounts = [
        weeklyCounts[1],
        weeklyCounts[2],
        weeklyCounts[3],
        weeklyCounts[4],
        weeklyCounts[5],
        weeklyCounts[6],
        weeklyCounts[0],
      ];

      const totalItems = adjustedCounts.reduce((a, b) => a + b, 0);

      return weekdays.map((day, index) => ({
        name: day,
        count: adjustedCounts[index],
        percentage:
          totalItems > 0
            ? Math.round((adjustedCounts[index] / totalItems) * 100)
            : 0,
      }));
    };

    return {
      Events: createWeeklyData(eventsData || []),
      Devices: createWeeklyData(devicesData || []),
      Accessories: createWeeklyData(accessoriesData || []),
      SoldOut: createWeeklyData(soldOutData || []),
    };
  }, [eventsData, devicesData, accessoriesData, soldOutData]);

  const getColorForType = (type) => {
    switch (type) {
      case "Devices":
        return "var(--fourthcolor)";
      case "Events":
        return "var(--secondcolor)";
      case "Accessories":
        return "var(--sixthcolor)";
      case "SoldOut":
        return "var(--seventhcolor)";
      default:
        return "var(--fourthcolor)";
    }
  };

  const isAllZero = chartData[displayArea].every((item) => item.count === 0);

  const chartSx = useMemo(
    () => ({
      "--ChartsLegend-itemWidth": "100px",
      "--ChartsLegend-itemMarkSize": "6px",
      backgroundColor: "var(--thirdcolor)",
      borderRadius: "4px",
      border: "1px solid var(--firstcolor)",
      ".MuiLineElement-root": {
        strokeWidth: 3,
        stroke: getColorForType(displayArea),
      },
      ".MuiAreaElement-root": {
        fill: getColorForType(displayArea),
        fillOpacity: 0.2,
        stroke: "none",
      },
      ".MuiChartsAxis-line": {
        stroke: "var(--firstcolor)",
        strokeWidth: 1,
      },
      ".MuiChartsAxis-tick": {
        stroke: "var(--firstcolor)",
        strokeWidth: 1,
      },
      ".MuiChartsAxis-tickLabel": {
        fill: "var(--firstcolor)",
        fontSize: 12,
        fontWeight: 500,
      },
      ".MuiChartsGrid-line": {
        stroke: "var(--firstcolor)",
        strokeOpacity: 0.2,
        strokeDasharray: "3 3",
      },
      ".MuiTooltip-tooltip": {
        backgroundColor: "var(--thirdcolor)",
        color: "var(--firstcolor)",
        border: "1px solid var(--firstcolor)",
        borderRadius: "4px",
        boxShadow: "0 2px 4px var(--shadowcolor)",
      },
      ".MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
        transform: "translateY(5px)",
      },
      ".MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
        transform: "translateX(-5px)",
      },
    }),
    [displayArea]
  );

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="chart-container">
        <div className="chart-header">
          <h3 style={{ color: "var(--firstcolor)" }}>
            Inventory Status (This Week)
          </h3>
          <div className="chart-options filter-container">
            <button
              className="action-btn chart-options-btn filter-btn-container"
              onClick={() => {
                setIsType((prev) => !prev);
              }}
              style={{
                color: "var(--firstcolor)",
                border: "1px solid var(--firstcolor)",
              }}
            >
              {selectedType}
              {isType ? (
                <ChevronUp color="var(--firstcolor)" />
              ) : (
                <ChevronDown color="var(--firstcolor)" />
              )}
            </button>
            {isType && (
              <div
                className="chart-type-options"
                ref={dropdownRef}
                style={{
                  backgroundColor: "var(--thirdcolor)",
                  border: "1px solid var(--firstcolor)",
                }}
              >
                {["Devices", "Events", "Accessories", "SoldOut"].map((type) => (
                  <div
                    key={type}
                    style={{
                      color:
                        selectedType === type
                          ? getColorForType(type)
                          : "var(--firstcolor)",
                      border: `1px solid ${
                        selectedType === type
                          ? getColorForType(type)
                          : "var(--firstcolor)"
                      }`,
                    }}
                    onClick={() => {
                      setSelectedType(type);
                      onDisplayChange(type);
                      setIsType(false);
                    }}
                  >
                    <div
                      className="chart-type-icon"
                      style={{
                        opacity: selectedType === type ? "1" : "0.5",
                        backgroundColor: getColorForType(type),
                      }}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <Loader loading={true} />
        ) : (
          <div
            style={{
              height: "400px",
            }}
          >
            <LineChart
              xAxis={[
                {
                  data: weekdays,
                  scaleType: "point",
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "var(--firstcolor)",
                  },
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  max: 100,
                  tickCount: 6,
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "var(--firstcolor)",
                  },
                  valueFormatter: (value) => `${value}%`,
                },
              ]}
              series={[
                {
                  data: chartData[displayArea].map((item) => item.percentage),
                  color: getColorForType(displayArea),
                  curve: "catmullRom",
                  area: true,
                  showMark: true,
                  valueFormatter: (value, { dataIndex }) => {
                    const data = chartData[displayArea][dataIndex];
                    return `${data.count} items (${data.percentage}%)`;
                  },
                },
              ]}
              grid={{ vertical: true, horizontal: true }}
              sx={chartSx}
              slotProps={{
                legend: {
                  labelStyle: {
                    fontSize: 12,
                    fill: "var(--firstcolor)",
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </StyledEngineProvider>
  );
};

export default LineStatusChart;
