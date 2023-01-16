import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarProvider {
  private static baseUrl = 'https://avatars.hamsterbox.xyz/api';

  generateRandom(example = '1234'): string {
    return `${AvatarProvider.baseUrl}/beam/120/${example}`;
  }
}
