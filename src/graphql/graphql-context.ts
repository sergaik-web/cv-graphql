import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import type { ProfileLoaders } from '../profile/profile-loaders.factory';

export interface GraphQLContext {
  req: Request;
  loaders: ProfileLoaders;
}

/** Достаёт DataLoader'ы текущего запроса: `@Loaders() loaders: ProfileLoaders`. */
export const Loaders = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ProfileLoaders =>
    GqlExecutionContext.create(ctx).getContext<GraphQLContext>().loaders,
);
