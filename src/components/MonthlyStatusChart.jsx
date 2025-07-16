import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import Loader from "./Loader";

const COLORS = [
  "var(--fourthcolor)",
  "var(--secondcolor)",
  "var(--firstcolor)",
  "var(--fifthcolor)",
];

const CustomLabel = ({ viewBox, chartData }) => {
  const { cx = 150, cy = 150 } = viewBox || {};
  return (
    <g>
      <text
        x={cx}
        y={cy - 30}
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="middle"
        fill="var(--fourthcolor)"
        fontSize="14"
        fontWeight="600"
      >
        Events: {chartData.events}%
      </text>
      <text
        x={cx}
        y={cy - 10}
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="middle"
        fill="var(secondcolor)"
        fontSize="14"
        fontWeight="600"
      >
        Devices: {chartData.devices}%
      </text>
      <text
        x={cx}
        y={cy + 10}
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="middle"
        fill="#000000"
        fontSize="14"
        fontWeight="600"
      >
        Accessories: {chartData.accessories}%
      </text>
      <text
        x={cx}
        y={cy + 30}
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="middle"
        fill="var(--sixthcolor)"
        fontSize="14"
        fontWeight="600"
      >
        Sold Out: {chartData.soldOut}%
      </text>
    </g>
  );
};

const MonthlyStatusChart = ({
  eventsCount,
  devicesCount,
  accessoriesCount,
  soldOutCount,
  loading,
}) => {
  const total = eventsCount + devicesCount + accessoriesCount + soldOutCount;

  const chartData = useMemo(() => {
    return [
      {
        name: "Events",
        value: total > 0 ? Math.round((eventsCount / total) * 100) : 0,
        rawCount: eventsCount,
      },
      {
        name: "Smart Devices",
        value: total > 0 ? Math.round((devicesCount / total) * 100) : 0,
        rawCount: devicesCount,
      },
      {
        name: "Accessories",
        value: total > 0 ? Math.round((accessoriesCount / total) * 100) : 0,
        rawCount: accessoriesCount,
      },
      {
        name: "Sold Out",
        value: total > 0 ? Math.round((soldOutCount / total) * 100) : 0,
        rawCount: soldOutCount,
      },
    ];
  }, [eventsCount, devicesCount, accessoriesCount, soldOutCount]);

  return (
    <div className="leave-request">
      <h2 className="leave-request-header">Monthly Status</h2>
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "399px",
          }}
        >
          <Loader loading={true} />
        </div>
      ) : (
        <div
          className="monthly-chart-container"
          style={{ width: "100%", height: 420 }}
        >
          <ResponsiveContainer>
            <PieChart className="chart-circle">
              <Pie
                data={chartData}
                dataKey="value"
                cx={150}
                cy={150}
                innerRadius={70}
                outerRadius={100}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <Label
                  content={
                    <CustomLabel
                      chartData={{
                        events: chartData[0].value,
                        devices: chartData[1].value,
                        accessories: chartData[2].value,
                        soldOut: chartData[3].value,
                      }}
                    />
                  }
                  position="center"
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MonthlyStatusChart;
