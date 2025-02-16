import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { RunSpotify } from './apiUtil'
import Login from '../Login'
import Home from '../elements/Home/Home'
import PrivacyPolicy from '../elements/PrivacyPolicy'
import NotFound from '../404'
import WebPlayback from '../elements/WebPlayback'
import { useState, useContext, useEffect } from 'react'
import { PlayerContext, TokenContext, PremiumContext, TrackContext } from './apiUtil'

function ApiRouter() {
    const { hasToken } = RunSpotify()
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [player, setPlayer] = useContext(PlayerContext);
    const [token] = useContext(TokenContext);
    const [is_premium, setPremium] = useContext(PremiumContext);
    const [currentTrack, setTrack] = useContext(TrackContext);
    const [deviceId, setDeviceId] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (player) {
            player.addListener('ready', ({ device_id }) => {
                setDeviceId(device_id);
                setIsReady(true);
            });

            player.addListener('not_ready', ({ device_id }) => {
                setIsReady(false);
            });

            player.connect();
        }

        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [player]);

    const handlePlayTrack = async (track, playlist, index) => {
        try {
            if (!player || !deviceId || !isReady) {
                console.error('Player not ready:', { player: !!player, deviceId, isReady });
                return;
            }

            setCurrentPlaylist(playlist);
            setCurrentIndex(index);

            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${track.id}`]
                })
            });

            setTrack({
                song_id: track.id,
                title: track.name,
                img_file: track.album.images[0].url,
                artists: track.artists.map(artist => artist.name).join(", "),
                genres: track.artists.map(artist => (artist.genres ?? []).join(", ")).filter((genres => genres.length > 0)).join(", "),
                explicit: (track.explicit ?? false),
                duration: (track.duration_ms ?? 0)
            });
            
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    const handleNext = async () => {
        if (currentIndex < currentPlaylist.length - 1) {
            const nextIndex = currentIndex + 1;
            await handlePlayTrack(currentPlaylist[nextIndex], currentPlaylist, nextIndex);
        }
    };

    const handlePrevious = async () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            await handlePlayTrack(currentPlaylist[prevIndex], currentPlaylist, prevIndex);
        }
    };

    if (!hasToken) {
        return <Login />
    }

    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Home onPlayTrack={handlePlayTrack} />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <div className="legal">©Copyright {new Date().getFullYear()} Weather Waves | <a href='/privacy-policy'>Privacy Policy</a> | <b><a className="github" href='https://github.com/Shshiv0'>GitHub</a></b></div>
            <WebPlayback 
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                onNext={handleNext}
                onPrevious={handlePrevious}
            />
        </Router>
    )
}

export default ApiRouter;