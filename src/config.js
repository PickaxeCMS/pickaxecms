export default {
  apiGateway: {
    URL: 'https://6z4midsahg.execute-api.us-east-1.amazonaws.com/prod',
    REGION: 'us-east-1',
  },
  cognito: {
    IDENTITY_POOL_ID: 'us-east-1:57b62c6f-0627-4847-8e0a-f24788006e8a',
    REGION: 'us-east-1',
    USER_POOL_ID : 'us-east-1_yCqOxyVjm',
    APP_CLIENT_ID : 'i2tnvcl235k6ekc0429varbac',
  },
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    BUCKET: 'ampsight-uploads'
  }
};
