import { connect } from "react-redux";
import { updateList } from "../../redux/reducer";
import { useState, useRef } from "react";
import axios from "axios";
import { Button, Input, Card, Col, Row } from "antd";
import styles from "../scss/location-acquire.module.scss";
import { APIKey} from "../../config/ConfigurationData";
import { Loader } from "@googlemaps/js-api-loader";

//Loading google map using googlemaps js-api-loader
const GoogleMapAPI = new Loader({
  apiKey: APIKey,
  language: "English",
});

//Containers for instances created by google built-in constructors
let Geocoder;

function LocationAcquire(props) {
  const { Search } = Input;
  const [userLocation, setUserLocation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [localTime, setLocalTime] = useState("");
  const searchRef = useRef(null);

  function getLocation() {
    setErrorMessage("");

    if (navigator.geolocation) {
      //Get user location from browser
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      setErrorMessage("Geolocation is not supported by this browser.");
    }

    //clear input content after searching
    searchRef.current.setState({ value: "" });
  }


  function showPosition(position) {

    //Requesting data from google map api
    GoogleMapAPI.load().then(() => {

    Geocoder = new window.google.maps.Geocoder();

      //Get latitude and longitude
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const latlng = { lat, lng };
    console.log("Latitude: " + lat + " Longitude: " + lng);

    Geocoder.geocode(
      { 
        location: latlng 
      },(results, status) => {
        
        if (status === "OK") {
          //Get address from latitude and longitude
          console.log(results)
          console.log(status)
          const address = results[0].formatted_address;
          const curLength = props.list.length;
          const key = curLength !== 0 ? props.list[curLength - 1].key + 1 : 1;

          const userLocationObj = { key, address, lat, lng };

          console.log(userLocationObj)
          // save in redux store
          props.updateList([userLocationObj, ...props.list]); //latest is first
          setUserLocation(address);

          //Get time zone and local time from latitude and longitude
          getTimeZoneLocalTime(lat, lng);
        } else {
          setErrorMessage("No results found");
        }
      })


    });

    
  }

  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setErrorMessage("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        setErrorMessage("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        setErrorMessage("The request to get user location timed out.");
        break;
      default:
        setErrorMessage("An unknown error occurred.");
        break;
    }
  }

  async function getTimeZoneLocalTime(lat, lng) {
    try {
      const resData = await axios({
        url:
          "http://api.timezonedb.com/v2.1/get-time-zone?key=SQL380MLF2C9&format=json&by=position&lat=" +
          lat +
          "&lng=" +
          lng,
        method: "GET",
      });
      console.log("getTimeZoneLocalTime Get resData: ", resData);

      setTimeZone(resData?.data?.zoneName);
      setLocalTime(resData?.data?.formatted);
    } catch (er) {
      setErrorMessage(
        "Error occurred to get time zone and local time from http://api.timezonedb.com/v2.1/get-time-zone"
      );
    }
  }

  const onSearch = (value) => {
    setErrorMessage("");

    if (value === "") {
      console.log("onSearch: ", value);
      setErrorMessage("Please input location name.");
      return;
    }

    //Requesting data from google map api
    GoogleMapAPI.load().then(() => {

    Geocoder = new window.google.maps.Geocoder();

      //Get latitude and longitude from address
    Geocoder.geocode({ address: value }
    ,(results, status) => {
      console.log(results)
      console.log(status)
    
      if (status === "OK") {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        const address = results[0].formatted_address;
  
        const curLength = props.list.length;
        const key = curLength !== 0 ? props.list[curLength - 1].key + 1 : 1;
        const userLocationObj = { key, address, lat, lng };

        console.log(userLocationObj)
        // save in redux store
        props.updateList([userLocationObj, ...props.list]); //latest is first
        setUserLocation(value); //address
  
        //Get time zone and local time from latitude and longitude
        getTimeZoneLocalTime(lat, lng);
  
        //clear input content after searching
        searchRef.current.setState({ value: "" });
      } else {
        searchRef.current.setState({ value: "" });
        alert(
          "Error happened! Please check it."
        );
      }

    })

    });

    
  };

  return (
    <div className={styles["location-acquire-container"]}>
      <div className="location-acquire">

        <div className="location-acquire-btn">
          <Button type="info" size="large" block onClick={getLocation}>
            Get Your Current Location
          </Button>
        </div>

        <div className="location-acquire-result">
          <Row gutter={12}>
            <Col span={8}>
              <Card title="Location" bordered={false}>
                {userLocation}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Time Zone" bordered={false}>
                {timeZone}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Local Time" bordered={false}>
                {localTime}
              </Card>
            </Col>
          </Row>
        </div>

        <div className="location-acquire-input">
          <Search
            ref={searchRef}
            placeholder="Please input location name"
            enterButton="Search"
            size="large"
            onSearch={onSearch}
          />
          {errorMessage && (
            <div className="location-acquire-input-error">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default connect(
  (state) => {
    const { list } = state;
    return { list };
  },
  { updateList }
)(LocationAcquire);
