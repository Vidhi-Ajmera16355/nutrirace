import { Global, Module } from '@nestjs/common';
import type { ApiEnv } from '@nutrirace/shared';
import { ENV } from '../config/env.module';
import { AppLogger } from './app-logger';

@Global()
@Module({
  providers: [
    { provide: AppLogger, useFactory: (env: ApiEnv) => new AppLogger(env), inject: [ENV] },
  ],
  exports: [AppLogger],
})
export class LoggerModule {}
