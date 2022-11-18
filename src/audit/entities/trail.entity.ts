import { randomUUID } from 'crypto';

import { UserGroup } from '../../user/entities/user.entity';

/**
 * @dev Define Trail context entity
 * - Use for storing session, API state, and client information
 */
export class TrailContextEntity {
  /**
   * @dev Generated ID for flow tracing
   */
  contextId: string;

  eventSource: string;

  eventTime: Date;

  apiVersion: string;

  apiPath: string;

  tags: string[];

  userGroup?: UserGroup[];

  userIpAddress: string;

  userAgent: string;

  serviceEventDetails?: object;

  constructor() {
    this.contextId = randomUUID();
  }
}

/**
 * @dev Define Type of API's events
 */
export enum EventType {
  ACCOUNT_REGISTRATION = 'ACCOUNT::REGISTRATION',
  ACCOUNT_SIGNIN = 'ACCOUNT::SIGNIN',
  ACCOUNT_CREATE_PASSWORD = 'ACCOUNT::CREATE_PASSWORD',
  ACCOUNT_FORGOT_PASSWORD = 'ACCOUNT::FORGOT_PASSWORD',
  ACCOUNT_UPDATE_PASSWORD = 'ACCOUNT::UPDATE_PASSWORD',
  ACCOUNT_UPDATE_PROFILE = 'ACCOUNT::UPDATE_PROFILE',
  ACCOUNT_UPDATE_AVATAR = 'ACCOUNT::UPDATE_AVATAR',
  ACCOUNT_REQUEST_WALLET_PERMISSION = 'ACCOUNT::REQUEST_WALLET_PERMISSION',
  ACCOUNT_REQUEST_2FA = 'ACCOUNT::REQUEST_2FA',
  ACCOUNT_CONFIRM_2FA = 'ACCOUNT::CONFIRM_2FA',
  WALLET_SEND = 'WALLET::SEND',
  WALLET_CREATE = 'WALLET::CREATE',
  WALLET_SIGN = 'WALLET::SIGN',
  WALLET_CALL = 'WALLET::CALL',
  WALLET_RECOVER = 'WALLET::RECOVER',
  IDP_LINK = 'IDP::LINK',
  IDP_UNLINK = 'IDP::UNLINK',
  SESSION_REMOVE = 'SESSION::REMOVE',
}

/**
 * @dev Define Trail entity
 * - Use for collect and store API activities
 */
export class TrailEntity {
  /**
   * @dev server's event data
   */
  context: TrailContextEntity;

  /**
   * @dev client's event data
   */
  actorId = 'anonymous';

  eventName: string;

  eventType: EventType;

  errorCode?: string;

  errorMessage?: string;

  requestParameters?: object;

  responseElements?: object;

  additionalEventData?: object;

  requestId?: string;

  recipientAccountId?: string;
}

export type LogData = Omit<TrailEntity, 'context' | 'actorId' | 'eventType'>;
