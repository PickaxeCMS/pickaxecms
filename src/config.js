export default {
  apiGateway: {
    URL: process.env.REACT_APP_ServiceEndpoint,
    REGION: process.env.REACT_APP_AWS_REGION,
  },
  cognito: {
    IDENTITY_POOL_ID: process.env.REACT_APP_IdentityPoolId,
    REGION: process.env.REACT_APP_AWS_REGION,
    USER_POOL_ID : process.env.REACT_APP_UserPoolId,
    APP_CLIENT_ID : process.env.REACT_APP_AppClientId,
  },
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    BUCKET: process.env.REACT_APP_UploadsBucket
  }
};
