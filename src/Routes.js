import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route ,browserHistory,  } from 'react-router'
// import { syncHistoryWithStore } from 'react-router-redux'

import Login from './containers/Login/Login';
import NotFound from './containers/NotFound/NotFound';

import AppliedRoute from './components/AppliedRoute';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';

import configureStore, { client } from './redux/store/configureStore'

import {
    // non protected views
    Home,
    Pages
  } from './containers'

const store = configureStore()
// const syncedHistory = syncHistoryWithStore(browserHistory, store)

export const Routes = ({ childProps }) => {
  return (
    <Provider store={store} client={client}>
      <Router history={browserHistory}>
        <AppliedRoute path="/" exact component={Home}  />
        <UnauthenticatedRoute path="/login" exact component={Login} />
        <Route path="/pages/:id" exact component={Pages} />
        <Route component={NotFound} />
      </Router>
    </Provider>
)};
