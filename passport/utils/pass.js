// local strategy for username password login
passport.use(new Strategy(
    async (username, password, done) => {
      const params = [username];
      try {
        const [user] = await userModel.getUserLogin(params);
        console.log('Local strategy', user); // result is binary row
        if (user === undefined) {
          return done(null, false, {message: 'Incorrect email or password.'});
        }
        if (!await bcrypt.compare(password, user.password)) {
          return done(null, false, {message: 'Incorrect email or password.'});
        }
        delete user.password;
        return done(null, {...user}, {message: 'Logged In Successfully'}); // use spread syntax to create shallow copy to get rid of binary row type
      }
      catch (err) {
        return done(err);
      }
    }));

// TODO: JWT strategy for handling bearer token
passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: '123qwer',
    },
    async (jwtPayload, done) => {

      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload

      const user = await userModel.getUser(jwtPayload.user_id);
      const plainUser = {...user};
      console.log('jwt', jwtPayload, plainUser);
      if (plainUser.user_id) {
        return done(null, plainUser);
      } else {
        return done(null, false);
      }
    },
));

module.exports = passport;
