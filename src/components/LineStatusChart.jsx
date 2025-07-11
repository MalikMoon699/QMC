import React, { useMemo, useState } from "react";
import { StyledEngineProvider } from "@mui/styled-engine";
import { CssBaseline } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import moment from "moment";
import "../assets/styles/Chart.css";
import { ChevronDown, ChevronUp } from "lucide-react";

const LineStatusChart = ({
  eventsData,
  devicesData,
  accessoriesData,
  soldOutData,
  displayArea,
  onDisplayChange,
}) => {
  const [isType, setIsType] = useState(false);
  const [selectedType, setSelectedType] = useState("Devices");
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
        return "#3EC833";
      case "Events":
        return "#EE3F24";
      case "Accessories":
        return "#ec5d7d";
      case "SoldOut":
        return "gray";
      default:
        return "#3EC833";
    }
  };
  const isAllZero = chartData[displayArea].every((item) => item.count === 0);

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <div className="chart-container">
        <div className="chart-header">
          <h3>Inventory Status (This Week)</h3>
          <div className="chart-options filter-container">
            <button
              className="action-btn chart-options-btn filter-btn-container"
              onClick={() => {
                setIsType((prev) => !prev);
              }}
            >
              {selectedType}
              {isType ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isType && (
              <div className="chart-type-options">
                {["Devices", "Events", "Accessories", "SoldOut"].map((type) => (
                  <div
                    key={type}
                    style={{
                      color:
                        selectedType === type
                          ? getColorForType(type)
                          : "black",
                      border: `1px solid
                        ${
                          selectedType === type
                            ? getColorForType(type)
                            : "rgb(245, 245, 245)"
                        }`,
                    }}
                    onClick={() => {
                      setSelectedType(type);
                      onDisplayChange(type);
                    }}
                  >
                    <div
                      style={{
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

        {isAllZero ? (
          <div
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ color: "#666", fontSize: "16px" }}>
              No {displayArea.toLowerCase()} added this week.
            </p>
          </div>
        ) : (
          <div style={{ height: "400px" }}>
            <LineChart
              xAxis={[
                {
                  data: weekdays,
                  scaleType: "point",
                  tickLabelStyle: { fontSize: 12 },
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  max: Math.max(
                    5,
                    ...chartData[displayArea].map((item) => item.count)
                  ),
                  valueFormatter: (value) => `${value}`,
                  tickLabelStyle: { fontSize: 12 },
                },
              ]}
              series={[
                {
                  data: chartData[displayArea].map((item) => item.count),
                  label: displayArea,
                  color: getColorForType(displayArea),
                  curve: "catmullRom",
                  area: true,
                  showMark: ({ index }) => index % 1 === 0,
                  valueFormatter: (value, { dataIndex }) => {
                    const data = chartData[displayArea][dataIndex];
                    return `${value} items (${data.percentage}%)`;
                  },
                },
              ]}
              grid={{ vertical: true, horizontal: true }}
              sx={{
                ".MuiLineElement-root": { strokeWidth: 2 },
                ".MuiMarkElement-root": {
                  scale: "1",
                  fill: "#fff",
                  strokeWidth: 2,
                  stroke: getColorForType(displayArea),
                },
                ".MuiAreaElement-root": { fillOpacity: 0.1 },
              }}
            />
          </div>
        )}
      </div>
    </StyledEngineProvider>
  );
};

export default LineStatusChart;
