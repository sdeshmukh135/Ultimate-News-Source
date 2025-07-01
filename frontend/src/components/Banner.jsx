import FilterDropDown from "../components/FilterDropDown.jsx";
import "../styles/Banner.css";

const Banner = ({ setFilterOption }) => {
  // ONLY visible to those logged in

  return (
    <div className="banner">
      <h2>News for You</h2>
      <FilterDropDown setFilterOption={setFilterOption} />
    </div>
  );
};

export default Banner;
