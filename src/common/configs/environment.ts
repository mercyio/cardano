import * as dotenv from 'dotenv';
dotenv.config();

export interface IEnvironment {
  APP: {
    NAME: string;
    PORT: number | string;
    ENV: string;
    ENCRYPTION_KEY: string;
  };
  DB: {
    URL: string;
  };
  JWT: {
    SECRET: string;
  };
  SMTP: {
    HOST: string;
    PORT: string;
    EMAIL: string;
    USER: string;
    PASSWORD: string;
  };
  AWS: {
    REGION: string;
    ACCESS_KEY: string;
    SECRET: string;
    BUCKET_NAME: string;
    BUCKET_URL: string;
  };
  REDIS: {
    URL: string;
  };
  TWILLO: {
    ACCOUNT_ID: string;
    AUTH_TOKEN: string;
    FROM: string;
  };
  FLUTTERWAVE: {
    HOST: string;
    SECRET_KEY: string;
    WEBHOOK_SECRET: string;
  };
  PAYSTACK: {
    HOST: string;
    SECRET_KEY: string;
  };
}

export const ENVIRONMENT: IEnvironment = {
  APP: {
    NAME: process.env.APP_NAME,
    PORT: process.env.PORT || process.env.APP_PORT || 3000,
    ENV: process.env.APP_ENV,
    ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY,
  },
  DB: {
    URL: process.env.DB_URL,
  },
  JWT: {
    SECRET: process.env.JWT_SECRET,
  },
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    EMAIL: process.env.SMTP_EMAIL,
    USER: process.env.SMTP_USER,
    PASSWORD: process.env.SMTP_PASSWORD,
  },
  AWS: {
    REGION: process.env.AWS_REGION,
    ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    SECRET: process.env.AWS_SECRET,
    BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    BUCKET_URL: process.env.AWS_BUCKET_URL,
  },
  REDIS: {
    URL: process.env.REDIS_URL,
  },
  TWILLO: {
    ACCOUNT_ID: process.env.TWILLO_ACCOUNT_ID,
    AUTH_TOKEN: process.env.TWILLO_AUTH_TOKEN,
    FROM: process.env.TWILLO_FROM_NUMBER,
  },
  FLUTTERWAVE: {
    HOST: process.env.FLUTTERWAVE_HOST,
    SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
    WEBHOOK_SECRET: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
  },
  PAYSTACK: {
    HOST: process.env.PAYSTACK_HOST,
    SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  },
};

export const isDevEnvironment = ['development', 'dev', 'staging'].includes(
  ENVIRONMENT.APP.ENV?.toLowerCase(),
);
