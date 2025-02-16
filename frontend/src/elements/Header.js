import { useNavigate } from 'react-router-dom';
import logo from "../logo2.svg";
import { logout  } from '../api/apiUtil';
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    
    const randomLocations = [
        "Tokyo, JP",
        "London, GB",
        "Paris, FR",
        "New York, US",
        "Sydney, AU",
        "Rio de Janeiro, BR",
        "Dubai, AE",
        "Mumbai, IN",
        "Cape Town, ZA",
        "Moscow, RU",
        "Toronto, CA",
        "Barcelona, ES",
        "Amsterdam, NL",
        "Singapore, SG",
        "Seoul, KR"
    ];

    const handleRandomLocation = () => {
        const randomLocation = randomLocations[Math.floor(Math.random() * randomLocations.length)];
        const searchEvent = new CustomEvent('searchLocation', { 
            detail: { location: randomLocation }
        });
        window.dispatchEvent(searchEvent);
        navigate('/');
    };

    return (
        <header className="Header">
            <button title="http://localhost:3000" className="Header-button" onClick={() => navigate("/")}>
                <img className='logo' alt="Weather Waves" src={logo} />
            </button>
            <nav className='Nav-container'>
                <button className='Header-nav' onClick={handleRandomLocation}>
                    Random
                </button>
                <button className='Header-nav' onClick={() => logout()}>
                    Logout
                </button>
            </nav>
        </header>
    )
}

export default Header;
