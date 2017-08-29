import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  selectPage,
  fetchDivisionsIfNeeded,
  invalidatepage
} from '../../redux/actions/divisionsActions'
import MediaQuery from 'react-responsive';
import ReactPlayer from 'react-player'
import { Input, Sidebar, Segment, Button, Menu, Image, Icon, Header, Form } from 'semantic-ui-react'
import Navbar from '../../components/Navbar';
import { CognitoUserPool, } from 'amazon-cognito-identity-js';
import config from '../../config.js';
import Divisions from '../../components/Divisions'
import WebFont from 'webfontloader'

class Admin extends Component {
  constructor(props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
    this.state = {
      userToken: null
    }
  }

  componentWillMount(){
    this.props.dispatch(selectPage('admin'))
    this.props.dispatch(fetchDivisionsIfNeeded('admin'))
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
    console.log('this.props', this.props)
    console.log('prevProps', prevProps)

    if (this.props.selectedPage !== prevProps.selectedPage) {
      const { dispatch, selectedPage } = this.props
      dispatch(fetchDivisionsIfNeeded(selectedPage))
    }
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedPage } = this.props
    dispatch(invalidatepage(selectedPage))
    dispatch(fetchDivisionsIfNeeded(selectedPage))
  }

  render() {
    const { selectedPage, divisions, divisionsBypage, isFetching } = this.props
    return (
      <div style={{height:'100vh'}}>
        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='scale down' width='wide' visible={true} vertical inverted={process.env.REACT_APP_INVERTED}>
            <Menu.Item style={{textAlign:'center'}}>
              <h3 style={{marginTop: '0px', marginLeft:5, cursor:'pointer'}}>Site Configuration</h3>
            </Menu.Item>
            {
              !this.state.editName
              ?
              <Menu.Item name='app_name'>
                <Form.Field inline>
                  <label style={{marginRight:10}}>App Name:</label>
                  <Input placeholder='App Name' defaultValue={process.env.REACT_APP_NAME} />
                </Form.Field>
                <div style={{textAlign:'center', marginTop:10}}>
                <Button style={{display:'inline', width:'40%'}}>Cancel</Button>
                <Button color='teal' style={{display:'inline', width:'40%'}}>Save</Button>
                </div>
              </Menu.Item>
              :
              <Menu.Item name='app_name'>
                <Icon name='edit'  />
                <b style={{marginRight:10}}>Change App Name:  </b> {process.env.REACT_APP_NAME}
              </Menu.Item>
            }
            <Menu.Item name='app_logo'>
              <Icon name='edit' />
              <b style={{marginRight:10}}>Change App Logo:</b> <Image src={process.env.REACT_APP_LOGO} style={{width:20, display:'inline'}} />
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
                  <Button style={{display:'inline', width:'40%'}} onClick={()=> process.env.REACT_APP_INVERTED = true} color="black">Dark</Button>
                  <Button style={{display:'inline', width:'40%'}} onClick={()=> process.env.REACT_APP_INVERTED = false}>Light</Button>
                </div>
              </Menu.Item>
              :
              <Menu.Item name='app_font'>
                <Icon name='edit' />
                <b style={{marginRight:10}}>Invert App Theme:</b> current_app_theme || dark vs light
              </Menu.Item>
            }
          </Sidebar>
          <Sidebar.Pusher>
            <Segment basic>
              <Header as='h3'>Application Content</Header>
              <Image src='/assets/images/wireframe/paragraph.png' />
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    )
  }
}

Admin.propTypes = {
  selectedPage: PropTypes.string.isRequired,
  divisions: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { selectedPage, divisionsBypage } = state
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
    divisions,
    navItems,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(Admin)
