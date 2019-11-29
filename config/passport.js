
const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwtConfig = require('../config/config');
const bcrypt = require('bcrypt');
const passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;
const jwt = require('jsonwebtoken');
var https = require('https');

const userSchema = require('../models/user.model');

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser((id, done) => {
  userSchema.findById(id, (err, user) => {
    done(err, user);
  });
});


/**
 * Sign in using Email and Password.
 */

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtConfig.jwtSecret
},
  function (jwtPayload, cb) {
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return userSchema.findById(jwtPayload.id)
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  }
));

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  userSchema.findOne({ email: email }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { error: 'Credenciais inválidas.' });
    }
    bcrypt.compare(password, user.password)
      .then(passwordsMatch => {
        if (passwordsMatch) {
          return done(null, user);
        } else {
          return done(null, false, { error: 'Credenciais inválidas.' });
        }
      });
  });
}));

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: `${process.env.FRONTEND_URL}/auth/facebook/callback`,
  profileFields: ['name', 'email', 'link'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    done('User already connected');
  } else {
    userSchema.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      userSchema.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          done('There is already an account using this email address.');
        } else {
          const user = new userSchema();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

passport.use('facebookStrategyDevice', new CustomStrategy(
  (req, done) => {
    //Setting up the https request
    var accessToken = req.body.accessToken;
    var options = {
      host: 'graph.facebook.com',
      port: 443,
      path: '/me?fields=id,name,email&access_token=' + accessToken,
      method: 'GET'
    }


    var getReq = https.request(options, (res) => {
      res.on('data', (data) => {
        let parsed = JSON.parse(data);

        //Check if user exist
        userSchema.findOne({
          facebook: parseInt(parsed.id)
        }, (err, user) => {
          if (err)
            return done(err);

          //If user don't exist, create the user
          if (!user) {
            var user = new userSchema({
              email: parsed.email,
              facebook: parsed.id,
              avatar: `https://graph.facebook.com/${parsed.id}/picture?type=large&width=720&height=720`,
              profile: {
                name: parsed.name,
                phone: 00000000000,
                type: 'USUARIO'
              }
            });

            user.save((err, newUser) => {
              if (err) {
                return done(err);
              }

              const parse = JSON.stringify(newUser.profile);
              const profile = JSON.parse(parse);

              const data = {
                id: newUser._id,
                name: profile.name,
                email: newUser.email,
                phone: profile.phone,
                type: profile.type
              }

              const token = jwt.sign(JSON.stringify(data), jwtConfig.jwtSecret);
              return done(err, token);
            });
          } else {
            const parse = JSON.stringify(user.profile);
            const profile = JSON.parse(parse);
            const data = {
              id: user._id,
              name: profile.name,
              email: user.email,
              phone: profile.phone,
              type: profile.type
            }

            const token = jwt.sign(JSON.stringify(data), jwtConfig.jwtSecret);
            return done(err, token);
          }
        });
      });
    });

    //end the request
    getReq.end();
    getReq.on('error', function (err, res) {
      console.log("Error: ", err);
    });
  }));


passport.use('googleStrategyDevice', new CustomStrategy(
  (req, done) => {
    //Setting up the https request

    const { userId, email, givenName, familyName, imageUrl } = req.body;
    userSchema.findOne({
      google: parseInt(userId)
    }, (err, user) => {
      if (err) return done(err);

      //If user don't exist, create the user

      if (!user) {
        var user = new userSchema({
          email: email,
          google: parseInt(userId),
          avatar: imageUrl,
          profile: {
            name: `${givenName} ${familyName}`,
            phone: 00000000000,
            type: 'USUARIO'
          }
        });

        user.save((err, newUser) => {
          if (err) {
            return done(err);
          }

          const parse = JSON.stringify(newUser.profile);
          const profile = JSON.parse(parse);

          const data = {
            id: newUser._id,
            name: profile.name,
            email: newUser.email,
            phone: profile.phone,
            type: profile.type
          }

          const token = jwt.sign(JSON.stringify(data), jwtConfig.jwtSecret);
          return done(err, token);
        })
      } else {
        userSchema.updateOne({ google: userId }, {
          $set: {
            avatar: imageUrl
          }
        }, (err, res) => {
          if (err) return done(err);
          const parse = JSON.stringify(user.profile);
          const profile = JSON.parse(parse);
          const data = {
            id: user._id,
            name: profile.name,
            email: user.email,
            phone: profile.phone,
            type: profile.type
          }
          const token = jwt.sign(JSON.stringify(data), jwtConfig.jwtSecret);
          return done(err, token);
        })
      }
    })
  }));





/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: `${process.env.FRONTEND_URL}/auth/google/callback`,
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    done('User already connected');
  } else {
    userSchema.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      userSchema.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          done('There is already an account using this email address.');
        } else {
          const user = new userSchema();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.profile.name = profile.displayName;
          user.profile.picture = profile._json.image.url;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));