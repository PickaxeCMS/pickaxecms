
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  selectPage,
  fetchDivisionsIfNeeded,
  invalidatepage
} from '../../redux/actions/divisionsActions'
import { Loader, Segment } from 'semantic-ui-react'
import Navbar from '../../components/Navbar';
import { CognitoUserPool, } from 'amazon-cognito-identity-js';
import config from '../../config.js';
import './Pages.css';
import Divisions from '../../components/Divisions';
import {
  fetchAppSettings
} from '../../redux/actions/appSettingsActions'
import Helmet from "react-helmet";

class Pages extends Component {
  constructor(props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
    this.state = {
      userToken: null,
      editing:false
    }
  }

  componentWillMount(){
    const { params } = this.props;
    this.props.dispatch(selectPage(params.id))
    this.props.dispatch(fetchDivisionsIfNeeded(params.id))
    this.props.dispatch(fetchAppSettings('site_plan'))
  }

  componentDidUpdate(prevProps) {
    this.props.dispatch(selectPage(this.props.params.id))
    if (this.props.selectedPage !== prevProps.selectedPage) {
      const { dispatch, selectedPage } = this.props
      dispatch(fetchDivisionsIfNeeded(selectedPage))
      dispatch(fetchAppSettings('site_plan'))
    }
  }

  async componentDidMount() {
    const currentUser = this.getCurrentUser();
    const { dispatch, selectedPage } = this.props
    dispatch(fetchDivisionsIfNeeded(selectedPage))
    dispatch(fetchAppSettings('site_plan'))

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

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedPage } = this.props
    dispatch(invalidatepage(selectedPage))
    dispatch(fetchDivisionsIfNeeded(selectedPage))
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
      <Segment basic style={{ backgroundColor: '#F4F8F9', color: '#27292A', paddingBottom:50, minHeight:'100vh', width:'100vw' }}>
        <Helmet>
             <meta charSet="utf-8" />
             <title>{appSettings.name}</title>
             <link rel="icon" href={appSettings.logo} />
         </Helmet>
        <Navbar />
        {isFetching && divisions.length === 0 && <Loader />}
        {
          !isFetching && divisionsBypage[selectedPage].items.length === 0 && <h2 style={{marginTop:50}}>Page Not Found</h2>
        }
        {divisions.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1, width:'100vw', marginLeft:-15}}>
            <Divisions style={{width:'100vw'}} appSettings={this.props.appSettings} divisions={divisions} divisionsBypage={divisionsBypage} userToken={this.state.userToken} style={{width:'100vw'}} />
          </div>}
      </Segment>
    )
  }
}

Pages.propTypes = {
  selectedPage: PropTypes.string.isRequired,
  divisions: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool,
  lastUpdated: PropTypes.number,
  userToken:PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  editPage: PropTypes.func
}

function mapStateToProps(state) {
  const { selectedPage, divisionsBypage, appSettings } = state
  const {
    isFetching,
    lastUpdated,
    dispatch,
    editPage,
    isEditing,
    userToken,
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
    isEditing,
    dispatch,
    editPage,
    lastUpdated,
    userToken
  }
}

export default connect(mapStateToProps)(Pages)
