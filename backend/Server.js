const express = require("express")
const cors = require("cors")
const SpotifyWebApi = require("spotify-web-api-node")
const path = require("path")
require('dotenv').config()

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
    var spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI,
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
        })
})

app.post("/login", (req, res) => {
    var code = req.body.code

    var spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI
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
            res.sendStatus(400);
            console.error(err);
        })
})