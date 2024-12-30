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
      data: [1.0823, 1.0825, 1.0826, 1.0824, 1.0823, 1.0827],
    },
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [1.0815, 1.0822, 1.0828, 1.0824, 1.083, 1.0818, 1.0823],
    },
    "1M": {
      labels: ["1 Dec", "5 Dec", "10 Dec", "15 Dec", "20 Dec", "25 Dec"],
      data: [1.08, 1.081, 1.0815, 1.0813, 1.0818, 1.0824],
    },
    "6M": {
      labels: ["June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      data: [1.0723, 1.075, 1.0785, 1.0789, 1.0803, 1.0824],
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
      data: [
        1.072, 1.0755, 1.078, 1.079, 1.0784, 1.0803, 1.082, 1.0835, 1.085,
        1.086, 1.084, 1.0824,
      ],
    },
  };
  const [timeRange, setTimeRange] = useState("24H");
  const [toDate, setToDate] = useState("01-11-2024");
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

  const getGraphData = async () => {
    try {
      const response = await axios.post(
        "http://65.1.228.250:8080/fxd_trading/rate_feed/getRateFeed",
        {
          currencyPairs: ["EUR-USD"],
          fromDate: "01-11-2024",
          toDate: toDate,
        }
      );
      if (response.status === 200) {
        const result = response.data.result;
        setApiData(result);
        let restData = [];
        result.map(
          (val) =>
            (restData = [
              ...restData,
              val.openBid,
              val.highBid,
              val.lowBid,
              val.closeBid,
            ])
        );
        setChartOptions(restData);
        console.log(restData, "rest data");

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
    getGraphData(); // get data on component loading
  }, [toDate]);

  const handleTimeRangeChange = (range) => {
    // debugger
    setTimeRange(range);

    let date = new Date();
    date.setFullYear(2024); // Set the year
    date.setMonth(10); // Month is zero-based (0 for January, 10 for November)
    date.setDate(1); // Set the day of the month
    console.log(range, "range");

    switch (range) {
      case "24H": // Last 24 hours
        setToDate(formatDate(date)); // No change to date needed
        break;

      case "7D": // Last 7 days
        date.setDate(date.getDate() + 6); // Add 6 days
        setToDate(formatDate(date));
        break;

      case "1M": // Last 1 month
        date.setMonth(date.getMonth() + 1); // Add 1 month
        setToDate(formatDate(date));
        break;

      case "6M": // Last 6 months
        date.setMonth(date.getMonth() + 6); // Add 6 months
        setToDate(formatDate(date));
        break;

      case "1Y": // Last 1 year
        date.setFullYear(date.getFullYear() + 1); // Add 1 year
        setToDate(formatDate(date));
        break;

      default:
        break;
    }

    setChartData({
      labels: graphData[range].labels,
      datasets: [
        {
          label: "EUR-USD",
          data: chartOptions,
          borderColor: "#00ff00",
          backgroundColor: "rgba(0, 255, 0, 0.1)",
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          tension: 0.5,
        },
      ],
    });
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
