import { useRef } from "react";
import "./App.css";
import DiagramComponent from "./page/DiagramComponent";
import ModDiagram from "./page/ModDiagram";

function App() {
  const diagramRef = useRef(null);
  const handleGetDiagramData = () => {
    if (diagramRef.current) {
      const diagramData = diagramRef.current.model.toJson();
      console.log("Diagram Data:", diagramData);
    }
  };
  return (
    <div className="App">
      <div style={{ flex: 1 }}>
        <DiagramComponent />
      </div>
      <div style={{ flex: 1 }}>
        <ModDiagram diagramRef={diagramRef} />
      </div>
      <button onClick={handleGetDiagramData}>Get Diagram Data</button>
    </div>
  );
}

export default App;
