export const weatherToMusicMap = {
    'clear': {
        genres: ['anime', 'j-pop', 'j-rock'],
        energy: 0.8,
        valence: 0.8
    },
    'rain': {
        genres: ['anime', 'japanese orchestral', 'soundtracks'],
        energy: 0.4,
        valence: 0.3
    },
    'clouds': {
        genres: ['anime', 'japanese jazz', 'j-pop'],
        energy: 0.5,
        valence: 0.5
    },
    'snow': {
        genres: ['anime', 'japanese classical', 'soundtracks'],
        energy: 0.3,
        valence: 0.6
    },
    'thunderstorm': {
        genres: ['anime', 'j-rock', 'japanese metal'],
        energy: 0.9,
        valence: 0.4
    }
};

export function getWeatherMood(weatherCondition) {
    const condition = weatherCondition.toLowerCase();
    for (const [key, value] of Object.entries(weatherToMusicMap)) {
        if (condition.includes(key)) {
            return value;
        }
    }
    
    return weatherToMusicMap.clear;
} 