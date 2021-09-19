import LocationAcquire from "./components/location-acquire";
import LocationMapShow from "./components/location-map-show";
import LocationTableList from "./components/location-table-list";

function Locations() {
  return (
    <div>
      <LocationTableList />
      <LocationAcquire />
      <LocationMapShow />
    </div>
  );
}

export default Locations;
