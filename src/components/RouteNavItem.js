import React from 'react';
import { Route } from 'react-router-dom';
import { Menu } from 'semantic-ui-react'

export default (props) => (
  <Route path={props.href} exact children={({ match }) => (
    <Menu.Item {...props}>{ props.children }</Menu.Item>
  )}/>
);
