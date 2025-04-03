import React, { useState, useEffect } from "react";
import { Table, Select, Button, notification } from "antd";
import ApiHelper from "../api/apiHelper";

const MetricsTable = () => {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("best1.pt");
  const [isEvaluating, setIsEvaluating] = useState(false); // Track if evaluation is in progress

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await ApiHelper.getMetrics();
        setMetricsData(data);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError(err.message || "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setIsEvaluating(true); // Disable dropdown and button during evaluation

    try {
      const response = await ApiHelper.evaluate(selectedModel);
      const updatedMetrics = response; // Assuming the response is in the correct format

      // Notify the user that evaluation is complete
      notification.success({
        message: `Evaluation Complete`,
        description: `Metrics for ${selectedModel} updated successfully.`,
      });

      // Fetch the updated metrics after evaluation
      await loadData();
    } catch (error) {
      console.error("Error during evaluation:", error);
      notification.error({
        message: "Evaluation Failed",
        description: "There was an error while evaluating the model.",
      });
    } finally {
      setIsEvaluating(false); // Re-enable dropdown and button after evaluation is done
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await ApiHelper.getMetrics();
      setMetricsData(data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading metrics...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!metricsData || Object.keys(metricsData).length === 0) {
    return <p>No metrics data available</p>;
  }

  try {
    const modelNames = Object.keys(metricsData);
    const metricKeys = [
      ...new Set(
        modelNames.flatMap((name) => (metricsData[name] ? Object.keys(metricsData[name]) : []))
      ),
    ];

    const columns = [
      { title: "Metric", dataIndex: "metric", key: "metric" },
      ...modelNames.map((name) => ({
        title: name,
        dataIndex: name,
        key: name,
        render: (value) => (typeof value === "number" ? value.toFixed(4) : "N/A"),
      })),
    ];

    const dataSource = metricKeys.map((metric) => ({
      key: metric,
      metric,
      ...modelNames.reduce((acc, name) => {
        acc[name] =
          metricsData[name] && metricsData[name][metric] !== undefined
            ? metricsData[name][metric]
            : "N/A";
        return acc;
      }, {}),
    }));

    return (
      <div className="p-4" style={{ marginLeft: "5%", marginRight: "5%" }}>
        <h2 className="text-xl font-bold mb-4">Model Comparison</h2>

        {/* Dropdown for Model Selection */}
        <div className="mb-4">
          <Select
            defaultValue="best1.pt"
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 150 }}
            disabled={isEvaluating} // Disable dropdown when evaluation is in progress
          >
            <Select.Option value="best1.pt">Model 1 (best1.pt)</Select.Option>
            <Select.Option value="best2.pt">Model 2 (best2.pt)</Select.Option>
          </Select>

          {/* Evaluate Button */}
          <Button
            type="primary"
            onClick={handleEvaluate}
            style={{ marginLeft: "16px" }}
            loading={isEvaluating} // Show loading state while evaluating
            disabled={isEvaluating} // Disable button during evaluation
          >
            Evaluate
          </Button>
        </div>

        {/* Metrics Table */}
        <Table dataSource={dataSource} columns={columns} pagination={false} bordered />
      </div>
    );
  } catch (err) {
    console.error("Error rendering table:", err);
    return <p className="text-red-500">Error rendering metrics table</p>;
  }
};

export default MetricsTable;
