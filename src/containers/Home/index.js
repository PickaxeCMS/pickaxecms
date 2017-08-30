import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  selectPage,
  fetchDivisionsIfNeeded,
  invalidatepage
} from '../../redux/actions/divisionsActions'
import {
  fetchAppSettings
} from '../../redux/actions/appSettingsActions'
import MediaQuery from 'react-responsive';
import ReactPlayer from 'react-player'
import { Sidebar, Menu, Image, Dropdown, Icon, Segment, Form, Button, Input, Header } from 'semantic-ui-react'
import Navbar from '../../components/Navbar';
import AdminSidebar from '../../components/AdminSidebar';
import { CognitoUserPool, } from 'amazon-cognito-identity-js';
import config from '../../config.js';
import Divisions from '../../components/Divisions'
import WebFont from 'webfontloader'
import Helmet from "react-helmet";


class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userToken: null,
      appSettings: {},
      showSidebar: false
    }
  }

  componentWillMount(){
    this.props.dispatch(selectPage('site_plan'))
    this.props.dispatch(fetchDivisionsIfNeeded('site_plan'))
    this.props.dispatch(fetchAppSettings('site_plan'))
  }

  async componentDidMount() {
    const { dispatch, selectedPage } = this.props
    const currentUser = this.getCurrentUser();
    dispatch(fetchDivisionsIfNeeded(selectedPage))
    WebFont.load({
      google: {
        families: ['Roboto Thin', 'Roboto Light Italic']
      }
    })
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
  }

  updateUserToken = (userToken) => {
    this.setState({
      userToken: userToken
    });
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

  componentDidUpdate(prevProps) {
    const { dispatch, selectedPage } = this.props
    console.log('PREV PROPS', prevProps)
    console.log('REGULAR PROPS', this.props)
    if (this.props.selectedPage !== prevProps.selectedPage) {
      dispatch(fetchDivisionsIfNeeded(selectedPage))
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.appSettings.theme === 'dark'){
      this.setState({inverted:true})
    }
    else{
      this.setState({inverted:false})
    }
    this.setState({appSettings: nextProps.appSettings})
  }

  render() {
    const { selectedPage, divisions, divisionsBypage, isFetching, appSettings } = this.props
    return (
      <Segment basic style={{ fontFace:'google', backgroundColor: '#F4F8F9', color: '#27292A', minHeight:'100vh' }}>
          <Helmet>
               <meta charSet="utf-8" />
               <title>{appSettings.name}</title>
               <link rel="icon" href={appSettings.logo} />
           </Helmet>
          <Sidebar style={{zIndex:50000}} as={Menu} animation='scale down' width='wide' visible={this.state.showSidebar} vertical inverted={this.state.inverted}>
            <Menu.Item style={{textAlign:'center'}}>
              <Icon name='close' style={{color:'red'}}  />
              <h3 style={{marginTop: '0px', marginLeft:5, cursor:'pointer'}}>Site Configuration</h3>
            </Menu.Item>
            {
              !this.state.editName
              ?
              <Menu.Item name='app_name'>
                <Form.Field inline>
                  <label style={{marginRight:10}}>App Name:</label>
                  <Input placeholder='App Name' defaultValue={appSettings.name} />
                </Form.Field>
                <div style={{textAlign:'center', marginTop:10}}>
                <Button style={{display:'inline', width:'40%'}}>Cancel</Button>
                <Button color='teal' style={{display:'inline', width:'40%'}}>Save</Button>
                </div>
              </Menu.Item>
              :
              <Menu.Item name='app_name'>
                <Icon name='edit'  />
                <b style={{marginRight:10}}>Change App Name:  </b> {appSettings.name}
              </Menu.Item>
            }
            <Menu.Item name='app_logo'>
              <Icon name='edit' />
              <b style={{marginRight:10}}>Change App Logo:</b> <Image src={appSettings.logo} style={{width:20, display:'inline'}} />
            </Menu.Item>
            <Menu.Item name='app_font'>
              <Icon name='edit' />
              <b style={{marginRight:10}}>Change App Font:</b> current_app_font || Default
            </Menu.Item>
            {
              !this.state.editName
              ?
              <Menu.Item name='app_name'>
                <div style={{textAlign:'center', marginTop:10}}>
                  <Button style={{display:'inline', width:'40%'}} color="black">Dark</Button>
                  <Button style={{display:'inline', width:'40%'}} >Light</Button>
                </div>
              </Menu.Item>
              :
              <Menu.Item name='app_font'>
                <Icon name='edit' />
                <b style={{marginRight:10}}>Invert App Theme:</b> current_app_theme || dark vs light
              </Menu.Item>
            }
          </Sidebar>
        <Navbar />
          {divisions.length > 0 &&
            <div style={{ opacity: isFetching ? 0.5 : 1, width:'100vw', marginLeft:-15}}>
              <Divisions style={{width:'100vw'}} divisions={divisions} divisionsBypage={divisionsBypage} userToken={this.state.userToken} style={{width:'100vw'}} />
            </div>}
        </Segment>
    )
  }
}

Home.propTypes = {
  selectedPage: PropTypes.string.isRequired,
  divisions: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { selectedPage, divisionsBypage, appSettings } = state
  const {
    isFetching,
    lastUpdated,
    items: divisions,
    navItems
  } = divisionsBypage[selectedPage] || {
    isFetching: true,
    items: []
  }

  return {
    selectedPage,
    divisionsBypage,
    appSettings,
    divisions,
    navItems,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(Home)
