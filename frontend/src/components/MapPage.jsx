import InteractiveMap from "./InteractiveMap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MapModal from "./MapModal.jsx";
import { REGIONS } from "../utils/utils.js";

const MapPage = () => {
  const navigate = useNavigate();
  const [mapModalVisible, setMapModalVisible] = useState(""); // holds information about placed clicked to open into modal
  const [mapModalData, setMapModalData] = useState(null);

  const backToHome = () => {
    navigate("/news");
  };

  useEffect(() => {
    fetchRegionData();
  }, [mapModalVisible]);

  const fetchRegionData = () => {
    const region = getRegion();
    // fetch region-specific data from the cache
    fetch(`http://localhost:3000/news/${region}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON data from the response
      })
      .then((data) => {
        setMapModalData(data);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
      });
  };

  const getRegion = () => {
    const regions = Object.keys(REGIONS);
    for (const region of regions) {
      if (REGIONS[region].includes(mapModalVisible)) {
        return region.toLowerCase();
      }
    }

    return null; // if no region was found (should not happen)
  };

  return (
    <div className="map-elements">
      <button className="button-to-map" onClick={backToHome}>
        Back to Home
      </button>
      <h1>Click on a State to Learn About Articles in the Region!</h1>
      <InteractiveMap setMapModalVisible={setMapModalVisible} />
      {mapModalVisible && (
        <MapModal
          regionData={mapModalData}
          mapModalVisible={mapModalVisible}
          setMapModalVisible={setMapModalVisible}
        />
      )}
    </div>
  );
};

export default MapPage;
