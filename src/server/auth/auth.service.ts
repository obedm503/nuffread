// import { Injectable } from '@nestjs/common';
// import { sign, verify } from 'jsonwebtoken';
// import { User } from '../user/user.entity';
// import { UserService } from '../user/user.service';
// import { ITokenUser } from '../util';

// @Injectable()
// export class AuthService {
//   constructor(
//     // private readonly participantService: ParticipantService,
//     private readonly userService: UserService,
//   ) {}

//   async createToken(user: any) {
//     const payload: ITokenUser = {
//       id: user.id,
//       type: user.type,
//       googleId: user.googleId,
//       organizationId: user.organizationId,
//     };
//     const config = { expiresIn: '24h' };
//     const token = await new Promise((resolve, reject) =>
//       sign(payload, process.env.SECRET!, config, (error, token) =>
//         error ? reject(error) : resolve(token),
//       ),
//     );
//     return token;
//   }

//   async validateUser(
//     partialUser: ITokenUser,
//   ): Promise<(User & ITokenUser) | (ITokenUser) | undefined> {
//     // jwts are supposed to be better because we can skip the db check
//     // as long as the token signature is valid (handled by jwt-passport)
//     // but if we ever want some fancy login logic like blocking a specific user
//     // it should happen here
//     let user: User | undefined;
//     if (partialUser.type === 'participant') {
//       // user = await this.participantService.get(partialUser.id);
//     } else {
//       user = await this.userService.get(partialUser.id);
//     }
//     return user && Object.assign(user, partialUser, user);
//   }

//   async validateToken(token: string) {
//     const user = await new Promise<ITokenUser>((resolve, reject) => {
//       verify(token, process.env.SECRET!, (error, user) =>
//         error ? reject(error) : resolve(user as any),
//       );
//     });
//     const valid = await this.validateUser(user);
//     return valid;
//   }
// }
