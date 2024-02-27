const axios = require("axios");
require("dotenv").config();

// Initiates the Google Login flow
const initiateFBLogin = (req, res) => {
  const url = `https://www.facebook.com/v13.0/dialog/oauth?display=popup&client_id=${process.env.APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=public_profile`;
  return res.redirect(url);
};

//https://www.facebook.com/v19.0/dialog/oauth?display=popup&client_id=${process.env.APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=public_profile
//https://www.facebook.com/v13.0/dialog/oauth?client_id=${process.env.APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=email

// Callback URL for handling the Google Login response
const handleFBLogin = async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post(
      `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${process.env.APP_ID}&client_secret=${process.env.APP_SECRET}&code=${code}&redirect_uri=${process.env.FB_REDIRECT_URI}`
    );

    const { access_token } = data;

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get(
      `https://graph.facebook.com/v13.0/me?fields=name,email,picture&access_token=${access_token}`
    );
    // Code to handle user authentication and retrieval using the profile data
    res.json({ status: true, profile });
    // res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    // res.redirect("/login");
    res.json({ status: false, error: "error" });
  }
};

// Logout route
const googleLogout = (req, res) => {
  // Code to handle user logout
  res.redirect("/login");
};

module.exports = { initiateFBLogin, handleFBLogin };
