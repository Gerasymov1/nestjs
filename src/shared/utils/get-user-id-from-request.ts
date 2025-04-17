import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

export function getUserIdFromRequest(req: Request) {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedException('User is not authenticated');
  }

  return userId;
}
