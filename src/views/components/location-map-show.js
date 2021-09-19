import { connect } from "react-redux";
import { React, useEffect} from "react";
import style from "../scss/location-map-show.module.scss";
import { APIKey, initialLocation } from "../../config/ConfigurationData";
import { Loader } from "@googlemaps/js-api-loader";

//Loading google map using googlemaps js-api-loader
const GoogleMapAPI = new Loader({
  apiKey: APIKey,
  language: "English",
});

//Containers for instances created by google built-in constructors
let GoogleMap, Marker, MyInfoWindow;

function LocationMapShow(props) {
  // const mapRef = useRef(null);

  useEffect(() => {

    //Requesting data from google map api
    GoogleMapAPI.load().then(() => {

      //Initialize the map with arguments
      GoogleMap = new window.google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 15,
      });

      if (props.list.length > 0) {
        console.log(props.list)
        props.list.map((userLocationObj, index) => {
          console.log(userLocationObj)
          const location = { lat: userLocationObj.lat, lng: userLocationObj.lng };
  
          if (index === 0) {
            //Center map on latest user location
            GoogleMap.setCenter(location);
          }

          Marker = new window.google.maps.Marker({
            position: location,
            map: GoogleMap,
          });

          MyInfoWindow = new window.google.maps.InfoWindow({
            content: userLocationObj.address,
          });

          MyInfoWindow.open(GoogleMap, Marker);
  
          return new window.google.maps.Marker({
            position: location,
            map: GoogleMap,
          });
        });
      }

    });

    
  }, [props.list]);

  return (
    <div className={style["location-map-container"]}>
      <div id="map" className={style["location-map"]}></div>
    </div>
  );
}

export default connect((state) => {
  const { list } = state;
  return { list };
})(LocationMapShow);
