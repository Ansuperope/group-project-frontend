// src/pages/TripPage.jsx
// User selects trip type and configures trip options

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import { tripAPI, TripTypes } from "../apis/tripApi";
import Input from "../components/Input";
import "../style/trip.css";
import "/src/index.css";

const TripPage = () => {
  const navigate = useNavigate();
  const [selectedTripType, setSelectedTripType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [customStartCity, setCustomStartCity] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [customTripMode, setCustomTripMode] = useState('11cities');
  const [numberOfCities, setNumberOfCities] = useState('');

  // Load cities when component mounts
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await citiesAPI.getAllCitiesWithFood();
        console.log('Cities data loaded:', citiesData);
        
        if (citiesData && citiesData.cities) {
          setAvailableCities(citiesData.cities);
        } else if (citiesData && Array.isArray(citiesData)) {
          setAvailableCities(citiesData);
        }
      } catch (error) {
        console.error('Failed to load cities:', error);
        // Set a fallback list of cities if API fails
        setAvailableCities([
          { id: 1, name: 'Amsterdam' },
          { id: 2, name: 'Berlin' },
          { id: 3, name: 'Brussels' },
          { id: 4, name: 'Budapest' },
          { id: 5, name: 'Hamburg' },
          { id: 6, name: 'Lisbon' },
          { id: 7, name: 'London' },
          { id: 8, name: 'Madrid' },
          { id: 9, name: 'Paris' },
          { id: 10, name: 'Prague' },
          { id: 11, name: 'Rome' },
          { id: 12, name: 'Stockholm' },
          { id: 13, name: 'Vienna' }
        ]);
      }
    };

    loadCities();
  }, []);
  // END useEffect


  // Handle trip type selection
  const handleTripTypeSelect = (tripType) => {
    setSelectedTripType(tripType);
  };

  // Paris Handler
  const handleParisTour = async () => {
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planParisTour();
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.PARIS_TOUR,
          tripData: tripData,
          description: 'Paris Tour'
        } 
      });
    } catch (error) {
      console.error('Error planning Paris tour:', error);
      alert('Failed to plan Paris tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // London Handler
  const handleLondonTour = async () => {
    if (!numberOfCities || numberOfCities < 1 || numberOfCities > 11) {
      alert('Please enter a valid number of cities (1-11)');
      return;
    }
    
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planLondonTour(parseInt(numberOfCities));
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.LONDON_TOUR,
          tripData: tripData,
          numberOfCities: numberOfCities,
          description: `London Tour - Visit ${numberOfCities} cities starting from London`,
        } 
      });
    } catch (error) {
      console.error('Error planning London tour:', error);
      alert('Failed to plan London tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Berlin Handler
  const handleBerlinTour = async () => {
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planBerlinTour();
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.BERLIN_TOUR,
          tripData: tripData,
          description: 'Berlin Tour'
        } 
      });
    } catch (error) {
      console.error('Error planning Berlin tour:', error);
      alert('Failed to plan Berlin tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Handler 
  // const handleCustomTour = async () => {
  const handleCustomTour = () => {
    navigate("/create-trip");
  };


  // Allows city selection toggling for custom
  const toggleCitySelection = (city) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };


  // Get cities based on selected mode
  const getAvailableCitiesForMode = () => {
    if (customTripMode === '11cities') {
      // Exclude Vienna (id: 13) and Stockholm (id: 12)
      return availableCities.filter(city => city.id !== 12 && city.id !== 13);
    } else {
      // Include all 13 cities
      return availableCities;
    }
  };


  // Reset selections when mode changes
  const handleModeChange = (mode) => {
    setCustomTripMode(mode);
    setCustomStartCity('');
    setSelectedCities([]);
  };


  // DISPLAY 
  return (
    <div className="container">
      <div className="header">Choose Your European Vacation Plan</div>
      
      {isLoading && <div className="loading">Planning your trip...</div>}
      
      {!selectedTripType && (
        <div className="trip-options">
          <Input
            className="paris-button"
            type="button"
            value="Paris"
            onClick={() => handleTripTypeSelect(TripTypes.PARIS_TOUR)}
            disabled={isLoading}
          />
          
          <Input
            className="london-button"
            type="button"
            value="London"
            onClick={() => handleTripTypeSelect(TripTypes.LONDON_TOUR)}
            disabled={isLoading}
          />

          <Input
            className="berlin-button"
            type="button"
            value="Berlin"
            onClick={() => handleTripTypeSelect(TripTypes.BERLIN_TOUR)}
            disabled={isLoading}
          />
          
          <Input
            className="custom-button"
            type="button"
            value="Custom"
            onClick={() => handleTripTypeSelect(TripTypes.CUSTOM_TOUR)}
            disabled={isLoading}
          />
        </div>
      )}

      { /* Paris Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.PARIS_TOUR && (
        <div className="trip-config">
          <h3>Paris Tour Description</h3>
           <ul className="trip-des"style={{ lineHeight: '1.6' }}>
              <li><strong>Starting Point:</strong> Paris</li>
              <li><strong>Cities to Visit:</strong> All 11 European cities</li>
            </ul>
          <div className="button-group">
            <Input
              type="button"
              value="Start Paris Tour (All 11 Cities)"
              onClick={handleParisTour}
              disabled={isLoading}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      { /* London Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.LONDON_TOUR && (
        <div className="trip-config">
          <h3>London Tour Description</h3>
          <div className="input-group">
            <label>Number of cities to visit (including London):</label>
            <input
              type="number"
              min="1"
              max="11"
              value={numberOfCities}
              onChange={(e) => setNumberOfCities(e.target.value)}
              placeholder="Enter number (1-11)"
            />
          </div>
          <div className="button-group">
            <Input
              type="button"
              value="Start London Tour"
              onClick={handleLondonTour}
              disabled={isLoading}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}


      { /* Berlin Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.BERLIN_TOUR && (
        <div className="trip-config">
          <h3>Berlin Tour Description</h3>
          <ul className="trip-des">
              <li><strong>Starting Point:</strong> Berlin</li>
              <li><strong>Cities to Visit:</strong> All 13 European cities</li>
          </ul>
          <div className="button-group">
            <Input
              type="button"
              value="Start Berlin Tour"
              onClick={handleBerlinTour}
              disabled={isLoading}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      { /* Custom Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.CUSTOM_TOUR && (
        <div className="trip-config">
          <h3>Custom Tour Description</h3>
          
          
          <div className="button-group">
            <Input
              type="button"
              value={`Start Custom Tour`}
              onClick={() => navigate('/create-trip')}
              disabled={isLoading}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPage;