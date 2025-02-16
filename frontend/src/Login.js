import React, {useState, useEffect} from 'react';
import logo from "./logo2.svg"
import { Container } from 'react-bootstrap';
import { RunSpotify } from './api/apiUtil';
import "./Login.css";
import "./elements/Header.css";

function Login() {
    useEffect(() => {
        document.title = "Login | Weather Waves";
    }, [])

	const { exchangeCode } = RunSpotify();
	const [error, setError] = useState(null);
	const code = new URLSearchParams(window.location.search).get("code");

	if (error) {
		console.error(error);
	}

	useEffect(() => {
		if (!code) return;
		let disposed = false;
		exchangeCode(code)
			.then(() => {
				if (disposed) return;
				setError(null);
				window.history.pushState({}, null, "/");
			})
			.catch((error) => {
				if (disposed) return;
				setError(error);
			});

		return () => (disposed = true);
	}, [code, exchangeCode]);

	const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000";
	const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "b5a5742ac7ba4919b7de8c7b02cf2101";
	const AUTH_SCOPES = [
		"user-read-email",
		"user-read-private",
		"playlist-modify-private",
		"playlist-read-private",
		"app-remote-control",
		"streaming",
		"user-modify-playback-state",
		"user-read-currently-playing",
	];

	const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${AUTH_SCOPES.join('%20')}`;

	if (error !== null) {
		return <span className="error">{error.message}</span>;
	}

	return (
		<div>
			<header className="Header">
            	<button title="http://localhost:3000" className="Header-button"><img className='logo' alt="Weather Waves" src={logo} />
            </button>
            	<nav className='Nav-container'>
                	<button title="http://localhost:3000/" className='Header-nav'>
                    	Random
                	</button>
            	</nav>
        	</header>

			<Container className='login-btn' style={{ backgroundColor: '#e9e9e9' }}>
        		<a className='btn btn-dark btn-sm' href={AUTH_URL}>
            		Login with Spotify to Continue
        	    </a>
    	    </Container>
			<div className="legal">©Copyright {new Date().getFullYear()} Weather Waves | <a href='/privacy-policy'>Privacy Policy</a> | <b><a href='https://github.com/Shshiv0/weather-waves'>GitHub</a></b></div>
		</div>
	);
};

export default Login;