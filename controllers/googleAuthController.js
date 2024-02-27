const axios = require("axios");
require("dotenv").config();

// Initiates the Google Login flow
const initiateLogin = (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?display=popup&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=profile email`;

  return res.redirect(url);
};

// Callback URL for handling the Google Login response
const handleGoogleLogin = async (req, res) => {
  const code = req.query.code;
  try {
    // Exchange authorization code for access token
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token, id_token } = data;

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    // Code to handle user authentication and retrieval using the profile data
    // res.json({ status: true, profile });

    res.redirect(
      `http://localhost:5173/login?email=${profile.email}&name=${profile.name}&picture=${profile.picture}`
    );
  } catch (error) {
    console.error("Error:", error);
    // res.redirect("/login");
    res.json({ status: false, error: error.data });
  }
};

// Logout route
const googleLogout = (req, res) => {
  // Code to handle user logout
  res.redirect("/login");
};

module.exports = { initiateLogin, handleGoogleLogin };
