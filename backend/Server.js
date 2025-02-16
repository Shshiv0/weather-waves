require('dotenv').config()
const express = require("express")
const cors = require("cors")
const SpotifyWebApi = require("spotify-web-api-node")
const path = require("path")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001

app.listen(PORT);

app.post('/', function (req, res) {
    res.status(200)
});

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.SPOTIFY_REDIRECT_URI,
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken
    });
    spotifyApi.refreshAccessToken().then(data => {
            res.json({
                accessToken: data.body.access_token,
                expiresIn: data.body.expires_in,
            })
            spotifyApi.setAccessToken(data.body['access_token']);
        }).catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})

app.post("/login", (req, res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.SPOTIFY_REDIRECT_URI,
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    
    spotifyApi.authorizationCodeGrant(code).then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            })
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        }).catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})