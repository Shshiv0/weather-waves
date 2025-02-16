import React, { useEffect } from 'react';
import Header from './Header';

export default function PrivacyPolicy() {
    useEffect(() => {
        document.title = "Privacy Policy | Weather Waves";
    }, [])

    return (
        <div className="privacy-policy-container">
            <Header />
            <h4 className='privacy-policy-title'>Privacy Policy</h4>
            <p className='privacy-policy-info'>Weather Waves does not store any personal data upon logging in via Spotify such as email, usernames, and/or Geolocation data.</p>
        </div>
    );
}