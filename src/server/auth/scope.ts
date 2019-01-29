import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Scopes } from '../../shared/util';
import { IContext } from '../util';

function admin(user: { organizationId: string | null }) {
  return user.organizationId === null;
}

/**
 * Condition functions are meant to only apply when user is not admin
 * it is assumed that admin users also have DIRECT ACCESS TO THE DATABASE
 * so, there's no point in restricting their access here
 */
type ConditionFn = (ctx: IContext, args?) => boolean | Promise<boolean>;

// const conditions: { [key in Scopes]: ConditionFn } = {
//   [Scopes.CREATE_USER]({ user }, { user: newUser }) {
//     return user.organizationId === newUser.organizationId; // trying to create org user
//   },
//   [Scopes.READ_USER]: ownUser,
//   [Scopes.UPDATE_USER]: ownUser,
//   [Scopes.DELETE_USER]: adminOnly,
//   [Scopes.CREATE_ORGANIZATION]: adminOnly,
//   [Scopes.READ_ORGANIZATION]: ownOrg,
//   [Scopes.UPDATE_ORGANIZATION]: ownOrg,
//   [Scopes.DELETE_ORGANIZATION]: adminOnly,
//   [Scopes.CREATE_PARTICIPANT]: ownOrg,
//   [Scopes.READ_PARTICIPANT]: ownOrg,
//   [Scopes.READ_PARTICIPANT_LINK]: ownOrg,
//   [Scopes.UPDATE_PARTICIPANT]: ownUser,
//   [Scopes.DELETE_PARTICIPANT]: ownOrg,
//   [Scopes.CREATE_SURVEY]: ownOrg,
//   [Scopes.READ_SURVEY]: ownOrg,
//   [Scopes.UPDATE_SURVEY]: ownOrg,
//   [Scopes.DELETE_SURVEY]: ownOrg,
//   [Scopes.READ_ANSWERS]: ownAnswers,
//   [Scopes.UPDATE_ANSWERS]: ownAnswers,
//   [Scopes.DELETE_ANSWERS]: ownOrg,
// };

export async function guard(ctx: IContext, scopes: Scopes | Scopes[], args?) {
  // const { user } = ctx;
  // if (!user || !Array.isArray(user.scopes)) {
  //   throw new UnauthorizedException();
  // }

  // const requiredScopes = Array.isArray(scopes) ? scopes : [scopes];

  // const authorizedScopes = await Promise.all(
  //   requiredScopes.map(async scope => {
  //     const hasScope = user.scopes.includes(scope);
  //     const isAdmin = admin(user);
  //     const condition = conditions[scope];
  //     const hasCondition = await condition(ctx, args || {});

  //     return hasScope && (isAdmin || hasCondition);
  //   }),
  // );

  // const fullyAuthorized = authorizedScopes.every(Boolean);

  // if (!fullyAuthorized) {
  //   const missingScopes = requiredScopes
  //     // .filter((scope, i) => !authorizedScopes[i])
  //     .join(', ');
  //   const error = `Missing permissions: ${missingScopes}`;
  //   throw new UnauthorizedException(error, error);
  // }
}
