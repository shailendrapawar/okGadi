import passport from "passport"
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { configDotenv } from "dotenv"
configDotenv();

passport.use( new GoogleStrategy(
{
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:`${process.env.BASE_URL}/admin/google-link/callback`

},async(accessToken,refreshToken,profile,cb)=>{

     const userInfo = {
        googleId: profile?.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value || null,
        isEmailVerified:profile.emails?.[0]?.verified || false,

        photo: profile.photos?.[0]?.value || null,
      };

      return cb(null, userInfo);
}
))
passport.serializeUser((user,cb)=>{
  cb(null,user)
})

passport.deserializeUser((user,cb)=>{
  cb(null,user)
})