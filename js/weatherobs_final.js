class WeatherStation extends React.Component {
    
    constructor(props) {
      super(props);
      this.state = {latitude: this.props.latitude,
                    longitude: this.props.longitude,
                   };
    }

    componentDidMount = () => {
        this.getCurrentObservations();
    }

    getCurrentObservations = async() => {
        const response = await fetch('http://api.openweathermap.org/data/2.5/weather?lat=' + 
        this.state.latitude + '&lon=' +
        this.state.longitude + '&appid=98cb8d2538da248784d8e1c1f9332ea9');
        const currWeather = await response.json();
        this.setState({place: currWeather.name,
                     retrieved: (new Date()).toLocaleDateString() + " at " + (new Date()).toLocaleTimeString(),
                     conditions: currWeather.weather[0].main,
                     visibility: currWeather.weather.visibility,
                     visibilityUnit: "Meters",
                     temp: Math.round(currWeather.main.temp - 273.15),
                     tempUnit: "C",
                     humidity: currWeather.main.humidity,
                     visibility: currWeather.visibility,
                     wind: currWeather.wind.speed,
                     windUnit: "Meters/sec",
                     windDirection: currWeather.wind.deg,
                     windDirectionUnit: "Degrees"
                     });
    }
    
    toggleUnits = () => {
      if (this.state.tempUnit == "F") {
          this.setState({tempUnit: "C", temp: Math.round((this.state.temp - 32) * 5/9)});
      } else {
          this.setState({tempUnit: "F", temp: Math.round((this.state.temp * 9/5) + 32)});
      }
    }

    render() {
        return (
            <div align="center" className="jumbotron">
                {this.props.listIndex > 0 ? 
                    <button className="btn btn-small" onClick={() => this.props.moveStation("up",this.props.stationId)}>
                        <span className="fa fa-arrow-up"></span></button> : null}
                <button className="close" onClick={() => this.props.removeStation(this.props.stationId)}>&times;</button>
                <h2 className="align-center">
                       {this.state.place}
                </h2> 
                <h6><i>Last updated: {this.state.retrieved}</i>&nbsp;
                  <button className="btn btn-small" onClick={this.getCurrentObservations}>
                    <span className="fa fa-retweet"></span>
                  </button>
                </h6>
                <h5>Conditions: {this.state.conditions}</h5>
                <h5>Visibility: {this.state.visibility + " " + this.state.visibilityUnit}</h5>
                <h5>Temp: {this.state.temp}&deg;&nbsp;{this.state.tempUnit}</h5>
                <h5>Humidity: {this.state.humidity}%</h5>
                <h5>Wind Speed: {this.state.wind + " " + this.state.windUnit}</h5>
                <h5>Wind Direction: {this.state.windDirection + " " + this.state.windDirectionUnit}</h5>
                
                <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id={"switch-" + this.props.stationId} 
                      onClick={this.toggleUnits} />

                <label className="custom-control-label" htmlFor={"switch-" + this.props.stationId}>&nbsp;&deg;{this.state.tempUnit}</label>
                </div>
                {this.props.listIndex < this.props.maxIndex ?
                  <button className="btn btn-small" onClick={() => this.props.moveStation("down",this.props.stationId)}>
                      <span className="fa fa-arrow-down"></span></button> : null}
         </div>
        );
    }
}
   
  //The WeatherObs web app
  class WeatherObs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {stations: [],
                      stationCount: 0};
      }

    componentDidMount = () => {
        //Initialize based on user's current location, if possible
        navigator.geolocation.getCurrentPosition(this.getLocSuccess,this.getLocError);
    }
    
     //Called when user agrees to give loc data. We set the first weather
     //station to show conditions at the user's current position.
    getLocSuccess = (position) =>  {
         this.setState({stations: [{lat: position.coords.latitude, 
                                    lon: position.coords.longitude, 
                                    stationId: this.state.stationCount+1}],
                        stationCount: this.state.stationCount + 1});
    }
  
    //Called when user refuses to give access to loc data
    //Initializes first weather station to Seattle in this case
    getLocError = (err) => {
         this.setState({stations: [{lat: 47.61, 
                                    lon: -122.33, 
                                    stationId: this.state.stationCount+1}],
                        stationCount: this.state.stationCount + 1});
    }

    //addStation -- When user clicks on "+" button to add a new weather station,
    //prompt the user for the location and attempt to add the requested station.
    addStation = async() => {
      const newStation = prompt("Enter a City, State, and Country:");
      if (newStation != null) { //Need to see if we can find the station through the API 
        const response = await fetch('http://api.openweathermap.org/data/2.5/weather?q=' + 
            newStation +  '&appid=98cb8d2538da248784d8e1c1f9332ea9');
        const stationData = await response.json();
        //See if the requested station exists
        if (stationData != null && stationData.hasOwnProperty('coord')) { 
            //Push new station into stations list
            let newStations = [...this.state.stations];
            newStations.push({lat: stationData.coord.lat, 
                              lon: stationData.coord.lon, 
                              stationId: this.state.stationCount + 1});
            this.setState({stations: newStations,
                           stationCount: this.state.stationCount + 1});
        } else { 
            alert("Sorry, that weather location could not be found.");
        }
      }
    }

    //removeStation -- Given the id of the station to remove, this method
    //iterates through the current stations array to build a new stations
    //array that does not include the station to remove. It then updates
    //state with the new stations array, forcing a re-render.
    removeStation = (stationId) => {
        let newStations = [];
        for (let i = 0; i < this.state.stations.length; ++i) {
            if (this.state.stations[i].stationId != stationId) {
                newStations.push(this.state.stations[i]);
            }
        }
        this.setState({stations: newStations});
    }

    //moveStation -- Given the direction in which to move the station and
    //the id of the station to move, re-order the stations list accordingly
    moveStation = (direction,stationId) => {
        let newStations = [...this.state.stations]; //deep copy
        for (let i = 0; i < newStations.length; ++i) {
            if (newStations[i].stationId == stationId) {
                //This is the one to move...
                newStations.splice(i,1); //splice item out of array
                if (direction == "up") { //splice in item 1 index higher
                  newStations.splice(i-1,0,this.state.stations[i]);
                } else { //splice in item 1 index lower
                    newStations.splice(i+1,0,this.state.stations[i]);
                }
                break; //Break out of loop; we're done.
            }
        }
        this.setState({stations: newStations});
    }

  
    render() {
        let rows = [];
        for (let i = 0; i < this.state.stations.length; ++i) {
            rows.push(<WeatherStation key={this.state.stations[i].stationId} 
                        latitude={this.state.stations[i].lat} 
                        longitude={this.state.stations[i].lon}
                        stationId={this.state.stations[i].stationId}
                        listIndex={i}
                        maxIndex={this.state.stations.length-1}
                        moveStation={this.moveStation}
                        removeStation={this.removeStation} />
                     );
        }
        return (
        <div id="main">
            <div id="weatherStations">
                {rows}
            </div>
            <div className="floatButton" id="floatBtnDiv">
                 <a className="float" id="addStationBtn" onClick={this.addStation}>
                    <span className="float-btn-icon fa fa-plus" id="floatBtnIcon"></span>
                </a>
            </div>  
        </div>
       );
    }
  }
  
  
  ReactDOM.render(
  <WeatherObs />,
  document.getElementById('root')
  );
  