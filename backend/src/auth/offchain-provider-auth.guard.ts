import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class OffchainProviderGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.headers?.authorization) {
      throw new UnauthorizedException();
    }
    if (!this.hasToken(req.headers.authorization)) {
      throw new UnauthorizedException();
    }
    const authorization = req.headers.authorization;

    const valid = await this.validateToken(authorization);

    return valid;
  }

  hasToken(authorization) {
    if (!authorization) return false;
    return authorization.split(' ')[0] === 'Bearer';
  }

  async validateToken(authorizationToken: string) {
    if (authorizationToken.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = authorizationToken.split(' ')[1];

    return token === process.env.OFFCHAIN_PROVIDER_SECRET;
  }
}
