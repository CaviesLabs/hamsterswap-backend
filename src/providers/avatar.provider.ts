import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarProvider {
  private static baseUrl = 'https://source.boringavatars.com';

  generateRandom(example = '1234'): string {
    return `${AvatarProvider.baseUrl}/beam/120/${example}`;
  }
}
