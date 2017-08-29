import AWS from 'aws-sdk';
import config from '../config.js';
import sigV4Client from './sigV4Client';

export function assumeRole(){
   AWS.config.credentials = new AWS.Credentials({accessKeyId:process.env.REACT_APP_K, secretAccessKey:process.env.REACT_APP_SAK})
}


export function getAwsCredentials(userToken) {
  if (AWS.config.credentials && Date.now() < AWS.config.credentials.expireTime - 60000) {
    return;
  }

  const authenticator = `cognito-idp.${config.cognito.REGION}.amazonaws.com/${config.cognito.USER_POOL_ID}`;

  AWS.config.update({ region: config.cognito.REGION });

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: config.cognito.IDENTITY_POOL_ID,
    Logins: {
      [authenticator]: userToken
    }
  });

  return AWS.config.credentials.getPromise();
}


export async function invokeApig(
  { path,
    method = 'GET',
    headers = {},
    queryParams = {},
    body}, userToken) {

  // if(method !== 'GET'){
  //   await getAwsCredentials(userToken);
  // }
  // else{
    await assumeRole();
  // }
  const signedRequest = sigV4Client
    .newClient({
      accessKey: AWS.config.credentials.accessKeyId,
      secretKey: AWS.config.credentials.secretAccessKey,
      sessionToken: AWS.config.credentials.sessionToken,
      region: config.apiGateway.REGION,
      endpoint: config.apiGateway.URL,
    })
    .signRequest({
      method,
      path,
      headers,
      queryParams,
      body
    });

  body = body ? JSON.stringify(body) : body;
  headers = signedRequest.headers;
  const results = await fetch(signedRequest.url, {
    method,
    headers,
    body
  });

  if (results.status !== 200) {
    throw new Error(await results.text());
  }
  console.log('JSON ++++++++', results)
  return results.json();
}

var async = require('async');

var Promise = require('promise');

export async function s3Upload(file) {
  await assumeRole();

  return new Promise((resolve, reject)=>{
    const s3 = new AWS.S3({
        params: {
          Bucket: config.s3.BUCKET,
        }
      });
      var bucketName = config.s3.BUCKET;
    const fileName = `${Date.now()}-${file.name}`;
    var fileSizeInBytes = file.size

    if(fileSizeInBytes < (1024*1024*5)) {
      console.log('Small enough to just upload ')

      return s3.upload({
          Key: fileName,
          Body: file,
          Bucket: bucketName,
          ContentType: file.type,
          ACL: 'public-read',
        }, (err, data)  => {
          resolve(data);
          reject(err);
        });
    }else{
      s3.createMultipartUpload({ Bucket: bucketName, Key: fileName, ACL:'public-read' }, (mpErr, multipart) => {
          if(!mpErr){
            console.log("multipart created", multipart.UploadId);
              var fileData  = file
              var partSize = 1024 * 1024 * 5;
              var parts = Math.ceil(fileData.size / partSize);

              async.timesSeries(parts, (partNum, next) => {

                var rangeStart = partNum*partSize;
                // var end = Math.min(rangeStart + partSize, fileData.length);

                console.log("uploading ", fileName, " % ", (partNum/parts).toFixed(2));

                partNum++;
                async.retry((retryCb) => {
                  var slice = fileData.slice(rangeStart, rangeStart + partSize);
                  s3.uploadPart({
                    Body: slice,
                    Key: fileName,
                    Bucket: bucketName,
                    PartNumber: partNum,
                    UploadId: multipart.UploadId
                  }, (err, mData) => {
                    retryCb(err, mData);
                  });
                }, (err, data)  => {
                  next(err, {ETag: data.ETag, PartNumber: partNum});
                });

              }, (err, dataPacks) => {
                return s3.completeMultipartUpload({
                  Key: fileName,
                  Bucket: bucketName,
                  MultipartUpload: {
                    Parts: dataPacks
                  },
                  UploadId: multipart.UploadId
                }, (err, data)  => {
                  resolve(data);
                  reject(err);
                });
              });
          }else{
            reject(mpErr);
          }
        });
    }
  })
}
