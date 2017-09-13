import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { invokeApig } from '../libs/awsLib';
import { Button, Image, Icon,  Grid, Popup } from 'semantic-ui-react'
import AdminToolbar from './AdminToolbar';
import AdminSidebar from './AdminSidebar';
import CreateEditDivision from './CreateEditDivision';
import CreateEditPage from './CreateEditPage';
import MediaQuery from 'react-responsive';
import ReactPlayer from 'react-player'
import Slider from 'react-slick';

export default class Divisions extends Component {
  constructor(props){
    super(props)
    this.handleToggleEditing = this.toggleEdit.bind(this);
    this.handleSaveButton = this.handlesSaveClick.bind(this);
    this.handleNewDivisionButton = this.handlesNewDivisionClick.bind(this);
    this.handleNewPageButton = this.handlesNewPageClick.bind(this);
    this.handleAddNavButton = this.handlesAddNavClick.bind(this);
    this.handleRemoveNavButton = this.handlesRemoveNavClick.bind(this);
    this.handlesDeletePageClick = this.handlesDeletePageClick.bind(this);
    this.state = {
      showNewEditDivisionModal: false,
      showNewEditPageModal: false,
      divisionsOrderObject: {},
      divisions: [],
      editing: this.props.isEditing,
      currentItem: {}
    }
  }
  componentWillMount() {
    var divisions = this.props.divisions;
    var divisionsOrderObject = {}
    _.some(divisions, function(o) {
      if(_.has(o, "divisions")){
        if(o.divisions){
          divisionsOrderObject = o;
          var divisionsOrderIndex = divisions.indexOf(o)
          divisions.splice(divisionsOrderIndex, 1)
          var groups = _.groupBy(divisions, 'id');
          divisions = _.map(divisionsOrderObject.divisions, function (i) { if(groups[i]){return groups[i].shift()}; });
        }
      }
    })
    this.setState({divisionsOrderObject})

    this.setState({divisions})
  }

