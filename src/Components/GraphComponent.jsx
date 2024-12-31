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

  const [timeRange, setTimeRange] = useState("");
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
  const [tableData, setTableData] = useState([]);

  const getGraphData = async (fromDate, toDate) => {   // Fetch data from API
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
    getGraphData(fromDate, toDate);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (timeRange && apiData.length > 0) {  // Format data for chart
      let labels = [];
      let data = [];

      switch (timeRange) {  // Format data based on time range
        case "24H":                     // Format data for 24 hours
          labels = apiData.map((item) => {
            const date = new Date(item.date);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
          });
          data = apiData.map((item) => item.closeBid);
          break;
        case "7D":                                  // Format data for 7 days
          labels = apiData.map((item) => {
            const date = new Date(item.date);
            const day = String(date.getDate()).padStart(2, "0");
            const month = date.toLocaleString("default", { month: "short" });
            return `${day} ${month}`;
          });
          data = apiData.map((item) => item.closeBid);
          break;
        case "1M":                                // Format data for 1 month
          labels = apiData.map((item) => {
            const date = new Date(item.date);
            const day = String(date.getDate()).padStart(2, "0");
            const month = date.toLocaleString("default", { month: "short" });
            return `${month} ${day}`;
          });
          data = apiData.map((item) => item.closeBid);
          break;
        case "6M":                                     // Format data for 6 months
          const uniqueMonths6M = new Set();
          labels = apiData
            .map((item) => {
              const date = new Date(item.date);
              const month = date.toLocaleString("default", { month: "short" });
              const year = date.getFullYear();
              const monthYear = `${month} ${year}`;
              if (!uniqueMonths6M.has(monthYear)) {
                uniqueMonths6M.add(monthYear);
                return monthYear;
              }
              return null;
            })
            .filter((label) => label !== null);
          data = apiData.map((item) => item.closeBid);
          break;
        case "1Y":                                            // Format data for 1 year
          const uniqueMonths1Y = new Set();  // Get unique months
          labels = apiData
            .map((item) => {
              const date = new Date(item.date);
              const month = date.toLocaleString("default", { month: "short" });
              const monthYear = `${month}`;
              if (!uniqueMonths1Y.has(monthYear)) {
                uniqueMonths1Y.add(monthYear);
                return monthYear;
              }
              return null;
            })
            .filter((label) => label !== null);   // Filter out null values
          data = apiData.map((item) => item.closeBid);
          break;
        default:
          break;
      }

      setChartData({                        // Set chart data
        labels,                           // Set labels based on time range
        datasets: [
          {
            label: "EUR-USD",
            data,                      // Set data based on time range
            borderColor: "#00ff00",
            backgroundColor: "rgba(0, 255, 0, 0.1)",
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: "#fff",
            tension: 0.5,
          },
        ],
      });
    }
  }, [timeRange, apiData]);           // Update chart data when time range or API data changes


  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);

    let date = new Date();
    let newFromDate;

    switch (range) {           // Set from date based on time range
      case "24H":                    // Set from date for 24 hours
        date.setDate(date.getDate() - 1);
        newFromDate = formatDate(date);
        setFromDate(newFromDate);
        break;
      case "7D":                    // Set from date for 7 days
        date.setDate(date.getDate() - 6);
        newFromDate = formatDate(date);
        setFromDate(newFromDate);
        break;
      case "1M":                         // Set from date for 1 month
        date.setMonth(date.getMonth() - 1);
        newFromDate = formatDate(date);
        setFromDate(newFromDate);
        break;
      case "6M":                         // Set from date for 6 months
        date.setMonth(date.getMonth() - 6);
        newFromDate = formatDate(date);
        setFromDate(newFromDate);
        break; 
      case "1Y":                              // Set from date for 1 year
        date.setFullYear(date.getFullYear() - 1);
        newFromDate = formatDate(date);
        setFromDate(newFromDate);
        break;
      default:
        break;
    }
  };

  const formatDate = (date) => {                                // Format date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <div className="graph-body mt-5">
        <p className="text-secondary text-start fw-bold">EUR-USD</p>
       
        <div className="d-flex justify-content-end gap-2">  {/*Time range buttons*/}
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
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
          <Line data={chartData} options={{ animation: { duration: 800 } }} />  {/* Display chart*/}
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-center">
        <table className="table table-bordered table-striped w-50">    {/* Display table*/}
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
