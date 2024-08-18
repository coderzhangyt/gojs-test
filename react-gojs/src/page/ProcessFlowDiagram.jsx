import React, { useEffect, useRef, useState } from "react";
import * as go from "gojs";

const ProcessFlowDiagram = () => {
  const diagramRef = useRef(null);
  const diagramInstanceRef = useRef(null); // 保存 Diagram 实例
  const [diagramData, setDiagramData] = useState(null);

  // 模拟数据请求
  useEffect(() => {
    // 模拟异步获取数据
    const fetchData = async () => {
      const data = {
        class: "go.GraphLinksModel",
        nodeDataArray: [
          { key: "P1", category: "Process", pos: "150 120", text: "Process" },
          { key: "P2", category: "Process", pos: "330 320", text: "Tank" },
          { key: "V1", category: "Valve", pos: "270 120", text: "V1" },
          { key: "P3", category: "Process", pos: "150 420", text: "Pump" },
          {
            key: "V2",
            category: "Valve",
            pos: "150 280",
            text: "VM",
            angle: 270,
          },
          {
            key: "V3",
            category: "Valve",
            pos: "270 420",
            text: "V2",
            angle: 180,
          },
          {
            key: "P4",
            category: "Process",
            pos: "450 140",
            text: "Reserve Tank",
          },
          { key: "V4", category: "Valve", pos: "390 60", text: "VA" },
          {
            key: "V5",
            category: "Valve",
            pos: "450 260",
            text: "VB",
            angle: 90,
          },
        ],
        linkDataArray: [
          { from: "P1", to: "V1" },
          { from: "P3", to: "V2" },
          { from: "V2", to: "P1" },
          { from: "P2", to: "V3" },
          { from: "V3", to: "P3" },
          { from: "V1", to: "V4" },
          { from: "V4", to: "P4" },
          { from: "V1", to: "P2" },
          { from: "P4", to: "V5" },
          { from: "V5", to: "P2" },
        ],
      };

      setDiagramData(data);
    };

    fetchData();
  }, []);

  // 初始化 Diagram
  useEffect(() => {
    if (!diagramData || diagramInstanceRef.current) return; // 如果没有数据或已经有 Diagram 实例，则直接返回

    const $ = go.GraphObject.make;
    const myDiagram = $(go.Diagram, diagramRef.current, {
      "grid.visible": true,
      "grid.gridCellSize": new go.Size(30, 20),
      "draggingTool.isGridSnapEnabled": true,
      "resizingTool.isGridSnapEnabled": true,
      "rotatingTool.snapAngleMultiple": 90,
      "rotatingTool.snapAngleEpsilon": 45,
      "undoManager.isEnabled": true,
    });

    diagramInstanceRef.current = myDiagram; // 保存 Diagram 实例

    // 添加监听器以检测修改
    myDiagram.addDiagramListener("Modified", (e) => {
      const idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    // 定义节点和链接模板
    myDiagram.nodeTemplateMap.add(
      "Process",
      $(
        go.Node,
        "Auto",
        {
          locationSpot: new go.Spot(0.5, 0.5),
          locationObjectName: "SHAPE",
          resizable: true,
          resizeObjectName: "SHAPE",
        },
        new go.Binding("location", "pos", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        $(
          go.Shape,
          "RoundedRectangle",
          {
            name: "SHAPE",
            strokeWidth: 2,
            fill: $(go.Brush, "Linear", {
              start: go.Spot.Left,
              end: go.Spot.Right,
              0: "gray",
              0.5: "white",
              1: "gray",
            }),
            minSize: new go.Size(50, 50),
            portId: "",
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            fromLinkable: true,
            fromLinkableSelfNode: true,
            fromLinkableDuplicates: true,
            toLinkable: true,
            toLinkableSelfNode: true,
            toLinkableDuplicates: true,
          },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
            go.Size.stringify
          )
        ),
        $(
          go.TextBlock,
          {
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 5,
            editable: true,
          },
          new go.Binding("text").makeTwoWay()
        )
      )
    );

    myDiagram.nodeTemplateMap.add(
      "Valve",
      $(
        go.Node,
        "Vertical",
        {
          locationSpot: new go.Spot(0.5, 1, 0, -21),
          locationObjectName: "SHAPE",
          selectionObjectName: "SHAPE",
          rotatable: true,
        },
        new go.Binding("angle").makeTwoWay(),
        new go.Binding("location", "pos", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        $(
          go.TextBlock,
          {
            alignment: go.Spot.Center,
            textAlign: "center",
            margin: 5,
            editable: true,
          },
          new go.Binding("text").makeTwoWay(),
          new go.Binding("angle", "angle", (a) =>
            a === 180 ? 180 : 0
          ).ofObject()
        ),
        $(go.Shape, {
          name: "SHAPE",
          geometryString:
            "F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30",
          strokeWidth: 2,
          fill: $(go.Brush, "Linear", {
            0: "gray",
            0.35: "white",
            0.7: "gray",
          }),
          portId: "",
          fromSpot: new go.Spot(1, 0.35),
          toSpot: new go.Spot(0, 0.35),
        })
      )
    );

    myDiagram.linkTemplate = $(
      go.Link, // 使用 go.Link 组件定义连接线
      {
        routing: go.Link.AvoidsNodes, // 路由类型为 AvoidsNodes，表示连接线会避开节点
        curve: go.Link.JumpGap, // 连接线的曲线类型为 JumpGap，表示连接线会在需要时跳过节点
        corner: 10, // 连接线的角落半径，影响弯角的圆润度
        reshapable: true, // 允许连接线的形状被调整
        toShortLength: 7, // 连接线在连接到目标时的最小长度
      },
      new go.Binding("points").makeTwoWay(), // 双向绑定连接线的“points”属性，允许动态更新连接线的点
      $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 2 }), // 连接线的主形状，黑色，宽度为 7
      // $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 5 }), // 连接线的次要形状，灰色，宽度为 5
      //   $(go.Shape, {
      //     // 连接线的装饰形状，具有虚线效果
      //     isPanelMain: true, // 该形状作为连接线的主要面板的一部分
      //     stroke: "white", // 颜色为白色
      //     strokeWidth: 3, // 宽度为 3
      //     name: "PIPE", // 给形状一个名称，以便在动画等其他操作中引用
      //     strokeDashArray: [10, 10], // 虚线样式，长短交替
      //   }),
      $(go.Shape, {
        // 连接线的箭头
        toArrow: "Triangle", // 使用三角形作为箭头
        scale: 1.3, // 箭头的缩放因子
        fill: "gray", // 箭头填充颜色为灰色
        stroke: null, // 箭头不绘制边框
      })
    );
    // 加载数据
    myDiagram.model = go.Model.fromJson(diagramData);

    // 动画效果
    const animation = new go.Animation();
    animation.easing = go.Animation.EaseLinear;
    myDiagram.links.each((link) => {
      animation.add(link.findObject("PIPE"), "strokeDashOffset", 20, 0);
    });
    animation.runCount = Infinity;
    animation.start();

    return () => {
      myDiagram.clear();
      diagramInstanceRef.current = null; // 清理时清空引用
    };
  }, [diagramData]);
  // 保存功能
  const handleSave = () => {
    if (diagramInstanceRef.current) {
      const savedData = diagramInstanceRef.current.model.toJson();
      console.log("保存的模型数据:", savedData);
      // 这里可以进一步处理保存的 JSON 数据，如上传到服务器等
    }
  };

  return (
    <div>
      <button onClick={handleSave}>保存</button>
      <div
        id="myDiagramDiv"
        ref={diagramRef}
        style={{ width: "100%", height: "600px", border: "1px solid black" }}
      ></div>
    </div>
  );
};

export default ProcessFlowDiagram;
