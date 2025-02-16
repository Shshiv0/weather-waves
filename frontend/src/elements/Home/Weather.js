import React, {useState, useContext, useEffect} from 'react';
import axios from 'axios';
import { TokenContext } from '../../api/apiUtil';
import { getWeatherMood } from '../../utils/weatherMusicMap';
import "./Weather.css";
import { config } from '../../config';

export default function Weather({ onPlayTrack, currentTrack }) {
    const [data, setData] = useState({})
    const [location, setLocation] = useState('')
    const [temp, setTemp] = useState()
    const [feelsLike, setFeelsLike] = useState()
    const [windspeed, setWindSpeed] = useState()
    const [tempUnits, setTempUnits] = useState('C')
    const [windspeedUnits, setWindSpeedUnits] = useState('m/s')
    const [token] = useContext(TokenContext);
    const [playlist, setPlaylist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`;

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest('.search-container')) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!location) return;
        
        const fetchWeather = async () => {
            try {
                const weatherRes = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
                );
                
            } catch (error) {
                console.error('Error fetching weather:', error);
            }
        };

        fetchWeather();
    }, [location]);

    useEffect(() => {
        const handleRandomSearch = (event) => {
            const { location } = event.detail;
            setLocation(location);
            
            const [city, country] = location.split(', ');
            
            handleSuggestionClick({
                name: city,
                country: country,
                state: null,
                lat: null,
                lon: null
            });
        };

        window.addEventListener('searchLocation', handleRandomSearch);
        return () => {
            window.removeEventListener('searchLocation', handleRandomSearch);
        };
    }, []);

    async function getPlaylist(weatherCondition) {
        const mood = getWeatherMood(weatherCondition);
        
        const weatherPlaylists = {
            'clear': '4ljMxaQ8t7sr9TSKNm0JWr',
            'rain': '0HqsArjxsxTvA2ToKXYlzx',
            'clouds': '0HqsArjxsxTvA2ToKXYlzx',
            'snow': '6qby6dW7ZhHNtKOhcoE7Tu',
            'thunderstorm': '6tWANGtQfbegtpYxLRhVQ2'
        };

        try {
            const playlistId = weatherPlaylists[weatherCondition.toLowerCase()] || weatherPlaylists.clear;
            
            const playlistResponse = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                }
            );
            
            const playlistData = await playlistResponse.json();

            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`,
                {
                    headers: {
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                }
            );
            
            const data = await response.json();
            if (!data.items) {
                console.error('No tracks in response:', data);
                return [];
            }
            return data.items.map(item => item.track);
        } catch (error) {
            console.error('Error getting playlist:', error);
            return [];
        }
    }

    async function fetchAPI() {
        if (!token || !token.accessToken) {
            console.error('No access token available');
            return;
        }

        setLoading(true);
        try {
            const weatherRes = await axios.get(url);
            
            if (!weatherRes.data || !weatherRes.data.weather) {
                console.error('Invalid weather data');
                return;
            }

            setData(weatherRes.data);
            setTemp((weatherRes.data.main.temp - 273.15).toFixed());
            setFeelsLike((weatherRes.data.main.feels_like - 273.15).toFixed());
            setWindSpeed(weatherRes.data.wind.speed.toFixed());
            
            const weatherCondition = weatherRes.data.weather[0].main;
            
            const recommendations = await getPlaylist(weatherCondition);
            
        } catch (err) {
            console.error('Error in fetchAPI:', err);
            console.log("Location not found");
        } finally {
            setLoading(false);
        }
    }

    const getLocation = (event) => {
        if (event.key === 'Enter') {
            fetchAPI()
            setLocation('')
        }
    }

    function toMetric() {
        if(data.main && data.wind) {
            setTemp((data.main.temp - 273.15).toFixed())
            setFeelsLike((data.main.feels_like - 273.15).toFixed())
            setWindSpeed(data.wind.speed.toFixed())
            setTempUnits('C')
            setWindSpeedUnits('m/s')
        }
    }

    function toImperial() {
        if(data.main && data.wind) {
            setTemp(((data.main.temp - 273.15) * 1.8 + 32).toFixed())
            setFeelsLike(((data.main.feels_like - 273.15) * 1.8 + 32).toFixed())
            setWindSpeed((data.wind.speed*2.237).toFixed())
            setTempUnits('F')
            setWindSpeedUnits('mph')
        }
    }

    async function getSuggestions(input) {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
            );
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                setSuggestions([]);
                return;
            }

            const cityResults = data
                .filter(location => 
                    location.name && 
                    location.country &&
                    location.lat &&
                    location.lon &&
                    location.state
                );

            setSuggestions(cityResults);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    }

    function handleLocationChange(event) {
        const value = event.target.value;
        setLocation(value);
        getSuggestions(value);
        setShowSuggestions(true);
    }

    function handleSuggestionClick(suggestion) {
        const locationName = `${suggestion.name}, ${suggestion.country}`;
        setLocation(locationName);
        setShowSuggestions(false);
        
        const weatherUrl = suggestion.lat && suggestion.lon 
            ? `https://api.openweathermap.org/data/2.5/weather?lat=${suggestion.lat}&lon=${suggestion.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
            : `https://api.openweathermap.org/data/2.5/weather?q=${suggestion.name},${suggestion.country}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`;
        
        setLoading(true);
        axios.get(weatherUrl)
            .then(weatherRes => {
                if (!weatherRes.data || !weatherRes.data.weather) {
                    throw new Error('Invalid weather data');
                }

                setData(weatherRes.data);
                setTemp((weatherRes.data.main.temp - 273.15).toFixed());
                setFeelsLike((weatherRes.data.main.feels_like - 273.15).toFixed());
                setWindSpeed(weatherRes.data.wind.speed.toFixed());
                
                const weatherCondition = weatherRes.data.weather[0].main;
                
                return getPlaylist(weatherCondition);
            })
            .then(recommendations => {
                if (recommendations) {
                    setPlaylist(recommendations);
                }
            })
            .catch(error => {
                console.error('Error fetching weather:', error);
                setData({});
                setPlaylist([]);
            })
            .finally(() => {
                setLoading(false);
                setLocation('');
            });
    }

    return (
        <div className='weather'>
            <div className="search-container">
                <i className="bi bi-search"></i>
                <input 
                    className="search-input" 
                    value={location} 
                    onChange={handleLocationChange}
                    onKeyPress={event => {
                        if (event.key === 'Enter') {
                            setShowSuggestions(false);
                            getLocation(event);
                        }
                    }}
                    type="text" 
                    placeholder="Location" 
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                            <div 
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.name}
                                {suggestion.state && `, ${suggestion.state}`}
                                {`, ${suggestion.country}`}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="content-container">
                <div className="weather-info">
            <div className="container">
                {data.name !== undefined &&
                    <div className="primary">      
                        <div className='unit-buttons'>
                            <button className="units" onClick={toMetric}>°C</button>
                            <button className="units" onClick={toImperial}>| °F</button>
                        </div>                
                                <div className="location">
                                    {data.sys && `${data.name}, ${data.sys.country}`}
                                </div>
                                <div className="temp">
                                    {data.main && `${temp}°${tempUnits}`}
                                </div>
                                <div className="description">
                                    {data.weather && data.weather[0].main}
                                </div>
                    </div>
                }

                {data.name !== undefined &&
                    <div className="secondary">
                                {data.main && <div>Feels Like: {feelsLike}°{tempUnits}</div>}
                                {data.main && <div>Humidity: {data.main.humidity}%</div>}
                                {data.wind && <div>Wind Speed: {windspeed}{windspeedUnits}</div>}
                                {data.main && <div>Pressure: {(data.main.pressure/10).toFixed(1)} kPa</div>}
                            </div>
                        }
                    </div>
                </div>

                {loading && <div className="loading">Loading playlist...</div>}
                
                {!loading && playlist.length === 0 && data.name && (
                    <div className="no-playlist">
                        <p>No playlist available. Try searching for a different location.</p>
                    </div>
                )}
                
                {playlist.length > 0 && (
                    <div className="weather-playlist">
                        <h3>Weather-Based Playlist for {data.weather[0].main}</h3>
                        <div className="playlist-tracks">
                            {playlist.map((track, index) => (
                                <div 
                                    key={track.id} 
                                    className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                                    onClick={() => onPlayTrack(track, playlist, index)}
                                >
                                    <img 
                                        src={track.album.images[2]?.url} 
                                        alt={track.name}
                                        className="track-image"
                                    />
                                    <div className="track-info">
                                        <div className="track-name">{track.name}</div>
                                        <div className="track-artist">
                                            {track.artists[0].name}
                                        </div>
                                    </div>
                                    {currentTrack?.id === track.id && (
                                        <div className="now-playing">
                                            <i className="bi bi-music-note-beamed"></i>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}