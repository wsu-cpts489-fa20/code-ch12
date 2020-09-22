class WeatherStation extends React.Component {
    
    constructor(props) {
      super(props);
      this.state = {temp: this.props.temp,
                    tempUnit: this.props.tempUnit
                   };
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
                <h5>Temp: {this.state.temp}&deg;&nbsp;{this.state.tempUnit}</h5>
                <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" 
                       id={"switch-" + this.props.stationIndex} onClick={this.toggleUnits} />
                       <label className="custom-control-label" 
                              htmlFor= {"switch-" + this.props.stationIndex}>&nbsp;&deg;{this.state.tempUnit}</label>
                </div>
            </div>
        );
    }
}
   
  //The WeatherObs web app
  class WeatherObs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {stations: []};
      }

    //addStation -- When user clicks on "+" button to add a new weather station,
    //prompt the user for the location and attempt to add the requested station.
    addStation = async() => {
            let newStations = this.state.stations;
            newStations.push({temp: 50, tempUnit: "F"});
            this.setState({stations: newStations});
        
    }

  
    render() {
        let rows = [];
        for (let i = 0; i < this.state.stations.length; ++i) {
            rows.push(<WeatherStation key={i} 
                        temp={this.state.stations[i].temp} 
                        tempUnit={this.state.stations[i].tempUnit} 
                        stationIndex={i}/>
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
  