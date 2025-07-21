import { useRef, useEffect, useState } from "react";
import { TOOLS } from "../utils/utils";
import * as fabric from "fabric"; // v6
import Pen from "/src/assets/pen.png"

const Whiteboard = ({ id, canvasData, setNewsData }) => {
  const canvasEl = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [tool, setTool] = useState("draw");
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasEl.current, {
      backgroundColor: "white",
      border: "2px solid black",
      isDrawingMode: true,
    });

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    setCanvas(fabricCanvas);

    // if a canvas already exists
    if (canvasData) {
      // i.e. not null
      fabricCanvas.loadFromJSON(canvasData).then(function () {
        fabricCanvas.renderAll();
      });
    }

    return () => {
      saveCanvasData(JSON.stringify(fabricCanvas));
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      handleTool(tool);
    }
  }, [tool]);

  const handleDelete = (obj) => {
    const selectedObject = obj.target;
    canvas.remove(selectedObject);
    canvas.renderAll();
  };

  const saveCanvasData = (fabricCanvas) => {
    fetch(`http://localhost:3000/user-news/${id}/update-canvas`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        data: fabricCanvas,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNewsData(data);
      })
      .catch((error) => {
        console.error("Error setting canvas data: ", error);
      });
  };

  const handleTool = (tool) => {
    // four main functions
    if (tool === "draw") {
      canvas.isDrawingMode = true;
      canvas.renderAll();
    } else if (tool === "textbox") {
      canvas.isDrawingMode = false;
      let textbox = new fabric.Textbox("Type here...", {
        left: 100,
        right: 100,
        width: 300,
        editable: true, // so the user can edit the input in the textbox
        fontSize: 18,
      });

      canvas.add(textbox);
      canvas.setActiveObject(textbox); // default selected immediately
      canvas.renderAll();
    } else if (tool === "highlight") {
      const obj = canvas.getActiveObject();
      if (obj && obj.isType("Textbox")) {
        // in editing mode textbox
        obj.textBackgroundColor = "#FFFF00"; // highlighter yellow
        canvas.renderAll();
      }
    } else if (tool === "delete") {
      canvas.on("mouse:down", handleDelete); // whenever you click on something it deletes
    }
  };

  const Toolbar = () => {
    // to hold buttons to all of the actions
    return (
      <div className="whiteboardTools">
        {Object.values(TOOLS).map((tool) => {
          return <button onClick={() => setTool(tool)}>{tool}</button>;
        })}
      </div>
    );
  };

  return (
    <div className="whiteboardStuff">
      <canvas width="600" height="400" ref={canvasEl} style={{cursor: `url(${Pen}), auto`}}/>
      <Toolbar />
    </div>
  );
};

export default Whiteboard;
