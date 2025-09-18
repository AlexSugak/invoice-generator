import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../db.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.header('X-API-Key');

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // TODO: cache this

    const [key] = await this.db.Sql()<Array<{ id: number }>>`
      SELECT id 
      FROM api_keys 
      WHERE key = ${apiKey} 
      AND (expires_at IS NULL OR expires_at > now())
    `;

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
