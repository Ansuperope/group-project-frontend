import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { citiesAPI } from "../apis/cityApis";
import { tripAPI, TripTypes } from "../apis/tripApi";
import Input from "../components/Input";
import '../style/createTrip.css';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for managing cities and trip mode
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedStartingCity, setSelectedStartingCity] = useState('');
  const [tripMode, setTripMode] = useState('11cities'); // '11cities' or '13cities'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cities from API on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all cities from API
        const data = await citiesAPI.getAllCitiesWithFood();
        
        // Handle the response format (array or wrapped object)
        let cities = [];
        if (Array.isArray(data)) {
          cities = data;
        } else if (data && data.cities) {
          cities = data.cities;
        }
        
        console.log('Loaded cities from API:', cities);
        setAvailableCities(cities);
        
      } catch (error) {
        console.error('Failed to load cities:', error);
        setError('Cannot connect to API. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // Get available cities based on selected mode and filter out selected ones
  const getAvailableCities = () => {
    let filteredCities = availableCities;
    
    // Filter based on trip mode (11 cities excludes Vienna and Stockholm)
    if (tripMode === '11cities') {
      // Exclude Vienna (id: 12) and Stockholm (id: 13) - adjust based on your actual city IDs
      filteredCities = availableCities.filter(city => 
        !['Vienna', 'Stockholm'].includes(city.name)
      );
    }
    
    // Remove already selected cities
    return filteredCities.filter(city => 
      !selectedCities.find(selected => selected.id === city.id)
    );
  };

  // Add city to selected list
  const addCityToSelected = (city) => {
    setSelectedCities(prev => [...prev, city]);
  };

  // Remove city from selected list
  const removeCityFromSelected = (city) => {
    setSelectedCities(prev => prev.filter(c => c.id !== city.id));
    // If removing the starting city, clear the starting city selection
    if (selectedStartingCity === city.name) {
      setSelectedStartingCity('');
    }
  };

  // Handle mode change (clear selections when switching)
  const handleModeChange = (mode) => {
    setTripMode(mode);
    setSelectedCities([]);
    setSelectedStartingCity('');
  };

  // Save and submit the trip
  const saveListAndSubmit = async () => {
    if (selectedCities.length === 0) {
      alert('Please select at least one city before submitting!');
      return;
    }
    
    if (!selectedStartingCity) {
      alert('Please select a starting city from the dropdown!');
      return;
    }

    setLoading(true);
    try {
      // Get city names array for the API call
      const selectedCityNames = selectedCities.map(city => city.name);

      console.log('Calling backend API with:', {
        startingCity: selectedStartingCity,
        selectedCities: selectedCityNames
      });

      // Call the backend API to plan the custom tour
      const tripData = await tripAPI.planCustomTour(selectedStartingCity, selectedCityNames);

      console.log('Received trip data from backend:', tripData);

      // Overwrite tripData.cities with array of city names so SummaryPage shows your selection
      if (tripData) {
        tripData.cities = selectedCityNames;
      }

      // Navigate to SummaryPage with the backend response
      navigate('/summary', { 
        state: { 
          tripType: TripTypes.CUSTOM_TOUR,
          tripData: tripData,
          totalDistance: tripData?.totalDistance || tripData?.distance,
          selectedFoodItems: tripData?.selectedFoodItems || [],
          totalFoodCost: tripData?.totalFoodCost || 0,
          startingCity: selectedStartingCity,
          description: `Custom Tour - Starting from ${selectedStartingCity}, visiting ${selectedCities.length} cities`
        } 
      });
      
    } catch (error) {
      console.error('Error planning custom tour:', error);
      alert('Failed to plan custom tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // LOADING SERVER STATES
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Loading cities...
      </div>
    );
  }

  // ERROR MESSAGE
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  // DISPLAY
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* LEFT SIDE - LIST OF CITIES */}
      <div id="leftBG">
        <div className="create-header">List of Cities</div>
        
        {/* City Mode Selection */}
        <div style={{ padding: '10px', marginBottom: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#725245' }}>Choose City Set:</label>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleModeChange('11cities')}
              style={{
                padding: '8px 16px',
                backgroundColor: tripMode === '11cities' ? '#9c7e70' : '#c3b1a5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              11 Cities
            </button>
            <button 
              onClick={() => handleModeChange('13cities')}
              style={{
                padding: '8px 16px',
                backgroundColor: tripMode === '13cities' ? '#9c7e70' : '#c3b1a5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              13 Cities
            </button>
          </div>
        </div>
        
        <div className="cities-list">
          {getAvailableCities().map(city => (
            <div key={city.id} className="city-row">
              <span>{city.name}</span>
              <button onClick={() => addCityToSelected(city)}>
                <FaPlus />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - CHOSEN CITIES */}
      <div id="rightContainer">
        <div className="create-header">My List ({selectedCities.length} cities)</div>
        
        {/* Starting City Dropdown */}
        <div className="starting-city-dropdown">
          <label>Choose Starting City:</label>
          <select 
            value={selectedStartingCity} 
            onChange={(e) => setSelectedStartingCity(e.target.value)}
          >
            <option value="">Select starting city...</option>
            {selectedCities.map(city => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Selected Cities List */}
        <div className="selected-cities-scroll-container">
          {selectedCities.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#666',
              fontStyle: 'italic' 
            }}>
              No cities selected yet. Add cities from the left panel.
            </div>
          ) : (
            selectedCities.map((city, index) => (
              <div key={city.id} className="selected-city-row">
                <span className="number">{index + 1}.</span>
                <span className="city-name">{city.name}</span>
                <button 
                  className="minus-btn"
                  onClick={() => removeCityFromSelected(city)}
                >
                  <FaMinus />
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Trip Summary */}
        {selectedCities.length > 0 && (
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Trip Summary:</div>
            <div>Cities: {selectedCities.length}</div>
            <div>Mode: {tripMode === '11cities' ? '11 Cities' : '13 Cities'}</div>
            {selectedStartingCity && <div>Starting from: {selectedStartingCity}</div>}
          </div>
        )}
        
        <div className="button-group">
          <Input
            type="button"
            className="default-button"
            value="Back"
            onClick={() => navigate('/trip')}
          />
          <Input
            type="button"
            className="default-button"
            style={{ marginLeft: 'auto' }}
            value="Submit"
            onClick={saveListAndSubmit}
            disabled={loading || selectedCities.length === 0 || !selectedStartingCity}
          />
        </div>
      </div>
    </div>
  );
  // END return

};

export default CreateTripPage;