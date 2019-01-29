// import { Controller, ForbiddenException, Get, Req, Res } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { UserService } from '../user/user.service';
// import { AuthService } from './auth.service';

// @Controller('auth')
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly userService: UserService,
//   ) {}

//   @Get('/google/callback')
//   async googleCallback(@Req() req: Request, @Res() res: Response) {
//     return this.authenticate(req, res, req.user);
//   }

//   // @Get('/login/:id')
//   // async fakeLogin(@Req() req: Request, @Res() res: Response) {
//   //   if (process.env.NODE_ENV === 'production') {
//   //     throw new ForbiddenException();
//   //   }

//   //   const user = await this.userService.getByGoogleId(req.params.id);
//   //   return this.authenticate(req, res, user);
//   // }

//   async authenticate(req: Request, res: Response, user) {
//     const token = await this.authService.createToken(user);
//     const returnUrl = req.query.return || '/';
//     res
//       .cookie('jwt', token, {
//         httpOnly: true,
//         // maxAge: 31556952000, // 1 year in milliseconds
//         secure: process.env.NODE_ENV === 'production',
//       })
//       .redirect(returnUrl);
//   }
// }
