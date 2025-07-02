import '../styles/WhiteBoard.css'
import {useState, useRef, useEffect} from 'react'
import * as fabric from 'fabric'; // v6


const Whiteboard = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasRef.current);
        setCanvas(fabricCanvas);

        fabricCanvas.dispose(); // to make sure the instance finishes initializing
    }, [])

    return (
        <div className="whiteboard">
            <canvas width="600px" height="400px" ref={canvasRef}></canvas>
        </div>
    )
}

export default Whiteboard