import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PremiumContext, TokenContext, PlayerContext, TrackContext } from '../api/apiUtil';
import { faPlay, faPause, faForwardStep, faBackwardStep } from '@fortawesome/free-solid-svg-icons'
import not_active from "../not_active.png";
import spotify_logo from "../spotify_logo.png";
import './WebPlayback.css';

export const track = {
    song_id: "",
    title: "",
    img_file: "",
    artists: "",
    genres: "",
    explicit: false,
    duration: 0
}

export default function WebPlayback({ isPlaying, setIsPlaying, onNext, onPrevious }) {
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const [player, setPlayer] = useContext(PlayerContext);
    const [current_track, setTrack] = useContext(TrackContext);
    const [token, setToken] = useContext(TokenContext);
    const [is_premium, setPremium] = useContext(PremiumContext);

    useEffect(() => {   
        if (player != null) {
            if (!is_active) {
                player.connect().catch(error => {
                    console.error("Error connecting player:", error);
                    setError(true);
                });
            }
            return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Weather Waves Web Player',
                getOAuthToken: cb => { cb(token.accessToken); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                setPremium(true);
            });

            player.addListener('not_ready', ({ device_id }) => {
                setPremium(false);
            });

            player.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize:', message);
                setError(true);
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate:', message);
                setError(true);
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account:', message);
                setError(true);
            });

            player.addListener('playback_error', ({ message }) => {
                console.error('Failed to perform playback:', message);
            });

            player.addListener('player_state_changed', ( state => {
                if (!state) {
                    return;
                }

                const data = state.track_window.current_track;

                if (data == null) {
                    return;
                }

                setTrack(data);

                setTrack({
                    song_id: data.id,
                    title: data.name,
                    img_file: data.album.images[0].url,
                    artists: data.artists.map(artist => artist.name).join(", "),
                    genres: data.artists.map(artist => (artist.genres ?? []).join(", ")).filter((genres => genres.length > 0)).join(", "),
                    explicit: (data.explicit ?? false),
                    duration: (data.duration_ms ?? 0)
                });

                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });
            }));

            player.addListener('autoplay_failed', () => {
                setError(true);
            });

            player.connect().catch(error => {
                console.error("Error connecting player:", error);
                setError(true);
            });
        };

        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [player, is_active, token.accessToken]);

    useEffect(() => {
        if (player) {
            player.addListener('player_state_changed', (state => {
                if (!state) {
                    return;
                }

                setPaused(state.paused);
                setIsPlaying(!state.paused);

                player.getCurrentState().then(state => { 
                    (!state)? setActive(false) : setActive(true) 
                });
            }));
        }
    }, [player, setIsPlaying]);

    return error || !is_premium ? (
        <div className="container-webplayback">
            <div className="main-wrapper">
                <div className="active-track-side">
                    <div className="active-title">
                        {is_premium ? 
                            <p>Error connecting to Spotify</p> : 
                            <p>Spotify Premium required to play tracks via the web player</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="container-webplayback">
            <div className="main-wrapper">
                <img 
                    src={current_track.song_id ? current_track.img_file : not_active} 
                    className="active-track-cover" 
                    alt="Track cover"
                    onError={(image) => {
                        image.target.src = not_active;
                        image.target.onerror = null;
                    }} 
                />
                
                <div className="active-track-side">
                    {current_track.song_id ? (
                        <>
                            <div className="active-track-artist" title={"Now Playing: " + current_track.title}> 
                                {current_track.artists}
                            </div>
                            <div className="active-track-title" title={current_track.artists}>
                                <b>
                                    <a 
                                        href={`https://open.spotify.com/track/${current_track.song_id}`} 
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {current_track.title}
                                    </a>
                                </b> 
                                <span>{current_track.explicit ? "(Explicit)" : " "}</span>
                            </div>
                        </>
                    ) : (
                        <div className="active-track-title">
                            <p>No track selected</p>
                        </div>
                    )}
                </div>

                <div className="button-layout">
                    <button className="control-btn" onClick={onPrevious} >
                        <FontAwesomeIcon className="control-icon" icon={faBackwardStep} />
                    </button>

                    <button className="control-btn" onClick={() => { player.togglePlay() }} >
                        <FontAwesomeIcon className="control-icon" icon={current_track.song_id ? (is_paused ? faPlay : faPause) : faPause} />
                    </button>

                    <button className="control-btn" onClick={onNext} >
                        <FontAwesomeIcon className="control-icon" icon={faForwardStep} />
                    </button>
                </div>

                <div className="spotify-info-active">
                    Web playback with 
                    <a 
                        href="https://open.spotify.com/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img src={spotify_logo} className="spotify-logo-active" alt="Spotify" />
                    </a>
                </div>
            </div>
        </div>
    );
}