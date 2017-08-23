import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context, callback) {
  console.log('event _____>', event);

  const params = {
    TableName: 'ampsight',
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      pageId: event.queryStringParameters.pageId,
      id: event.pathParameters.id,
    },
  };

  try {
    const result = await dynamoDbLib.call('get', params);
    console.log('Params --->', params)
    if (result.Item) {
      console.log('item retrieved ---->', result.Item)
      callback(null, success(result.Item));
    }
    else {
      callback(null, failure({status: false, error: 'Item not found.'}));
    }
  }
  catch(e) {
    callback(null, failure({status: false}));
  }
};
