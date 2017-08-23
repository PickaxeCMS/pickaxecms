divisionimport React, { Component, PropTypes } from 'react';
import {
  withRouter
} from 'react-router-dom';
import './App.css';
import { bindActionCreators } from 'redux'

import { Routes }  from './Routes';
import { Sidebar, Menu, Image } from 'semantic-ui-react'
import { CognitoUserPool, } from 'amazon-cognito-identity-js';
import config from './config.js';
import { connect } from 'react-redux'
import logo from './media/logo.png'
import RouteNavItem from './components/RouteNavItem';
import AWS from 'aws-sdk';
import {
  selectPage,
  fetchDivisionsIfNeeded,
  invalidatepage
} from './redux/actions/divisionsActions'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userToken: null,
      isLoadingUserToken: true,
    };
  }

  componentWillMount(){
    this.props.dispatch(selectPage('site_plan'))
    this.props.dispatch(fetchDivisionsIfNeeded('site_plan'))
  }

  componentDidMount() {
    const { dispatch, selectedPage } = this.props
    dispatch(fetchDivisionsIfNeeded(selectedPage))
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedPage !== prevProps.selectedPage) {
      const { dispatch, selectedPage } = this.props
      dispatch(fetchDivisionsIfNeeded(selectedPage))
    }
  }

  async componentDidMount() {
    const currentUser = this.getCurrentUser();

    if (currentUser === null) {
      this.setState({isLoadingUserToken: false});
      return;
    }

    try {
      const userToken = await this.getUserToken(currentUser);
      this.updateUserToken(userToken);
    }
    catch(e) {
      alert(e);
    }

    this.setState({isLoadingUserToken: false});
  }

  getCurrentUser() {
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID
    });
    return userPool.getCurrentUser();
  }

  getUserToken(currentUser) {
    return new Promise((resolve, reject) => {
      currentUser.getSession(function(err, session) {
        if (err) {
            reject(err);
            return;
        }
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }

  updateUserToken = (userToken) => {
    this.setState({
      userToken: userToken
    });
  }

  handleNavLink = (event) => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute('href'));
  }

  handleLogout = (event) => {
    const currentUser = this.getCurrentUser();

    if (currentUser !== null) {
      currentUser.signOut();
    }
    if (AWS.config.credentials) {
      AWS.config.credentials.clearCachedId();
    }
    this.updateUserToken(null);
  }

  render() {
    const childProps = {
    userToken: this.state.userToken,
    updateUserToken: this.updateUserToken,
  };

  return ! this.state.isLoadingUserToken
  &&
  (
      <div className="App container">
        <nav className="navbar navbar-default">
          <Sidebar as={Menu} animation='overlay' direction='top' visible={true} inverted style={{width:"100%", cursor:'pointer'}}>
            <RouteNavItem  onClick={this.handleNavLink} href='/' style={{height:50}}>
              <Image src={logo} style={{width:'35px', height:'35px', marginTop: '0px', marginLeft:0, cursor:'pointer'}}/>
              <h3 style={{color:'white', marginTop: '0px', marginLeft:5, cursor:'pointer'}}>ampsight</h3>
            </RouteNavItem>
            <Menu.Item name='About Us' onClick={() => {
                var element = document.getElementById("About Us");
                element.scrollIntoView()
              }}>
              About Us
            </Menu.Item>
            <Menu.Item name='About Us' onClick={() => {
                var element = document.getElementById("Careers");
                element.scrollIntoView()
              }}>
              Careers
            </Menu.Item>
              <div style={{flexGrow: 1}}>

              </div>

              {
                this.state.userToken
                ?
                <Menu.Item name='Login' onClick={this.handleLogout} href='/login'>
                  Logout
                </Menu.Item>
                :
                <RouteNavItem name='Login' onClick={this.handleNavLink} href='/login'>
                  Login
                </RouteNavItem>
              }
          </Sidebar>
        </nav>
        <Routes />
      </div>
    );
  }
}
App.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    location: PropTypes.object,
    actions: PropTypes.object,
}

App.contextTypes = {
    router: PropTypes.object
}
const mapStateToProps = state => {
    return {
        userToken: state.userToken
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
