import { Injectable } from '@nestjs/common';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import * as dotenv from 'dotenv';
dotenv.config();

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SQS_QUEUE_URL } =
  process.env;

@Injectable()
export class SqsService {
  private readonly client = new SQSClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
  });
  private readonly queueUrl = SQS_QUEUE_URL!;

  async sendUserCreatedChat(creatorId: number, chatId: number) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify({
        event: 'chat_created',
        data: {
          creatorId,
          chatId,
        },
      }),
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
