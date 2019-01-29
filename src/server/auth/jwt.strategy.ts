// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { Request } from 'express';
// import * as passport from 'passport';
// import { Strategy, VerifiedCallback } from 'passport-jwt';
// import { ITokenUser } from '../util';
// import { AuthService } from './auth.service';

// export const getAuthToken = (req: Request) => {
//   const token = req.cookies && req.cookies.jwt;
//   return token;
// };

// @Injectable()
// export class JwtStrategy extends Strategy {
//   constructor(private readonly authService: AuthService) {
//     super(
//       {
//         jwtFromRequest: getAuthToken,
//         secretOrKey: process.env.SECRET!,
//       },
//       (user: ITokenUser, done: VerifiedCallback) =>
//         this.verify(user)
//           .then(user => done(null, user))
//           .catch(done),
//     );
//     passport.use(this);
//   }

//   async verify(jwtUser: ITokenUser) {
//     const user = await this.authService.validateUser(jwtUser);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }
