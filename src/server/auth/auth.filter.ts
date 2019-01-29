// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { BaseExceptionFilter } from '@nestjs/core';
// import { Request, Response } from 'express';
// import { HasAuthException } from './auth.guard';

// @Catch(UnauthorizedException)
// export class NoAuthExceptionFilter extends BaseExceptionFilter
//   implements ExceptionFilter<UnauthorizedException> {
//   catch(exception: UnauthorizedException, host: ArgumentsHost) {
//     console.error('catch UnauthorizedException', exception);
//     const http = host.switchToHttp();
//     const req: Request = http.getRequest();

//     if (req.url === '/graphql') {
//       // on api endpoint, don't redirect
//       // rethrow
//       super.catch(exception, host);
//       return;
//     }

//     const res: Response = http.getResponse();

//     res.redirect('/logout');
//   }
// }

// @Catch(HasAuthException)
// export class HasAuthExceptionFilter
//   implements ExceptionFilter<HasAuthException> {
//   catch(exception: HasAuthException, host: ArgumentsHost) {
//     console.debug('catch HasAuthException');
//     const res: Response = host.switchToHttp().getResponse();
//     res.redirect('/');
//   }
// }
