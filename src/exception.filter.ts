import {
  ArgumentsHost,
  Catch,
  ContextType,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

import { AxiosError } from 'axios';
import { MongoError } from 'mongodb';
import { errors } from 'openid-client';
import { Socket } from 'socket.io';
import { FastifyRequest, FastifyReply } from 'fastify';

interface IError {
  statusCode: number | string;
  message: string;
  error: string;
}

class ExceptionResponseBuilder {
  private readonly type: ContextType;
  private request?: FastifyRequest;
  statusCode?: HttpStatus | string | number;
  error?: any;
  errorType?: any;
  message?: any;

  constructor(host: ArgumentsHost) {
    /**
     * @dev Extracting contexts.
     */
    this.type = host.getType();
    switch (this.type) {
      case 'http':
        const httpCtx = host.switchToHttp();
        this.request = httpCtx.getRequest();
        break;
    }
  }

  /**
   * @param exception The error of Mongo
   * @returns ExceptionResponseBuilder
   */
  public fromMongoError(exception: MongoError): ExceptionResponseBuilder {
    this.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    this.error = exception.errorLabels;
    this.message = exception.errmsg;
    return this;
  }

  /**
   * @param exception The error of Axios
   * @returns ExceptionResponseBuilder
   */
  public fromAxiosError(exception: AxiosError): ExceptionResponseBuilder {
    this.error = exception.response.statusText;
    this.message = exception.response.data;
    this.statusCode = exception.response.status;
    return this;
  }

  /**
   * @param exception the OP Errors (raised by OpenID clients)
   * @returns ExceptionResponseBuilder
   */
  public fromOPError(exception: errors.OPError): ExceptionResponseBuilder {
    this.error = exception.name;
    this.message = exception.message;
    this.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    return this;
  }

  /**
   * @param exception Others exceptions
   * @returns ExceptionResponseBuilder
   */
  public fromOthers(
    exception: HttpException | WsException,
  ): ExceptionResponseBuilder {
    try {
      if (exception instanceof WsException) {
        this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        this.error = exception.getError();
        this.message = exception.message;
      } else {
        const error = exception.getResponse() as IError;
        this.statusCode = error.statusCode;
        this.error = error.error;
        this.message = error.message;
      }
    } catch (e) {
      this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      this.message = exception.message;
      this.error = exception.name;
    }
    return this;
  }

  /**
   * @param exception any kind of the exception incoming
   * @returns ExceptionResponseBuilder
   */
  public detectException(exception: any): ExceptionResponseBuilder {
    /**
     * @dev Handle MongoError exception.
     */
    if (exception instanceof MongoError) {
      return this.fromMongoError(exception);
    }

    /**
     * @dev Handle Axios exception.
     */
    if ((exception as AxiosError).isAxiosError) {
      return this.fromAxiosError(exception as AxiosError);
    }

    /**
     * @dev Handle OP Errors (raised by OpenID clients)
     */
    if (exception instanceof errors.OPError) {
      return this.fromOPError(exception as errors.OPError);
    }

    /**
     * @dev Handle other errors.
     */
    return this.fromOthers(exception);
  }

  /**
   * @description Get exception response message method
   * @returns ExceptionResponse
   */
  getResponseMessage() {
    switch (this.type) {
      case 'http':
        return {
          statusCode: this.statusCode,
          path: this.request.url,
          errorType: this.error,
          message: this.message,
        };
      case 'ws':
        return new WsException({
          statusCode: this.statusCode,
          error: this.error,
          message: this.message,
        });
    }
  }
}

/**
 * @dev Handle exception filter and builder.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    /**
     * @dev response builder
     */
    const error = new ExceptionResponseBuilder(host).detectException(exception);

    /**
     * @dev Return response
     */
    const response = ctx.getResponse<FastifyReply>();
    response.status(+error.statusCode).send(error.getResponseMessage());
  }
}

/**
 * @dev Handle web socket exception filter and builder.
 */
@Catch()
export class AllWsExceptionsFilter extends BaseWsExceptionFilter {
  constructor() {
    super();
  }

  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const socket = ctx.getClient<Socket>();

    /**
     * @dev response builder
     */
    const error = new ExceptionResponseBuilder(host).detectException(exception);

    /**
     * @dev Return response
     */
    super.catch(error.getResponseMessage(), host);

    /**
     * @dev Close client connect
     */
    socket.disconnect();
  }
}
