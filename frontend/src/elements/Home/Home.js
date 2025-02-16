import React, { useState, useEffect, useContext } from 'react';
import Header from '../Header';
import Weather from './Weather';
import { TokenContext, PlayerContext, TrackContext } from '../../api/apiUtil';

export default function Home({ onPlayTrack }) {
    useEffect(() => {
        document.title = "Weather Waves";
    }, []);

    const [currentTrack] = useContext(TrackContext);

    return (
        <div>
            <Header />
            <Weather onPlayTrack={onPlayTrack} currentTrack={currentTrack} />
        </div>
    );
}
