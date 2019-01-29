// import {
//   ArgumentsHost,
//   CanActivate,
//   ExecutionContext,
//   HttpException,
//   HttpStatus,
//   Injectable,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { AuthService } from './auth.service';
// import { getAuthToken } from './jwt.strategy';

// export class HasAuthException extends HttpException {
//   constructor() {
//     super('HasAuth', HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }

// @Injectable()
// export class HasAuthGuard implements CanActivate {
//   constructor(private readonly authService: AuthService) {}

//   async canActivate(ctx: ExecutionContext & ArgumentsHost) {
//     const req: Request = ctx.switchToHttp().getRequest();
//     let isValid = false;
//     try {
//       const token = getAuthToken(req);
//       isValid = !!(await this.authService.validateToken(token));
//     } catch (e) {
//       isValid = false;
//     }
//     if (isValid) {
//       throw new HasAuthException();
//     }
//     return true;
//   }
// }
