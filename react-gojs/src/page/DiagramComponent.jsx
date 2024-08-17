import React, { useEffect, useRef } from "react";
import * as go from "gojs";

const DiagramComponent = () => {
  const diagramRef = useRef(null);

  useEffect(() => {
    const $ = go.GraphObject.make;

    const myDiagram = $(go.Diagram, diagramRef.current, {
      "clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" },
      "commandHandler.archetypeGroupData": {
        text: "Group",
        isGroup: true,
        color: "blue",
      },
      "undoManager.isEnabled": true,
    });

    // Define the shared context menu for all Nodes, Links, and Groups.
    function makeButton(text, action, visiblePredicate) {
      return $(
        "ContextMenuButton",
        $(go.TextBlock, text),
        { click: action },
        visiblePredicate
          ? new go.Binding("visible", "", (o) =>
              o.diagram ? visiblePredicate(o) : false
            ).ofObject()
          : {}
      );
    }

    const partContextMenu = $(
      "ContextMenu",
      makeButton("Properties", (e, obj) => {
        const part = obj.part.adornedPart;
        if (part instanceof go.Link) alert(linkInfo(part.data));
        else if (part instanceof go.Group) alert(groupInfo(obj.part));
        else alert(nodeInfo(part.data));
      }),
      makeButton(
        "Cut",
        (e) => e.diagram.commandHandler.cutSelection(),
        (o) => o.diagram.commandHandler.canCutSelection()
      ),
      makeButton(
        "Copy",
        (e) => e.diagram.commandHandler.copySelection(),
        (o) => o.diagram.commandHandler.canCopySelection()
      ),
      makeButton(
        "Paste",
        (e) =>
          e.diagram.commandHandler.pasteSelection(
            e.diagram.toolManager.contextMenuTool.mouseDownPoint
          ),
        (o) =>
          o.diagram.commandHandler.canPasteSelection(
            o.diagram.toolManager.contextMenuTool.mouseDownPoint
          )
      ),
      makeButton(
        "Delete",
        (e) => e.diagram.commandHandler.deleteSelection(),
        (o) => o.diagram.commandHandler.canDeleteSelection()
      ),
      makeButton(
        "Undo",
        (e) => e.diagram.commandHandler.undo(),
        (o) => o.diagram.commandHandler.canUndo()
      ),
      makeButton(
        "Redo",
        (e) => e.diagram.commandHandler.redo(),
        (o) => o.diagram.commandHandler.canRedo()
      ),
      makeButton(
        "Group",
        (e) => e.diagram.commandHandler.groupSelection(),
        (o) => o.diagram.commandHandler.canGroupSelection()
      ),
      makeButton(
        "Ungroup",
        (e) => e.diagram.commandHandler.ungroupSelection(),
        (o) => o.diagram.commandHandler.canUngroupSelection()
      )
    );

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
          editable: true,
        },
        new go.Binding("text", "text").makeTwoWay()
      ),
      {
        toolTip: $(
          "ToolTip",
          $(go.TextBlock, { margin: 4 }, new go.Binding("text", "", nodeInfo))
        ),
      },
      { contextMenu: partContextMenu }
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
      },
      { contextMenu: partContextMenu }
    );

    function groupInfo(adornment) {
      const g = adornment.adornedPart;
      const mems = g.memberParts.count;
      let links = 0;
      g.memberParts.each((part) => {
        if (part instanceof go.Link) links++;
      });
      return `Group ${g.data.key}: ${g.data.text}\n${mems} members including ${links} links`;
    }

    myDiagram.groupTemplate = $(
      go.Group,
      "Vertical",
      { selectionObjectName: "PANEL", ungroupable: true },
      $(
        go.TextBlock,
        {
          font: "bold 19px sans-serif",
          isMultiline: false,
          editable: true,
        },
        new go.Binding("text", "text").makeTwoWay(),
        new go.Binding("stroke", "color")
      ),
      $(
        go.Panel,
        "Auto",
        { name: "PANEL" },
        $(go.Shape, "Rectangle", {
          fill: "rgba(128,128,128,0.2)",
          stroke: "gray",
          strokeWidth: 3,
          portId: "",
          cursor: "pointer",
          fromLinkable: true,
          fromLinkableSelfNode: true,
          fromLinkableDuplicates: true,
          toLinkable: true,
          toLinkableSelfNode: true,
          toLinkableDuplicates: true,
        }),
        $(go.Placeholder, { margin: 10, background: "transparent" })
      ),
      {
        toolTip: $(
          "ToolTip",
          $(
            go.TextBlock,
            { margin: 4 },
            new go.Binding("text", "", groupInfo).ofObject()
          )
        ),
      },
      { contextMenu: partContextMenu }
    );

    const nodeDataArray = [
      { key: 1, text: "Alpha", color: "lightblue" },
      { key: 2, text: "Beta", color: "orange" },
      { key: 3, text: "Gamma", color: "lightgreen" },
      { key: 4, text: "Delta", color: "pink", group: 5 },
      { key: 5, text: "Epsilon", color: "green", isGroup: true },
    ];

    const linkDataArray = [
      { from: 1, to: 2, color: "blue" },
      { from: 2, to: 2 },
      { from: 3, to: 4, color: "green" },
      { from: 3, to: 1, color: "purple" },
    ];

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    return () => (myDiagram.div = null); // Cleanup
  }, []);

  return (
    <div ref={diagramRef} style={{ width: "100%", height: "600px" }}></div>
  );
};

export default DiagramComponent;
