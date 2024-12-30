import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { IoArrowUp } from "react-icons/io5";
import "../Styles/Graph.css";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

const GraphComponent = () => {
  // time ranges between graph Data keys

  const graphData = {
    "24H": {
      labels: ["6:00", "10:00", "14:00", "18:00", "22:00", "2:00"],
      data: [],
    },
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [],
    },
    "1M": {
      labels: ["1 Nov", "5 Nov", "10 Nov", "15 Nov", "20 Nov", "25 Nov"],
      data: [],
    },
    "6M": {
      labels: ["June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      data: [],
    },
    "1Y": {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: [],
    },
  };
  const [timeRange, setTimeRange] = useState("24H");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [chartData, setChartData] = useState({
    labels: graphData["24H"].labels,
    datasets: [
      {
        label: "EUR-USD",
        data: graphData["24H"].data,
        borderColor: "#00ff00",
        backgroundColor: "rgba(0, 255, 0, 0.1)",
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#fff",
        tension: 0.5,
      },
    ],
  });
  const [apiData, setApiData] = useState([]);
  const timeRanges = ["24H", "7D", "1M", "6M", "1Y"];
  const [chartOptions, setChartOptions] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Mock data based on different time ranges only for demo

  const getGraphData = async (fromDate, toDate) => {
    try {
      const response = await axios.post(
        "http://65.1.228.250:8080/fxd_trading/rate_feed/getRateFeed",
        {
          currencyPairs: ["EUR-USD"],
          fromDate,
          toDate,
        }
      );
      if (response.status === 200) {
        const result = response.data.result;
        setApiData(result);

        //  table print
        const formattedData = result.map((item) => ({
          date: item.date,
          closeBid: item.closeBid,
          closeAsk: item.closeAsk,
          rate: (item.closeBid + item.closeAsk) / 2,
        }));

        setTableData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  useEffect(() => {
    getGraphData(fromDate, toDate); // get data on component loading
  }, [fromDate, toDate]);

  const handleTimeRangeChange = (range) => {
    // debugger
    setTimeRange(range);

    let date = new Date();

    date.setFullYear(date.getFullYear()); // Set the year
    date.setMonth(date.getMonth()); // Month is zero-based (0 for January, 10 for November)
    date.setDate(date.getDate()); // Set the day of the month

    switch (range) {
      case "24H": // Last 24 hours
        const twentyFourHoursLabels = apiData.map((item) => {
          const date = new Date(item.date);
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${hours}:${minutes}`;
        });
        const twentyFourHoursData = apiData.map((item) => item.closeBid);
        setChartData({
          labels: twentyFourHoursLabels,
          datasets: [
            {
              label: "EUR-USD",
              data: twentyFourHoursData,
              borderColor: "#00ff00",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: "#fff",
              tension: 0.5,
            },
          ],
        });
        setFromDate(formatDate(date)); // No change to date needed
        break;
      case "7D": // Last 7 days
        const sevenDaysLabels = apiData.map((item) => {
          const date = new Date(item.date);
          const day = String(date.getDate()).padStart(2, "0");
          const month = date.toLocaleString("default", { month: "short" });
          return `${day} ${month}`;
        });
        const sevenDaysData = apiData.map((item) => item.closeBid);
        setChartData({
          labels: sevenDaysLabels,
          datasets: [
            {
              label: "EUR-USD",
              data: sevenDaysData,
              borderColor: "#00ff00",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: "#fff",
              tension: 0.5,
            },
          ],
        });
        date.setDate(date.getDate() - 6); // Subtract 6 days
        setFromDate(formatDate(date));
        break;
      case "1M": // Last 1 month
        const labels = apiData.map((item) => {
          const date = new Date(item.date);
          const day = String(date.getDate()).padStart(2, "0");
          const month = date.toLocaleString("default", { month: "short" });
          return `${month} ${day}`;
        });
        const data = apiData.map((item) => item.closeBid);
        setChartData({
          labels,
          datasets: [
            {
              label: "EUR-USD",
              data,
              borderColor: "#00ff00",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: "#fff",
              tension: 0.5,
            },
          ],
        });
        date.setMonth(date.getMonth() - 1); // Subtract 1 month
        setFromDate(formatDate(date));
        break;

      case "6M": // Last 6 months
        const newMonths = new Set();
        const sixMonthsLabels = apiData
          .map((item) => {
            const date = new Date(item.date);
            const month = date.toLocaleString("default", { month: "short" });
            const year = date.getFullYear();
            const monthYear = `${month} ${year}`;
            if (!newMonths.has(monthYear)) {
              newMonths.add(monthYear);
              return monthYear;
            }
            return null;
          })
          .filter((label) => label !== null);

        const sixMonthsData = apiData.map((item) => item.closeBid);
        setChartData({
          labels: sixMonthsLabels,
          datasets: [
            {
              label: "EUR-USD",
              data: sixMonthsData,
              borderColor: "#00ff00",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: "#fff",
              tension: 0.5,
            },
          ],
        });
        date.setMonth(date.getMonth() - 6); // Subtract 6 months
        setFromDate(formatDate(date));
        break;

      case "1Y": // Last 1 year
        const uniqueMonths = new Set();
        const oneYearLabels = apiData
          .map((item) => {
            const date = new Date(item.date);
            const month = date.toLocaleString("default", { month: "short" });
            const Months = `${month} `;
            if (!uniqueMonths.has(Months)) {
              uniqueMonths.add(Months);
              return Months;
            }
            return null;
          })
          .filter((label) => label !== null);

        const oneYearData = apiData.map((item) => item.closeBid);
        setChartData({
          labels: oneYearLabels,
          datasets: [
            {
              label: "EUR-USD",
              data: oneYearData,
              borderColor: "#00ff00",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: "#fff",
              tension: 0.5,
            },
          ],
        });
        date.setFullYear(date.getFullYear() - 1); // Subtract 1 year
        setFromDate(formatDate(date));
        break;

      default:
        break;
    }
  };

  // Helper function to format date as dd-mm-yyyy

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div>
      <div className="graph-body mt-5">
        <p className="text-secondary text-start fw-bold">EUR-USD</p>
        <div className="d-flex justify-content-end gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)} //change range on click button
              className={`time-range-btn ${
                timeRange === range ? "active" : ""
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <p style={{ color: "#0f0", fontSize: "24px", margin: 0 }}>
            {apiData[0]?.highBid || "N/A"} <span className="text-white">/</span>{" "}
            <span style={{ color: "#F64746" }}>
              {apiData[0]?.lowBid || "N/A"}
            </span>
          </p>
          <p style={{ color: "#0f0", fontSize: "16px", margin: 0 }}>
            <button
              className="border-0 rounded-2"
              style={{ backgroundColor: "#0B1E1E", color: "#0f0" }}
            >
              <IoArrowUp />
            </button>
            +3.4%
          </p>
        </div>

        <div style={{ height: "300px", margin: "20px 0" }}>
          {/* Chats line  */}
          <Line data={chartData} options={{ animation: { duration: 800 } }} />
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-center">
        <table className="table table-bordered table-striped w-50">
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Close Bid</th>
              <th>Close Ask</th>
              <th>Rate (CloseBid + CloseAsk) / 2</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.closeBid}</td>
                  <td>{item.closeAsk}</td>
                  <td>{(item.closeBid + item.closeAsk) / 2}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GraphComponent;
