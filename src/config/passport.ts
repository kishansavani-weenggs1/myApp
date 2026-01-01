import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { JwtPayload } from "../types/jwt.js";
import { ENV } from "./env.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ENV.JWT.ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(opts, (payload: JwtPayload, done) => {
    void (async () => {
      try {
        const result = await db
          .select()
          .from(users)
          .where(and(eq(users.id, payload.id), isNull(users.deletedAt)))
          .limit(1);

        if (result.length === 0) {
          return done(null, false);
        }

        const user = result[0];

        if (payload.tokenVersion !== user.tokenVersion) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })();
  })
);

export default passport;
