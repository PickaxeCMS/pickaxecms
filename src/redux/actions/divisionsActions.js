import { invokeApig } from '../../libs/awsLib';
import  _  from 'lodash';

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_PAGE = 'SELECT_PAGE'
export const INVALIDATE_PAGE = 'INVALIDATE_PAGE'
export const EDIT_PAGE = 'EDIT_PAGE'
export const STOP_EDIT_PAGE = 'STOP_EDIT_PAGE'

export function selectPage(page) {
  return {
    type: SELECT_PAGE,
    page
  }
}

export function invalidatepage(page) {
  return {
    type: INVALIDATE_PAGE,
    page
  }
}

function requestDivisions(page) {
  return {
    type: REQUEST_POSTS,
    page
  }
}
export function editPage(page) {
  return {
    type: EDIT_PAGE,
    page
  }
}
export function stopEditPage(page) {
  return {
    type: STOP_EDIT_PAGE,
    page
  }
}

function receiveDivisions(page, json) {
  var divisions = json;
  var navItemsOrderObject = {}
  _.some(divisions, function(o) {
    if(_.has(o, "navItems")){
      if(o.navItems){
        navItemsOrderObject = o;
        var navItemsOrderIndex = divisions.indexOf(o)
        divisions.splice(navItemsOrderIndex, 1)
        // var groups = _.groupBy(divisions, 'id');
        // divisions = _.map(navItemsOrderObject.navItems, function (i) { if(groups[i]){return groups[i].shift()}; });
      }
    }
  })
  if(!navItemsOrderObject.navItems){
    return {
      type: RECEIVE_POSTS,
      divisions: divisions,
      page: page,
      receivedAt: Date.now()
    }
  }
  else{
    return {
      type: RECEIVE_POSTS,
      navItems: navItemsOrderObject.navItems,
      page: page,
      divisions: divisions,
      receivedAt: Date.now()
    }
  }
}

function fetchDivisions(page) {
  return dispatch => {
    dispatch(requestDivisions(page))
    return invokeApig({ path: '/posts', queryParams:{'pageId': page, "TableName": process.env.REACT_APP_AppName} }, '')
      .then(json => { dispatch(receiveDivisions(page, json))})
  }
}

function shouldFetchDivisions(state, page) {
  // const divisions = state.divisionsBypage[page]
  // if (!divisions) {
    return true
  // }
  // else if (divisions.isFetching) {
  //   return false
  // }
  // else {
  //   return divisions.didInvalidate
  // }
}

export function fetchDivisionsIfNeeded(page) {
  return (dispatch, getState) => {
    if (shouldFetchDivisions(getState(), page)) {
      return dispatch(fetchDivisions(page))
    }
  }
}
