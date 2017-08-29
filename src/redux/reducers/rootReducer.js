import { combineReducers } from 'redux'
import {
  SELECT_PAGE,
  INVALIDATE_PAGE,
  EDIT_PAGE,
  STOP_EDIT_PAGE,
  REQUEST_POSTS,
  RECEIVE_POSTS
} from '../actions/divisionsActions'

function selectedPage(state = 'site_plan', action) {
  switch (action.type) {
    case SELECT_PAGE:
      return action.page
    default:
      return state
  }
}

function isEditing(state = false, action) {
  switch (action.type) {
    case EDIT_PAGE:
      return true
    case STOP_EDIT_PAGE:
      return false
    default:
      return state
  }
}

function divisions(
  state = {
    isFetching: false,
    didInvalidate: false,
    items: [],
    navItems: []
  },
  action
) {
  console.log('ACTIONS', action)
  switch (action.type) {
    case INVALIDATE_PAGE:
      return Object.assign({}, state, {
        didInvalidate: true
      })
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      })
    case RECEIVE_POSTS:
      if(action.navItems){
        return Object.assign({}, state, {
          isFetching: false,
          didInvalidate: false,
          items: action.divisions,
          navItems: action.navItems,
          lastUpdated: action.receivedAt
        })
      }
      else{
        return Object.assign({}, state, {
          isFetching: false,
          didInvalidate: false,
          items: action.divisions,
          lastUpdated: action.receivedAt
        })
      }
    default:
      return state
  }
}

function divisionsBypage(state = {}, action) {
  switch (action.type) {
    case INVALIDATE_PAGE:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        [action.page]: divisions(state[action.page], action)
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  divisionsBypage,
  selectedPage,
  isEditing
})

export default rootReducer
