import {
  ComposableMap,
  Geographies,
  Geography,
} from "@mdworld/react-simple-maps";

const InteractiveMap = ({ setMapModalVisible }) => {
  const statesURL =
    "https://cdn.jsdelivr.net/npm/@d3ts/us-atlas@1/states-10m.json"; // TopoJSON file for US States

  const handleStateClick = (state) => {
    // open into popup modal upon clicking on a location
    setMapModalVisible(state.properties.name); // need the state
  };

  return (
    <div className="map">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
      >
        <Geographies geography={statesURL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleStateClick(geo)}
                style={{
                  default: {
                    fill: "black",
                    outline: "white",
                  },
                  hover: {
                    fill: "grey",
                    outline: "none",
                  },
                  pressed: {
                    fill: "grey",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default InteractiveMap;
