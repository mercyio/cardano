import { Twilio } from 'twilio';
import { ENVIRONMENT } from '../configs/environment';

export const TwilioSms = async (phoneNumber: string, template: string) => {
  const client = new Twilio(
    ENVIRONMENT.TWILLO.ACCOUNT_ID,
    ENVIRONMENT.TWILLO.AUTH_TOKEN,
  );

  await client.messages.create({
    body: template,
    from: ENVIRONMENT.TWILLO.FROM,
    to: `${phoneNumber}`,
  });

  return;
};
