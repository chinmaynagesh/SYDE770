// src/api/apiHelper.js

const API_BASE_URL = "http://localhost:5001";

const ApiHelper = {
  upload: {
    method: "POST",
    endpoint: () => `${API_BASE_URL}/predict`,
    headers: {}, // The browser automatically sets the correct Content-Type for FormData
  },

  // New method to fetch comparison metrics
  getMetrics: async (timeRange = 24) => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/compare?time_range=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const data = await response.json();
    //   console.log(data)
      return data;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error; // Propagate error for further handling
    }
  },
  evaluate: async (model) => {
    const datasetPath = "data/eval";
    try {
      const formData = new FormData();
      formData.append("model", model);
      formData.append("dataset_path", datasetPath);
  
      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: "POST",
        body: formData, // Set the body to the FormData
      });
  
      if (!response.ok) {
        throw new Error("Failed to evaluate model");
      }
  
      const data = await response.json();
      return data; // Assuming the response is a JSON object
    } catch (error) {
      console.error("Error during evaluation:", error);
      throw error; // Propagate error for further handling
    }
  },  
};

export default ApiHelper;
