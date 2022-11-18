import { Injectable } from '@nestjs/common';

import * as NodeMailer from 'nodemailer';
import * as EmailInstance from 'email-templates';
import * as path from 'path';
import JSONTransport from 'nodemailer/lib/json-transport';
import { RegistryProvider } from './registry.provider';

/**
 * @dev Declare the email template enum.
 */
export enum EmailTemplate {
  RESET_PASSWORD_VIA_EMAIL = 'reset-password-via-email',
  VERIFY_EMAIL_OTP = 'verify-email-otp',
}

/**
 * @dev Declare the email provider.
 */
@Injectable()
export class EmailProvider {
  /**
   * @dev Initialize Email provider with injected config service.s
   * @param registryProvider
   */
  constructor(private registryProvider: RegistryProvider) {}

  /**
   * @dev Construct transporter.
   * @private
   */
  private getTransporter() {
    /**
     * @dev Disable email transporter in test env and use json instead.
     */
    if (this.registryProvider.getConfig().NODE_ENV === 'test') {
      return {
        jsonTransport: true,
      } as JSONTransport.Options;
    }

    /**
     * @dev Use nodemailer transporter for non-test env.
     */
    return NodeMailer.createTransport({
      host: this.registryProvider.getConfig().SMTP_EMAIL_HOST,
      port: Number(this.registryProvider.getConfig().SMTP_EMAIL_PORT),
      secure: Boolean(this.registryProvider.getConfig().SMTP_EMAIL_TLS_ENABLED), // true for 465, false for other ports
      auth: {
        user: this.registryProvider.getConfig().SMTP_EMAIL_USERNAME, // generated ethereal user
        pass: this.registryProvider.getConfig().SMTP_EMAIL_PASSWORD, // generated ethereal password
      },
    });
  }

  /**
   * @dev Send mail with contexts.
   * @param templateName
   * @param context
   * @param sendTo
   * @param attachments
   */
  sendEmail<T>(
    templateName: EmailTemplate,
    context: T,
    sendTo: string[],
    attachments: any[] = [],
  ) {
    /**
     * @dev Construct email sender with credentials.
     */
    const emailInstance = new EmailInstance({
      message: {
        from: `${
          this.registryProvider.getConfig().SMTP_EMAIL_FROM_EMAIL_NAME
        } <${this.registryProvider.getConfig().SMTP_EMAIL_FROM_EMAIL}>`,
        sender: this.registryProvider.getConfig().SMTP_EMAIL_FROM_EMAIL,
        replyTo: this.registryProvider.getConfig().SMTP_EMAIL_FROM_EMAIL,
        inReplyTo: this.registryProvider.getConfig().SMTP_EMAIL_FROM_EMAIL,
      },
      send: true,
      transport: this.getTransporter(),
    });

    /**
     * @dev Send email.
     */
    return emailInstance.send({
      template: path.join(
        __dirname,
        '../assets/email-templates/',
        templateName,
      ),
      message: {
        to: sendTo,
        attachments,
      },
      locals: context as any,
    });
  }

  /**
   * @dev To send reset password email.
   * @param context
   * @param email
   */
  async sendResetPasswordEmail(
    context: { email: string; resetPasswordLink: string },
    email: string,
  ): Promise<void> {
    /**
     * @dev Use nodemailer provider to send the email.
     */
    await this.sendEmail(
      EmailTemplate.RESET_PASSWORD_VIA_EMAIL,
      context,
      [email],
      [],
    );
  }

  /**
   * @dev Send verification email.
   * @param context
   * @param email
   */
  async sendVerificationEmail(
    context: { token: string },
    email: string,
  ): Promise<void> {
    /**
     * @dev Use nodemailer provider to send the email.
     */
    await this.sendEmail(EmailTemplate.VERIFY_EMAIL_OTP, context, [email], []);
  }
}
