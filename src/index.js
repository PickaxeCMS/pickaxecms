import React from 'react';
import ReactDOM from 'react-dom';
// import { BrowserRouter as Router } from 'react-router-dom';
import {Routes} from './Routes';
import './index.css';
require('dotenv').config();

ReactDOM.render(
  <div>
    <Routes />
  </div>
  ,
  document.getElementById('root')
);
