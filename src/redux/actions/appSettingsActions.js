import { invokeApig } from '../../libs/awsLib';
import  _  from 'lodash';

export const REQUEST_APP_SETTINGS = 'REQUEST_APP_SETTINGS'
export const RECEIVE_APP_SETTINGS = 'RECEIVE_APP_SETTINGS'

function requestAppSettings(page) {
  return {
    type: REQUEST_APP_SETTINGS,
    page
  }
}
function receiveAppSettings(page) {
  return {
    type: RECEIVE_APP_SETTINGS,
    page
  }
}

function receiveAppSettings(page, json) {
    var sitePlan = json;
    var settings = {};
    console.log('receiveAppSettings', sitePlan)
    _.some(sitePlan, function(o) {
      if(_.has(o, "appSettings")){
        console.log('OOOOOOOOOOOOOOOOO', o)
        if(o.appSettings){
          console.log('XXXXXXXXXXXXXXXXXX', o.appSettings)
          settings = o.appSettings;
        }
      }
    })
    console.log('settings-------------', settings)
    return {
      type: RECEIVE_APP_SETTINGS,
      settings: settings,
      page: page,
      receivedAt: Date.now()
    }
}

export function fetchAppSettings(page) {
  return dispatch => {
    dispatch(requestAppSettings('site_plan'))
    return invokeApig({ path: '/posts', queryParams:{'pageId': 'site_plan', id:'site_plan', "TableName": process.env.REACT_APP_AppName} }, '')
      .then(json => {dispatch(receiveAppSettings('site_plan', json))})
  }
}
