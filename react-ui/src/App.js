import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import MetricsTable from "./components/MetricsTable";
import './App.css';

function App() {
  const [selectedModel, setSelectedModel] = useState("model1");
  return (
    <div className="App">
      <MetricsTable/>
      <ImageUploader selectedModel={selectedModel} />
    </div>
  );
}

export default App;
