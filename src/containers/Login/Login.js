import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Form, Grid, Modal, Header, Image, Segment } from 'semantic-ui-react'
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser
} from 'amazon-cognito-identity-js';
import './Login.css';
import logo from '../../media/logo.png'
import config from '../../config.js';
import {
  fetchAppSettings
} from '../../redux/actions/appSettingsActions'

class Login extends Component{

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      username: '',
      password: '',
      newPassword: '',
    };
    console.log('props', props)
  }

  componentWillMount() {
    document.body.classList.add('login')
    this.props.dispatch(fetchAppSettings('site_plan'))
  }

  componentWillUnmount() {
    document.body.classList.remove('login')
  }
  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps)
  }

  render() {
    return (
      <Grid
        textAlign='center'
        style={{ height: '100%', marginTop:150 }}
        verticalAlign='middle'
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='teal' textAlign='center'>
            <Image src={this.props.appSettings.logo} />
            {' '}Log-in to your account
          </Header>
          <Form size='large'>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                onChange={this.handleChange}
                id="username"
                placeholder='E-mail address'
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                id="password"
                onChange={this.handleChange}
                type='password'
              />
            {
              this.state.newPasswordModal
              ?

                <Modal open={this.state.newPasswordModal}>
                  <h2 style={{padding:10, textAlign:'center'}}>Please Enter a New Password</h2>
                  <Form.Input
                    style={{padding:10,}}
                    fluid
                    icon='lock'
                    iconPosition='left'
                    placeholder='New Password'
                    id="newPassword"
                    onChange={this.handleChange}
                    type='password'
                  />
                <Button style={{marginTop:20}} onClick={this.handleSubmit} disabled={ ! this.validateForm() } color='teal' fluid size='large'>Submit</Button>

                </Modal>
              :
              null
            }
              {
                this.state.isLoading
                ?
                <Button color='teal' fluid size='large' loading>Logging in…</Button>
                :
                <Button onClick={this.handleSubmit} disabled={ ! this.validateForm() } color='teal' fluid size='large'>Login</Button>
              }
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    )
  }

  login = (username, password) => {
    var self = this;
    const userPool = new CognitoUserPool({
      UserPoolId: config.cognito.USER_POOL_ID,
      ClientId: config.cognito.APP_CLIENT_ID
    });
    const authenticationData = {
      Username: username,
      Password: password
    };

    const user = new CognitoUser({ Username: username, Pool: userPool });
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    return new Promise((resolve, reject) => (
      user.authenticateUser(authenticationDetails, {
        onSuccess: (result) => resolve(result.getIdToken().getJwtToken()),
        onFailure: (err) => reject(err),
        newPasswordRequired: function(userAttributes, requiredAttributes) {
            // User was signed up by an admin and must provide new
            // password and required attributes, if any, to complete
            // authentication.
            delete userAttributes.email_verified;
            function getNewPassword(){
              self.setState({newPasswordModal: true, userAttributes})
            }
            if(!self.state.newPassword){
              getNewPassword()
            }
            else{
              user.completeNewPasswordChallenge(self.state.newPassword, userAttributes, this);
            }
        }
      })
    ))
  }
  updateUserToken = (userToken) => {
    this.setState({
      userToken: userToken
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.login(this.state.username, this.state.password);
      const { router } = this.context
      router.push({ pathname: '/' })
    }
    catch(e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  validateForm() {
    return this.state.username.length > 0
      && this.state.password.length > 0;
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

}
Login.propTypes = {
    selectedPage: PropTypes.string,
    appSettings: PropTypes.object,
    children: PropTypes.node,
    history: PropTypes.object,
    location: PropTypes.object,
    actions: PropTypes.object,
    posts: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
    lastUpdated: PropTypes.number,
    isFetching: PropTypes.bool,
}
Login.contextTypes = {
    router: PropTypes.object
}

const mapStateToProps = state => {
    const { userToken, appSettings } = state
    return {
      userToken,
      appSettings
    }
}
export default connect(mapStateToProps)(Login);
