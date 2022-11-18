import { ExecutionContext, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';
import { isObject } from 'class-validator';
import { Duration } from 'luxon';

/**
 * @dev imports deps
 */
import { KeycloakAuthSession } from '../auth/strategies/keycloak-auth.strategy';
import { TrailDocument, TrailModel } from '../orm/model/trail.model';
import {
  ExtendedSessionDocument,
  ExtendedSessionModel,
} from '../orm/model/extended-session.model';

import { RegistryProvider } from '../providers/registry.provider';
import { IAuditLogger } from './audit-logger.interface';
import {
  EventType,
  LogData,
  TrailContextEntity,
} from './entities/trail.entity';
import { JWTPayload } from '../providers/hash/jwt.provider';
import { UtilsProvider } from '../providers/utils.provider';
import { OpenIDProvider } from '../providers/federated-users/openid.provider';

/**
 * @dev Service for audit logging
 */
export class AuditLoggerService implements IAuditLogger {
  private executionContext?: ExecutionContext;
  /**
   * @dev current logger context
   */
  private context: TrailContextEntity;
  /**
   * @dev userId of authenticated executor
   */
  private actorId: string;
  /**
   * @dev event of current endpoint
   */
  private eventType: EventType;

  /**
   * @dev request instance is to be injected
   * @private
   */
  private request: FastifyRequest | Socket;

  constructor(
    /**
     * @dev Inject providers
     */
    private readonly registryProvider: RegistryProvider,
    private readonly openIdProvider: OpenIDProvider,
    private readonly reflector: Reflector,

    /**
     * @dev Inject documents
     */
    private readonly TrailDocument: Model<TrailDocument>,
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,
  ) {}

  /**
   * @dev for get more information about current endpoint
   * @param context
   */
  public bindExecutionContext(context: ExecutionContext) {
    this.executionContext = context;

    /**
     * @dev Bind request for each protocol
     */
    switch (context.getType()) {
      case 'ws':
        this.bindRequest(context.switchToWs().getClient());
        break;

      default:
        this.bindRequest(context.switchToHttp().getRequest());
        break;
    }

    /**
     * @dev Load context
     */
    this.loadContext();
  }

  /**
   * @dev Bind request
   * @param request
   */
  public bindRequest(request: FastifyRequest | Socket) {
    this.request = request;
  }

  private loadContext() {
    /**
     * @dev Extract config
     */
    const config = this.registryProvider.getConfig();

    /**
     * @dev construct the trail context
     */
    const data: Partial<TrailContextEntity> = {
      apiVersion: config.API_VERSION,
      eventSource: config.DOMAIN,
      eventTime: new Date(),
      tags: [],
    };

    /**
     * @dev transform to class
     */
    this.context = plainToInstance(TrailContextEntity, data);

    /**
     * @dev load current user
     */
    this.loadSession();

    /**
     * @dev custom load for each protocol
     * - ExecutionContext not alway created for using, add other detection
     */
    let requestType = this.executionContext?.getType();

    /**
     * @dev Label the request type
     */
    if (!requestType) {
      if (this.request instanceof Socket) requestType = 'ws';
      else requestType = 'http';
    }

    /**
     * @dev Load context accordingly
     */
    switch (requestType) {
      case 'http':
        this.loadHttpContext();
        break;
      case 'ws':
        this.loadWsContext();
        break;
    }

    /**
     * @dev load detail of current endpoint
     */
    this.loadApiProperties();
  }

  /**
   * @dev load current user and session if has
   */
  private loadSession() {
    const actor = (this.request as any).user as KeycloakAuthSession;
    /**
     * @dev Skip load session user info for open endpoint
     */
    if (!actor) return;
    const { user } = actor;

    this.actorId = user.sub;
    this.context.userGroup = user.group || [];
    this.context.tags.push(...this.context.userGroup);
  }

  /**
   * @dev custom load for HTTP
   */
  private loadHttpContext() {
    const req = this.request as FastifyRequest;
    /**
     * @dev load IP and user-agent from request
     */
    this.context.userIpAddress = req.ip;
    this.context.userAgent = req.headers['user-agent'];
    this.context.apiPath = req.routerPath;
  }

  /**
   * @dev custom load for Web socket
   */
  private loadWsContext() {
    const client = this.request as Socket;
    /**
     * @dev load IP and user-agent from handshake request
     */
    const handshake = client.handshake;
    this.context.userIpAddress = handshake.address;
    this.context.userAgent = handshake.headers['user-agent'];
    /**
     * @dev extract the socket path
     * Eg. '/wallet/ws/?EIO=4&transport=websocket' to '/wallet/ws/'
     */
    this.context.apiPath = client.request.url.split('?')[0];
  }

  /**
   * @dev load details of current endpoint
   * 1) Verify that ExecutionContext created (passes all guards)
   * 2) Extract controller details
   */
  private loadApiProperties() {
    if (!this.executionContext) return;

    this.eventType = this.reflector.get<EventType>(
      EventType,
      this.executionContext.getHandler(),
    );
  }

  /**
   * @param data additional event data
   * @returns sanitized additional event data
   */
  private static removeSensitiveContent(data: any) {
    /**
     * @dev Check if data isn't an object
     */
    if (!data || !isObject(data)) return data;

    /**
     * @dev Remove password
     */
    const modData: any = { ...data };
    if (modData.requestBody?.password) delete modData.requestBody.password;

    /**
     * @dev Return data
     */
    return modData;
  }

  public async log(data: LogData): Promise<void> {
    /**
     * @dev create new trail model
     */
    const doc = new this.TrailDocument({
      ...data,
      additionalEventData: AuditLoggerService.removeSensitiveContent(
        data.additionalEventData,
      ),
      context: { ...this.context },
      actorId: this.actorId,
      eventType: this.eventType,
    });

    /**
     * @dev store the trail
     */
    await doc.save();
  }

  public async updateUserActivity() {
    /**
     * @dev If not actor id
     */
    if (!this.actorId) return;

    try {
      /**
       * @dev Extract jwt payload
       */
      const jwtPayload = await this.extractJwtPayloadFromRequest(this.request);

      /**
       * @dev Update or create the user activity log
       */
      await this.ExtendedSessionDocument.updateOne(
        { userId: this.actorId, sessionOrigin: jwtPayload.sid },
        {
          userGroup: this.context.userGroup,
          lastActiveTime: new Date(),
          $addToSet: {
            userIpAddress: [this.context.userIpAddress],
            userAgent: [this.context.userAgent],
          },
        },
        { upsert: true },
      );
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @dev Extract jwt and introspect the jwt.
   * @param request
   * @private
   */
  private async extractJwtPayloadFromRequest(
    request: FastifyRequest | Socket,
  ): Promise<JWTPayload> {
    let authJwt;

    /**
     * @dev Introspect token.
     */
    if (request instanceof Socket) {
      authJwt = (request as Socket).handshake.headers.authorization.replace(
        'Bearer ',
        '',
      );
    } else {
      authJwt = (request as FastifyRequest).headers.authorization.replace(
        'Bearer ',
        '',
      );
    }

    return this.openIdProvider.instance.introspect(authJwt);
  }
}

/**
 * @dev Factory class for storing and getting audit logger instance
 */
@Global()
export class AuditLoggerContextMap {
  private contextMap: Record<string, AuditLoggerService> = {};

  constructor(
    /**
     * @dev Inject providers
     */
    private readonly registryProvider: RegistryProvider,
    private readonly reflector: Reflector,
    private readonly openIdProvider: OpenIDProvider,

    /**
     * @dev Inject documents
     */
    @InjectModel(TrailModel.name)
    private readonly TrailDocument: Model<TrailDocument>,
    @InjectModel(ExtendedSessionModel.name)
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,
  ) {}

  public getOrCreate(requestId: string): AuditLoggerService {
    /**
     * @dev return existed
     */
    if (this.contextMap[requestId]) return this.contextMap[requestId];
    /**
     * @dev create one
     */
    this.contextMap[requestId] = new AuditLoggerService(
      this.registryProvider,
      this.openIdProvider,
      this.reflector,
      this.TrailDocument,
      this.ExtendedSessionDocument,
    );
    /**
     * @dev return instance
     */
    return this.contextMap[requestId];
  }

  /**
   * @dev for cleanup after used
   * @param requestId id of current request
   */
  public cleanup(requestId: string) {
    if (this.contextMap[requestId]) {
      new UtilsProvider().withTimeout(() => {
        delete this.contextMap[requestId];
      }, Duration.fromObject({ minutes: 2 }).toMillis());
    }
  }
}
