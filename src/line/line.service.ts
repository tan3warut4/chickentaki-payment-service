import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';

@Injectable()
export class LineService {

  private readonly baseUrl = process.env.LINE_BASE_URL;
  private readonly accessToken = process.env.LINE_ACCESS_TOKEN;
  private readonly adminId = process.env.LINE_ADMIN_ID;

  private getRequestConfig(): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
  }

  private handleApiError(error: any, action: string): void {
    console.error(`Error ${action}:`, error.response?.data || error.message);
  }

  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const events = req.body.events;

    for (const event of events) {
      const userId = event.source?.userId;

      if (!userId) continue;

      if (event.type === 'follow') {
        try {
          if (event.type === 'follow') {
            const profile = await this.getUserProfile(userId);
            console.log('User profile:', profile);
            console.log('New follower userId:', userId);
            await this.sendMenuLink(userId, profile)
          }
          if (event.type === 'message') {
            const message = event.message.text;
            console.log(`Message from ${userId}: ${message}`);
            const profile = await this.getUserProfile(userId);
            console.log('User profile:', profile);
            await this.sendMenuLink(userId, profile)
            await this.notifyAdmin(profile, message)
            // Handle message if needed
          }
        } catch (error) {
          console.error('Error handling event:', error.message);
        }
      }

      return res.status(HttpStatus.OK).send('OK');
    }
  }

  private async getUserProfile(userId: string) {
    const url = `${this.baseUrl}/profile/${userId}`;
    const config = this.getRequestConfig();

    try {
      const response = await axios.get(url, config);
      return response.data.displayName;
    } catch (error) {
      this.handleApiError(error, 'fetching user profile');
      throw error;
    }
  }

  private async sendMenuLink(userId: string, profile: string): Promise<void> {
    const message = `🎉 Welcome! ${profile} Here’s your menu: https://yourdomain.com/menu?userId=${userId}`;
    await this.sendMessage(userId, message);
  }

  private async notifyAdmin(profile: string, message: string): Promise<void> {
    const adminMessage = `Customer: ${profile}\nMessage: ${message}`;
    if (!this.adminId) {
      console.error('Admin ID is not defined. Unable to send admin message.');
      return;
    }
    await this.sendMessage(this.adminId, adminMessage);
  }
  
  private async sendUpdateStatus(userId: string, status: string): Promise<void> {
    const message = `Your order is now ${status}. We will notify you of any updates!`;
    await this.sendMessage(userId, message);
  }

  private async sendMessage(to: string, text: string): Promise<void> {
    const url = `${this.baseUrl}/message/push`;
    const config = this.getRequestConfig();
    const data = {
      to,
      messages: [{ type: 'text', text }],
    };

    try {
      await axios.post(url, data, config);
    } catch (error) {
      this.handleApiError(error, 'sending message');
      throw error;
    }
  }

}
