import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Routes }  from '../Routes';
import { Sidebar, Menu, Image, Dropdown, Icon, Segment } from 'semantic-ui-react'
import { CognitoUserPool, } from 'amazon-cognito-identity-js';
import config from '../config.js';
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive';
import {
  fetchDivisionsIfNeeded
} from '../redux/actions/divisionsActions'
import AWS from 'aws-sdk';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userToken: null,
      isLoadingUserToken: true
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.selectedPage !== prevProps.selectedPage) {
      const { dispatch, selectedPage } = this.props
      dispatch(fetchDivisionsIfNeeded(selectedPage))
    }
  }

  async componentDidMount() {
    console.log('REACT_APP_NAME', process.env.REACT_APP_NAME)
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
  handleLogout = (event) => {
    const currentUser = this.getCurrentUser();

    if (currentUser !== null) {
      currentUser.signOut();
    }
    if (AWS.config.credentials) {
      AWS.config.credentials.clearCachedId();
    }
    this.updateUserToken(null);
   const {router} = this.context;
   router.push({ pathname: `/` })
  }

  render() {

    var { navItems } = this.props;

    if(!navItems){
      navItems = []
    }

  return (
      <nav className="navbar navbar-default" style={{marginBottom:45, marginLeft:-14, backgroundColor: '#1B1C1D', width:'100vw', top:0, zIndex:500, position:'fixed'}}>
        <Menu inverted secondary style={{width:'100vw'}}>
          <Menu.Item href='/' style={{height:50}}>
            <Image src={process.env.REACT_APP_LOGO} style={{width:'30px', height:'30px', marginTop: '0px', marginLeft:0, cursor:'pointer'}}/>
            <h3 style={{color:'white', marginTop: '0px', marginLeft:5, cursor:'pointer'}}>{process.env.REACT_APP_NAME}</h3>
          </Menu.Item>
            <MediaQuery minDeviceWidth={1224} style={{width:"100%"}}>
              {
                Object.keys(navItems).map(function(key) {
                    var href = '/pages/' + key
                    return (
                      <Menu.Item href={href} name={navItems[key].displayName} key={key} style={{float: 'left', height:50}}>
                        {navItems[key].displayName}
                      </Menu.Item>)
                })
              }
              {
                this.state.userToken
                ?
                <Menu.Item name='Login' position='right' style={{float: 'right', height:50}} onClick={this.handleLogout} href='/login'>
                  Logout
                </Menu.Item>
                :
                <Menu.Item name='Login' position='right' style={{float: 'right', height:50}} onClick={this.handleNavLink} href='/login'>
                  Login
                </Menu.Item>
              }
            </MediaQuery>
            <Menu.Item position='right' name='Admin Toolbar'>

              <MediaQuery maxDeviceWidth={1224}>
                <Dropdown item id="navbar" icon='content' simple>
                  <Dropdown.Menu style={{right: 0, left: 'auto'}}>
                    {
                      Object.keys(navItems).map(function(key) {
                          var href = '/pages/' + key
                          return (
                            <Dropdown.Item href={href} name={navItems[key].displayName} key={key} style={{backgroundColor: '#1B1C1D', color:'white'}}>
                              {navItems[key].displayName}
                            </Dropdown.Item>)
                      })
                    }
                    {
                      this.state.userToken
                      ?
                      <Dropdown.Item name='Login' position='right' onClick={this.handleLogout} href='/login'>
                        Logout
                      </Dropdown.Item>
                      :
                      <Dropdown.Item name='Login' position='right' onClick={this.handleNavLink} href='/login'>
                        Login
                      </Dropdown.Item>
                    }
                  </Dropdown.Menu>
                </Dropdown>
              </MediaQuery>
            </Menu.Item>
          </Menu>
      </nav>
    );
  }
}
Navbar.propTypes = {
    selectedPage: PropTypes.string.isRequired,
    children: PropTypes.node,
    history: PropTypes.object,
    actions: PropTypes.object,
    divisions: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
    lastUpdated: PropTypes.number,
    isFetching: PropTypes.bool.isRequired,
}

Navbar.contextTypes = {
    router: PropTypes.object
}
const mapStateToProps = state => {
    const { selectedPage, divisionsBypage } = state
    const {
      isFetching,
      lastUpdated,
      items: divisions,
      navItems
    } = divisionsBypage['site_plan'] || {  ///Always show navbar
      isFetching: true,
      items: []
    }

    return {
      selectedPage,
      divisions,
      navItems,
      isFetching,
      lastUpdated
    }
}

export default connect(mapStateToProps)(Navbar);
