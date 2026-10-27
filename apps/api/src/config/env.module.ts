import { DynamicModule, Global, Module } from '@nestjs/common';
import type { ApiEnv } from '@nutrirace/shared';

export const ENV = Symbol('ENV');

/** Exposes the already-validated environment to the DI container. */
@Global()
@Module({})
export class EnvModule {
  static forRoot(env: ApiEnv): DynamicModule {
    return {
      module: EnvModule,
      providers: [{ provide: ENV, useValue: env }],
      exports: [ENV],
    };
  }
}
