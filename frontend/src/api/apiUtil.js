import SpotifyWebApi from 'spotify-web-api-node';
import React, { createContext, useContext, useState, useEffect} from 'react';
import WebPlayback, {track} from '../elements/WebPlayback';
import axios from 'axios';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

export const PremiumContext = createContext(false);
export const TokenContext = createContext('');
export const PlayerContext = createContext(null)
export const TrackContext = createContext(track)

export const SpotifyAuthContext = createContext({
    exchangeCode: () => { throw new Error("context not loaded") },
    refreshAccessToken: () => { throw new Error("context not loaded") },
    hasToken: spotifyApi.getAccessToken() !== undefined,
    api: spotifyApi
});

export const RunSpotify = () => useContext(SpotifyAuthContext);

function setStoredJSON(id, obj) {
    localStorage.setItem(id, JSON.stringify(obj));
}

export function getStoredJSON(id, fallbackValue = null) {
    const storedValue = localStorage.getItem(id);
    return storedValue === null
        ? fallbackValue
        : JSON.parse(storedValue);
}

export const logout = () => {
    window.localStorage.removeItem('myApp:spotify');
    window.location.reload();
};

export function SpotifyAuthContextProvider({ children }) {
    const [token, setToken] = useState(() => getStoredJSON('myApp:spotify', null));
    const [is_premium, setPremium] = useState(true);
    const [currentTrack, setTrack] = useState(track);
    const [player, setPlayer] = useState(undefined)

    const hasToken = token !== null

    useEffect(() => {
        if (token === null) return;

        spotifyApi.setCredentials({
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
        })

        setStoredJSON('myApp:spotify', token)
    }, [token])

    function exchangeCode(code) {
        return axios
            .post("http://localhost:3001/login", {
                code
            })
            .then(res => {
                const { accessToken, refreshToken, expiresIn } = res.data;
                setToken({
                    accessToken,
                    refreshToken,
                    expiresAt: Date.now() + (expiresIn * 1000)
                });
            })
            .catch(err => {
                console.error(err);
                console.log('Error exchanging code:', err);
            });
    }

    function refreshAccessToken() {
        const refreshToken = token.refreshToken;
        return axios
            .post("http://localhost:3001/refresh", {
                refreshToken
            })
            .then(res => {
                const refreshedtoken = {
                    accessToken: res.data.accessToken,
                    refreshToken: res.data.refreshToken || token.refreshToken,
                    expiresAt: Date.now() + (res.data.expiresIn * 1000)
                }

                setToken(refreshedtoken)

                spotifyApi.setCredentials({
                    accessToken: refreshedtoken.accessToken,
                    refreshToken: refreshedtoken.refreshToken,
                })

                console.log('Token refreshed:', {
                    accessToken: refreshedtoken.accessToken.substring(0, 10) + '...',
                    expiresIn: res.data.expiresIn
                });

                return refreshedtoken
            })
            .catch(err => {
                console.error(err);
                console.log('Error refreshing access token:', err);
            });
    }

    async function refreshableCall(callApiFunc) {
        if (Date.now() > token.expiresAt)
            await refreshAccessToken();

        try {
            return await callApiFunc()
        } catch (err) {
            if (err.name !== "WebapiAuthenticationError")
                throw err;
        }

        return refreshAccessToken()
            .then(callApiFunc)
    }

    return (
        <SpotifyAuthContext.Provider value={{api: spotifyApi,exchangeCode,hasToken,refreshableCall,refreshAccessToken}}>
            <TokenContext.Provider value={[token, setToken]}>
                <PlayerContext.Provider value={[player, setPlayer]}>
                    <TrackContext.Provider value={[currentTrack, setTrack]}>
                    <PremiumContext.Provider value={[is_premium, setPremium]}>
                        {children}
                    </PremiumContext.Provider>
                    </TrackContext.Provider>
                </PlayerContext.Provider>
            </TokenContext.Provider>
        </SpotifyAuthContext.Provider>
    )
}
