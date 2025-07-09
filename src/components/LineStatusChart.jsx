import React, { useMemo } from "react";
import { StyledEngineProvider } from "@mui/styled-engine"; // Add this
import { CssBaseline } from "@mui/material"; // Add this
import { LineChart } from "@mui/x-charts/LineChart";
import moment from "moment";
import "../assets/styles/Chart.css";

const LineStatusChart = ({
  eventsData,
  devicesData,
  accessoriesData,
  soldOutData,
  displayArea,
  onDisplayChange,
}) => {
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
      {" "}
      <CssBaseline />
      <div className="chart-container">
        <div className="chart-header" style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            Inventory Status (This Week)
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            {["Devices", "Events", "Accessories", "SoldOut"].map((type) => (
              <div
                key={type}
                onClick={() => onDisplayChange(type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  backgroundColor:
                    displayArea === type ? "#f5f5f5" : "transparent",
                  border: `1px solid ${getColorForType(type)}`,
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: getColorForType(type),
                  }}
                />
                <span style={{ fontSize: "14px" }}>{type}</span>
              </div>
            ))}
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
