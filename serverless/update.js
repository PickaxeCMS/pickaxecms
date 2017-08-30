import * as dynamoDbLib from './libs/dynamodb-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  console.log('data =====>', data)
  const params = {
    TableName: event.queryStringParameters.TableName,
    Key: {
      pageId: event.queryStringParameters.pageId,
      id: event.pathParameters.id,
    },
    UpdateExpression: 'SET sections = :sections,\
    divisions = :divisions,\
    displayName = :displayName,\
    category = :category,\
    appSettings = :appSettings,\
    navItems = :navItems ',
    ExpressionAttributeValues: {
      ':divisions': data.divisions ? data.divisions : null,
      ':displayName': data.displayName ? data.displayName : null,
      ':category': data.category ? data.category : null,
      ':appSettings': data.appSettings ? data.appSettings : null,
      ':sections': data.sections ? data.sections : null,
      ':navItems': data.navItems ? data.navItems : null
    },
    ReturnValues: 'ALL_NEW',
  };
  console.log('update params ----->', params)

  try {
    const result = await dynamoDbLib.call('update', params);
    console.log('update result ----->', result)
    callback(null, success({status: true}));
  }
  catch(e) {
    console.log('failed update ----->', e)
    callback(null, failure({status: false}));
  }
};
