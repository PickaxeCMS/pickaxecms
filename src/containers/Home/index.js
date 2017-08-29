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
import {Segment, Image } from 'semantic-ui-react'
import Navbar from '../../components/Navbar';
import { CognitoUserPool, } from 'amazon-cognito-identity-js';
import config from '../../config.js';
import Divisions from '../../components/Divisions'
import WebFont from 'webfontloader'

class Home extends Component {
  constructor(props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
    this.state = {
      userToken: null
    }
  }

  componentWillMount(){
    this.props.dispatch(selectPage('site_plan'))
    this.props.dispatch(fetchDivisionsIfNeeded('site_plan'))
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
      <Segment basic style={{ fontFace:'google', backgroundColor: '#F4F8F9', color: '#27292A', minHeight:'100vh' }}>
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

export default connect(mapStateToProps)(Home)
