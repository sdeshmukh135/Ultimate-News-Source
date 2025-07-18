import "../styles/WhiteBoard.css";
import { useState, useRef, useEffect } from "react";
import { TOOLS } from "../utils/utils";
import * as fabric from "fabric"; // v6

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [tool, setTool] = useState("draw"); // tools to use (default is the drawing option)

  const fetchPastCanvas = () => {
    // fetch previous annotations (if necessary)
  };

  // const resizeCanvas = () => {
  //   canvas.setWidth(600);
  //   canvas.setHeight(400);
  //   canvas.renderAll();
  // }

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current);
    setCanvas(fabricCanvas);

    fabricCanvas.renderAll();

    fabricCanvas.on('path:created', (e) => {
        console.log(e.path);
        e.path.set({selectable : true})
      })

    return () => {
      fabricCanvas.dispose(); // to make sure the instance finishes initializing
    }
  }, []);

  useEffect(() => {
    // actual canvas functionality
    if (canvas) {
      console.log(canvas);
      console.log("triggered");
      //there is a viable canvas available
      handleTool();
      
    }
  },[canvas, tool]);

  const handleTool = () => {
    // four main functions
    if (tool === 'draw') {
      console.log("drawing");
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      
      // to keep the drawing on the screen
      // canvas.freeDrawingBrush.onMouseUp();
    } else if (tool === 'textbox') {
      canvas.isDrawingMode = false;
      let textbox = new fabric.Textbox("Type here...", {
        left : 100,
        right : 100,
        width : 300,
        editable : true, // so the user can edit the input in the textbox
        fontSize : 18
      })

      canvas.add(textbox);
      canvas.setActiveObject(textbox); // default selected immediately
    }
  };

  const Toolbar = () => {
    // to hold buttons to all of the actions
    return (
      <div className="whiteboardTools">
        {Object.keys(TOOLS).map((tool) => {
          return <button onClick={() => setTool(tool)}>{tool}</button>;
        })}
      </div>
    );
  };

  return (
    <div className="whiteboard">
      <canvas width="600px" height="400px" ref={canvasRef}></canvas>
      <Toolbar />
    </div>
  );
};

export default Whiteboard;
