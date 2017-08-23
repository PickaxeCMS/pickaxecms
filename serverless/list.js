import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context, callback) {
  console.log('event _____', event);
  console.log('context _____ ', context);
  const params = {
    TableName: 'ampsight',
    KeyConditionExpression: "pageId = :pageId",
    ExpressionAttributeValues: {
      ":pageId": event.queryStringParameters.pageId,
    }
  };

  try {
    const result = await dynamoDbLib.call('query', params);
    console.log('Params --->', params)
    // Return the matching list of items in response body
    console.log('items retrieved ---->', result.Items)
    callback(null, success(result.Items));
  }
  catch(e) {
    callback(null, failure({status: false}));
  }
};
