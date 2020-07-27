import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import InfoBox  from './InfoBox.js';
import Map from './Map.js'
import Table from './Table';
import './Table.css';
import './App.css';
import { sortData, prettyPrinStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide'); 
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);

  // STATE = How to write a variable in REACT 
  // USEEFFECT = runs a piece of code based on a give n condition
  useEffect(() => {
      // the code inside here will run once when the component loads and not again
      // async -> send a request, wait for it, do something with info
      const getCountriesData = async () => {
        await fetch ("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, // United States, United Kingdom
            value: country.countryInfo.iso2 ,// UK, USA, FR

          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
      };
      getCountriesData();
      
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === "worldwide"
     ? "https://disease.sh/v3/covid-19/all"
     : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
  //https://disease.sh/v3/covid-19/countries/[Country]
    //https://disease.sh/v3/covid-19/countries/[Country]
    await fetch(url)
      .then(response => response.json())
      .then((data) => {

        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
        //all of the data from the country response
        
      });

  };

  return (
    <div className="app">
      <div className="app_left">

        <div className="app_header">

          <h1>COVID-19 TRACKER</h1>

          <FormControl className="app_dropdown">

            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Loop throught all the countries and show a drop down list of all the countries */}
              {countries.map((country)=> (<MenuItem value={country.value}>{country.name}</MenuItem>))}
            </Select>

          </FormControl>

        </div>


        <div className="app_stats">

        <InfoBox isRed active={casesType=== "cases"} onClick={(e) => setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrinStat(countryInfo.todayCases)} total={prettyPrinStat(countryInfo.cases)}/>
        <InfoBox active={casesType=== "recovered"} onClick={(e) => setCasesType('recovered')}  title="Recovered" cases={prettyPrinStat(countryInfo.todayRecovered)} total={prettyPrinStat(countryInfo.recovered)} />
        <InfoBox isRed active={casesType=== "deaths"} onClick={(e) => setCasesType('deaths')} title="Deaths"  cases={prettyPrinStat(countryInfo.todayDeaths)} total={prettyPrinStat(countryInfo.deaths)}/>
        </div>

        

        {/* Map */}
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>

      </div>
      <Card className="app_right">

          
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3 className="app_graphTitle"> WorldWide new {casesType}</h3>
          </CardContent>
          <LineGraph className="app_graph" casesType={casesType} />

        </Card>

      </div>
      
        
  );
}

export default App;
