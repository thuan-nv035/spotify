import express from "express";
import { createServer as createViteServer } from "vite";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${process.env.APP_URL}/auth/callback`,
});
// Auth URL
app.get("/api/auth/url", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-library-read",
    "user-top-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "streaming"
  ];
  const state = "spotify_auth_state";
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.json({ url: authorizeURL });
});

// Callback
app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  // console.log('code')
  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const { access_token, refresh_token, expires_in } = data.body;

    // In a real app, we'd set a cookie or session.
    // For this demo, we'll pass tokens back to the client via postMessage.
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'SPOTIFY_AUTH_SUCCESS',
                tokens: ${JSON.stringify({ access_token, refresh_token, expires_in })}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error during Spotify auth:", error);
    res.status(500).send("Authentication failed");
  }
});

// Refresh token
app.post("/api/auth/refresh", async (req, res) => {
  const { refresh_token } = req.body;
  const sApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: refresh_token
  });
  try {
    const data = await sApi.refreshAccessToken();
    res.json({
      access_token: data.body.access_token,
      expires_in: data.body.expires_in
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
