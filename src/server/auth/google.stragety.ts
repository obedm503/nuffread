// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { Request, Response } from 'express';
// import * as passport from 'passport';
// import {
//   IOAuth2StrategyOption,
//   OAuth2Strategy,
//   Profile,
// } from 'passport-google-oauth';
// import { URL } from 'url';
// import { User } from '../user/user.entity';
// import { UserService } from '../user/user.service';
// import { getUrl } from '../util';
// import { AuthService } from './auth.service';

// const getPhoto = (user: Profile): string | undefined => {
//   const photo = user.photos && user.photos[0] && user.photos[0].value;
//   if (!photo) {
//     return;
//   }
//   // doing this removes the `?sz=50`
//   const url = new URL(photo);
//   return url.origin + url.pathname;
// };

// const config: IOAuth2StrategyOption = {
//   clientID: process.env.GOOGLE_CLIENT_ID!,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//   callbackURL: undefined as any,
// };

// @Injectable()
// export class GoogleStrategy extends OAuth2Strategy {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly userService: UserService,
//   ) {
//     super(
//       config,
//       (
//         accessToken: string,
//         refreshToken: string,
//         profile: Profile,
//         done: (error: any, user?: any) => void,
//       ) => {
//         this.verify(accessToken, refreshToken, profile)
//           .then(user => done(null, user))
//           .catch(done);
//       },
//     );

//     passport.use(this);
//   }

//   async verify(
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile,
//   ): Promise<User> {
//     // console.debug('GoogleStrategy#verify');
//     // let user = await this.userService.getByGoogleId(profile.id);

//     // const emails = profile.emails || [];
//     // const email = emails[0] || {};

//     // if (!user) {
//     //   // maybe it's the first login
//     //   user = await this.userService.getByEmail(email.value);
//     // }

//     // if (!user) {
//     //   throw new UnauthorizedException(`${email.value} user doesn't exist`);
//     // }

//     // if (!user.googleId) {
//     //   user.googleId = profile.id;
//     // }

//     // // google user might have chaged these values
//     // // so update db
//     // user.photo = getPhoto(profile);
//     // user.name = profile.displayName;
//     // // not sure if email CAN change
//     // user.email = email.value;
//     // user = await this.userService.update(user);

//     // return user;
//     return new User;
//   }
// }

// export const googleAuth = ({ isCallback }) => (
//   req: Request,
//   res: Response,
//   next,
// ) => {
//   const base = getUrl(req);
//   const config: any = {
//     session: false,
//     scope: ['openid', 'profile', 'email'],
//     callbackURL: `${base}/auth/google/callback`,
//   };

//   if (isCallback) {
//     config.failureRedirect = '/login';
//     // return query params to how they were before google auth
//     Object.assign(req.query, JSON.parse(req.query.state));
//   } else {
//     config.state = JSON.stringify(req.query);
//   }

//   passport.authenticate('google', config)(req, res, next);
// };
