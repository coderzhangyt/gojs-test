import React, { useEffect, useRef } from "react";
import * as go from "gojs";

const ModDiagram = ({ diagramRef }) => {
  useEffect(() => {
    const $ = go.GraphObject.make;

    const myDiagram = $(go.Diagram, "myDiagramDiv", {
      "clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" }, //双击图表空白区域后生成一个新节点
      "undoManager.isEnabled": true, //启用或禁用撤销和重做功能
    });

    function nodeInfo(d) {
      return (
        `Node ${d.key}: ${d.text}\n` +
        (d.group ? `member of ${d.group}` : "top-level node")
      );
    }

    myDiagram.nodeTemplate = $(
      go.Node,
      "Auto",
      { locationSpot: go.Spot.Center },
      $(
        go.Shape,
        "RoundedRectangle",
        {
          fill: "white",
          portId: "",
          cursor: "pointer",
          fromLinkable: true,
          fromLinkableSelfNode: true,
          fromLinkableDuplicates: true,
          toLinkable: true,
          toLinkableSelfNode: true,
          toLinkableDuplicates: true,
        },
        new go.Binding("fill", "color")
      ),
      $(
        go.TextBlock,
        {
          font: "bold 14px sans-serif",
          stroke: "#333",
          margin: 6,
          isMultiline: false,
          //   editable: true,
        },
        new go.Binding("text", "text").makeTwoWay()
      ),
      {
        toolTip: $(
          "ToolTip",
          $(go.TextBlock, { margin: 4 }, new go.Binding("text", "", nodeInfo))
        ),
      }
    );

    function linkInfo(d) {
      return `Link:\nfrom ${d.from} to ${d.to}`;
    }

    myDiagram.linkTemplate = $(
      go.Link,
      { toShortLength: 3, relinkableFrom: true, relinkableTo: true },
      $(go.Shape, { strokeWidth: 2 }, new go.Binding("stroke", "color")),
      $(
        go.Shape,
        { toArrow: "Standard", stroke: null },
        new go.Binding("fill", "color")
      ),
      {
        toolTip: $(
          "ToolTip",
          $(go.TextBlock, { margin: 4 }, new go.Binding("text", "", linkInfo))
        ),
      }
    );

    const nodeDataArray = [
      { key: 1, text: "Alpha", color: "lightblue" },
      { key: 2, text: "Beta", color: "orange" },
      { key: 3, text: "Gamma", color: "lightgreen" },
      { key: 4, text: "Delta", color: "pink" },
      { key: 5, text: "Epsilon", color: "green" },
    ];

    const linkDataArray = [
      //   { from: 1, to: 2, color: "blue" },
      //   { from: 2, to: 2 },
      //   { from: 3, to: 4, color: "green" },
      //   { from: 3, to: 1, color: "purple" },
    ];

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    if (diagramRef) {
      diagramRef.current = myDiagram;
    }

    return () => (myDiagram.div = null); // Cleanup
  }, [diagramRef]);

  return (
    <div id="myDiagramDiv" style={{ width: "100%", height: "600px" }}></div>
  );
};

export default ModDiagram;