  render() {
    const settings={
            dots: true,
            infinite: true,
            speed: 500,
            // autoplay: true,
            adaptiveHeight:true,
            autoplaySpeed: 5000, /* autoplaySeconds * 1000 */
            slidesToShow: 1, /* slidesToShow  */
            slidesToScroll: 1,
            pauseOnHover: true
          }
    return (
      <div style={{width:'100vw', marginTop:50, marginLeft:20, marginBottom:50}}>
        {
          this.state.divisions.map((division, i) =>
          <div key={i}>
            <div style={{marginTop:50, textAlign:'center', width:"100%"}} key={i}>
                  {
                    this.state.editing
                    ?
                    <Grid divided columns='equal' style={{width:"252px", boxShadow: 'none'}} >
                      <Grid.Column style={{boxShadow: 'none'}}>
                        <Popup
                          trigger={
                            <Button disabled={i === 0} animated='fade' onClick={this.handlesMoveUpClick.bind(this, i)}>
                              <Button.Content visible><Icon name='arrow up' /></Button.Content>
                              <Button.Content hidden>
                                Up
                              </Button.Content>
                            </Button>
                          }
                          content='Move this section up.'
                          position='top center'
                          size='tiny'
                          inverted
                        />
                      </Grid.Column>
                      <Grid.Column style={{boxShadow: 'none'}}>
                        <Popup
                          trigger={
                            <Button disabled={i === this.props.divisions.length-1} animated='fade' onClick={this.handlesMoveDownClick.bind(this, i)}>
                              <Button.Content visible><Icon name='arrow down' /></Button.Content>
                              <Button.Content hidden>
                                Down
                              </Button.Content>
                            </Button>
                          }
                          content='Move this section down.'
                          position='top center'
                          size='tiny'
                          inverted
                        />
                      </Grid.Column>
                      <Grid.Column style={{boxShadow: 'none'}}>
                        <Popup
                          trigger={
                              <Button animated='fade' onClick={() => {this.setState({currentItem: division, showNewEditDivisionModal: !this.state.showNewEditDivisionModal})}}>
                                <Button.Content visible><Icon style={{color:'#1678C2'}} name='edit' /></Button.Content>
                                <Button.Content style={{color:'#1678C2'}} hidden>
                                  Edit
                                </Button.Content>
                              </Button>
                          }
                          content='Edit this section'
                          position='top center'
                          size='tiny'
                          inverted
                        />
                      </Grid.Column>
                      <Grid.Column style={{boxShadow: 'none'}}>
                        <Popup
                          trigger={
                            <Button animated='fade' onClick={this.handlesDeleteClick.bind(this, i)}>
                              <Button.Content visible><Icon style={{color:'#DB2828'}} name='trash' /></Button.Content>
                              <Button.Content style={{color:'#DB2828'}} hidden>
                                Delete
                              </Button.Content>
                            </Button>
                          }
                          content='Delete this section'
                          position='top center'
                          size='tiny'
                          inverted
                        />
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }

                  {
                    division && division.sections && division.sections.attachment && division.sections.attachment.style === "banner-top" && division.sections.attachment.type === "image"
                    ?
                    <Grid style={{width:'105vw'}}>
                      <Grid.Column style={{width:'105vw'}}>
                        <Image style={{width:'105vw', marginLeft:'-18px'}} src={division.sections.attachment.file} />
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  {
                    division && division.sections && division.sections.attachment && division.sections.attachment.style === "banner-top" && division.sections.attachment.type === "video"
                    ?
                    <Grid style={{width:'104%'}}>
                        <ReactPlayer style={{marginLeft:'-20px'}} width="100%" height="100%" loop url={division.sections.attachment.file} playing />
                    </Grid>
                    :
                    null
                  }
                  {
                    division && division.sections && division.sections.attachment && division.sections.attachment.style === "top" && division.sections.attachment.type === 'image'
                    ?
                    <Grid style={{width: '100vw'}}>
                      <Grid.Column style={{flexGrow:1}}>
                      </Grid.Column>
                      <Grid.Column style={{textAlign:'center', width:'auto'}}>
                        <MediaQuery maxDeviceWidth={1224} style={{width:'100%'}}>
                          <Image style={{height:100}} src={division.sections.attachment.file} />
                        </MediaQuery>
                        <MediaQuery minDeviceWidth={1224} style={{height:'100px', textAlign:"center"}}>
                          <Image src={division.sections.attachment.file} />
                        </MediaQuery>
                      </Grid.Column>
                      <Grid.Column style={{flexGrow:1}}>
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  {
                    division && division.sections && division.sections.attachment && division.sections.attachment.style === "top" && division.sections.attachment.type === "video"
                    ?
                    <Grid style={{width:'104%'}}>
                      <Grid.Column style={{flexGrow:1}}>
                      </Grid.Column>
                      <Grid.Column style={{textAlign:'center', width:'auto'}}>
                        <ReactPlayer loop url={division.sections.attachment.file} playing />
                      </Grid.Column>
                      <Grid.Column style={{flexGrow:1}}>
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  {
                    division && division.sections.header1
                    ?
                    <Grid divided columns='equal' style={{boxShadow: 'none',  width: '100vw',  textAlign:'center', marginBottom:15}} >
                      <Grid.Column style={{boxShadow: 'none', width: '100vw'}}>
                        <h1 id={division.sections.header1 || null} style={{fontSize:"3rem", textAlign:'center'}}>{division.sections.header1 || null}</h1>
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  {
                    division && division.sections.header2
                    ?
                    <Grid divided style={{boxShadow: 'none', width: '100vw', marginBottom:15}} >
                      <Grid.Column style={{boxShadow: 'none', width: '100vw'}}>
                        <h2 id={division.sections.header2 || null} style={{fontSize:"2rem", textAlign:'center', marginTop:-50}}>{division.sections.header2 || null}</h2>
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  {
                    division && division.sections.header3
                    ?
                    <Grid divided style={{boxShadow: 'none', width: '100vw', marginBottom:15}} >
                      <Grid.Column style={{boxShadow: 'none', width: '100vw'}}>
                        <h3 id={division.sections.header3 || null} style={{fontSize:"1rem", textAlign:'center', marginTop:-50}}>{division.sections.header3 || null}</h3>
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  <Grid>
                    {
                      division && division.sections.sections && division.sections.sections.map((section, i) =>
                      <Grid.Row style={{flexGrow: 1, marginBottom:-15, width:'100%',  paddingLeft:65, paddingRight:100}} key={i}>
                        {
                          section.map((subSection, s) =>
                          <Grid.Column key={s} style={{flexGrow: 1}}>
                            {
                              subSection.type
                              ?
                              <div style={{marginLeft:'auto', marginRight:'auto', display:'block'}}>
                                {
                                  subSection.attachment
                                  ?
                                  <Image style={{display:'inline'}} src={subSection.attachment.file} />
                                  :
                                  null
                                }
                              </div>
                              :
                              <div dangerouslySetInnerHTML={{ __html: subSection }} />
                            }
                          </Grid.Column>
                        )
                      }
                      </Grid.Row>
                      )
                    }
                    </Grid>
                    {
                      division && division.sections.attachment && division.sections.attachment.style === "bottom" && division.sections.attachment.type === 'image'
                      ?
                      <Grid style={{width: '100%', paddingLeft:65, paddingRight:100}}>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                        <Grid.Column style={{minWidth:250, maxWidth:500}}>
                          <Image src={division.sections.attachment.file} />
                        </Grid.Column>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                      </Grid>
                      :
                      null
                    }
                    {
                      division && division.sections.attachment && division.sections.attachment.style === "bottom" && division.sections.attachment.type === "video"
                      ?
                      <Grid style={{width:'104%'}}>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                        <Grid.Column style={{textAlign:'center', width:'auto'}}>
                          <ReactPlayer loop url={division.sections.attachment.file} playing />
                        </Grid.Column>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                      </Grid>
                      :
                      null
                    }
                    {
                      division && division.sections.linkText
                      ?
                      <Grid divided columns='equal' style={{boxShadow: 'none', width: '100%', paddingLeft:60, paddingRight:100}} >
                        <Grid.Column style={{boxShadow: 'none'}}>
                        </Grid.Column>
                        <Grid.Column style={{boxShadow: 'none', minWidth:250}}>
                          <p style={{border:'2px solid gray', color:'gray', padding:10, fontSize:11, textTransform:'upper'}}><a  style={{ color:'gray'}}href={division.sections.linkHref || '/'} target="_blank">{division.sections.linkText || ''}</a></p>
                        </Grid.Column>
                        <Grid.Column style={{boxShadow: 'none', }}>
                        </Grid.Column>
                      </Grid>
                      :
                      null
                    }
            </div>
          </div>
        )}
        {
          this.props.userToken
          ?
          <AdminToolbar style={{width:'100vw'}} handlesDeletePageClick={this.handlesDeletePageClick} handleEditingButton={ this.toggleEdit } handleSaveButton={ this.handlesSaveClick } handleAddNavButton={ this.handlesAddNavClick } handleRemoveNavButton={ this.handlesRemoveNavClick } handleNewDivisionButton={ this.handlesNewDivisionClick } handleNewPageButton={ this.handlesNewPageClick } isEditing={this.state.editing}></AdminToolbar>
          :
          null
        }
        {
          this.state.showNewEditDivisionModal
          ?
          <CreateEditDivision handleCancelModal={this.handleCancelDivisionModal} currentItem={this.state.currentItem} divisionsOrderObject={this.state.divisionsOrderObject} showModal={true} userToken={this.props.userToken} handleDivisionButton={this.handleSubmitDivision} divisions={this.state.divisions}></CreateEditDivision>
          :
          null
        }
        {
          this.state.showNewEditPageModal
          ?
          <CreateEditPage handleCancelModal={this.handleCancelPageModal} currentItem={this.state.currentItem} divisionsOrderObject={this.state.divisionsOrderObject} showModal={true} userToken={this.props.userToken} handleDivisionButton={this.handleSubmitDivision} divisions={this.state.divisions}></CreateEditPage>
          :
          null
        }
      </div>
    )
  }
  deleteDivision(division) {
    return invokeApig({
      path: `/posts/${division.id}`,
      method: 'DELETE',
      body: division,
      queryParams:{'pageId': division.pageId, "TableName": process.env.REACT_APP_AppName}
    }, this.props.userToken);
  }
  saveDivision(division) {
    return invokeApig({
      path: `/posts/${division.id}`,
      method: 'PUT',
      body: division,
      queryParams:{'pageId': division.pageId, "TableName": process.env.REACT_APP_AppName}
    }, this.props.userToken);
  }
  handlesDeleteClick = async (index, event) => {
      event.preventDefault();

      const confirmed = window.confirm('Are you sure you want to delete this division?');

      if ( ! confirmed) {
        return;
      }
      this.setState({ isLoading: true });
      var divisionsOrderObject = this.state.divisionsOrderObject;

      this.setState({ isDeleting: true });

      try {
        var divisions = this.state.divisions;
        await this.deleteDivision({pageId:divisions[index].pageId , id:divisions[index].id});
        divisionsOrderObject.divisions.splice(divisionsOrderObject.divisions.indexOf(divisions[index].id), 1);
        divisions.splice(index, 1);
        await this.saveDivision({
          ...divisionsOrderObject
        });
        this.setState({isLoading: false})
        this.toggleEdit()
        this.setState({divisions, divisionsOrderObject})
        this.forceUpdate()
      }
      catch(e) {
        alert(e);
        this.setState({ isDeleting: false });
      }
    }

  handlesDeletePageClick = async (event) => {

      const confirmed = window.confirm('Are you sure you want to delete this page? Deletion is permanent.');

      if ( ! confirmed) {
        return;
      }
      this.setState({ isLoading: true });
      var divisionsOrderObject = this.state.divisionsOrderObject;

      this.setState({ isDeleting: true });

      try {
        var divisions = this.state.divisions;
        for(var i = 0; i < divisions.length; i++){
          await this.deleteDivision({pageId:divisions[i].pageId , id:divisions[i].id});
        }
        await this.deleteDivision({pageId:divisionsOrderObject.pageId , id:divisionsOrderObject.id});
        this.handlesRemoveNavClick()
      }
      catch(e) {
        alert(e);
        this.setState({ isDeleting: false });
      }
    }
  handlesMoveUpClick = (index, event) => {
    var divisions = this.state.divisions;
    var divisionsOrderObject = this.state.divisionsOrderObject;
    var item = divisions[index]
    divisions.splice(index, 1);
    divisionsOrderObject.divisions.splice(index, 1);
    divisions.splice(index - 1, 0, item);
    divisionsOrderObject.divisions.splice(index - 1, 0, item.id);
    this.setState({divisions, divisionsOrderObject})
    this.forceUpdate()
  }

  handlesMoveDownClick = (index, event) => {
    var divisions = this.state.divisions;
    var divisionsOrderObject = this.state.divisionsOrderObject;
    var item = divisions[index]
    divisions.splice(index, 1);
    divisionsOrderObject.divisions.splice(index, 1);
    divisions.splice(index + 1, 0, item);
    divisionsOrderObject.divisions.splice(index + 1, 0, item.id);
    this.setState({divisions, divisionsOrderObject})
    this.forceUpdate()
  }

  handlesEditClick = (index, event) => {
    this.setState({ showModal: !this.state.showModal })
  }

  toggleEdit = (data) => {
    this.setState({ editing: !this.state.editing })
    this.forceUpdate()
  }

  handleCancelDivisionModal = () => {
    this.setState({showNewEditDivisionModal: !this.state.showNewEditDivisionModal, currentItem:{}})
  }
  handleCancelPageModal = () => {
    this.setState({showNewEditPageModal: !this.state.showNewEditPageModal, currentItem:{}})
  }
  handlesAddNavClick = async(event) => {
    console.log('this.props.appSettings', this.props.appSettings)
    var navObject = this.props.divisionsBypage['site_plan'];
    navObject.navItems[this.state.divisionsOrderObject.pageId] = {
      displayName: this.state.divisionsOrderObject.displayName
    };
    await this.saveDivision({
      id:'site_plan',
      pageId: 'site_plan',
      navItems:navObject.navItems,
      appSettings:this.props.appSettings,
    });
    const { router } = this.context
    router.push({ pathname: `/` })
  }
  handlesRemoveNavClick = async(event) => {
    console.log('this.props.appSettings', this.props.appSettings)

    var navObject = this.props.divisionsBypage['site_plan'];
    delete navObject.navItems[this.state.divisionsOrderObject.pageId];
    await this.saveDivision({
      id:'site_plan',
      pageId: 'site_plan',
      navItems:navObject.navItems,
      appSettings:this.props.appSettings,
    });
    const { router } = this.context
    router.push({ pathname: `/` })
  }

  handlesNewDivisionClick = () => {
    this.setState({currentItem: {}})
    this.setState({showNewEditDivisionModal: !this.state.showNewEditDivisionModal})
  }

  handlesNewPageClick = () => {
    this.setState({showNewEditPageModal: !this.state.showNewEditPageModal})
  }

  handlesSaveClick = async(event) => {
    this.setState({ isLoading: true });
    var divisionsOrderObject = this.state.divisionsOrderObject;
    divisionsOrderObject.divisions = this.state.divisionsOrderObject.divisions;
    await this.saveDivision({
      ...divisionsOrderObject
    });
    this.setState({ editing: !this.state.editing,  isLoading: false })
    const { router } = this.context
    router.push({ pathname: `/pages/${divisionsOrderObject.pageId}` })
  }



}
Divisions.contextTypes = {
    router: PropTypes.object
}
Divisions.propTypes = {
  divisions: PropTypes.array.isRequired,
  appSettings: PropTypes.object.isRequired,
  isEditing: PropTypes.bool,
  dispatch: PropTypes.func
}
