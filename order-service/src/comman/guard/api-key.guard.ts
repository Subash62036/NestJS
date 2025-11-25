import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const VALID_KEY = process.env.API_KEY || 'my-secret-key';

    if (!apiKey || apiKey !== VALID_KEY) {
      throw new UnauthorizedException('Invalid or missing API Key');
    }

    return true;
  }
}
