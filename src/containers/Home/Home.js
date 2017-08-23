import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { invokeApig } from '../../libs/awsLib';
import ReactPlayer from 'react-player'
import { Dimmer, Loader, Segment, Button, Image, Icon,  Grid, Popup } from 'semantic-ui-react'
import _ from 'lodash'
import './Home.css';
import AdminToolbar from '../../components/AdminToolbar';
import CreateEditDivision from '../../components/CreateEditDivision';

class Home extends Component {

  constructor(props) {
    super(props);
    this.handleToggleEditing = this.toggleEdit.bind(this);
    this.handleSaveButton = this.handlesSaveClick.bind(this);
    this.handleCancelModal = this.handleCancelModal.bind(this);
    this.state = {
      isLoading: false,
      isLoggedIn: false,
      showModal: false,
      editing:false,
      showNewEditDivisionModal:false,
      currentItem:{},
      divisionsOrderObject:{},
      divisions:[]
    };
  }
  // async componentDidMount() {
  //   if (this.props.userToken !== null) {
  //     this.setState({ isLoggedIn: true });
  //   }
  //   this.setState({ isLoading: true });
  //
  //   try {
  //     var results = await this.divisions();
  //     var self = this;
  //     _.some(results, function(o) {
  //       if(_.has(o, "divisionsOrder")){
  //         if(o.divisionsOrder){
  //           self.setState({ divisionsOrderObject:o })
  //           var divisionsOrderIndex = results.indexOf(o)
  //           results.splice(divisionsOrderIndex, 1)
  //           var groups = _.groupBy(results, 'id');
  //           results = _.map(self.state.divisionsOrderObject.divisionsOrder, function (i) { if(groups[i]){return groups[i].shift()}; });
  //         }
  //       }
  //     })
  //     this.setState({ divisions: results });
  //   }
  //   catch(e) {
  //     alert(e);
  //   }
  //
  //   this.setState({ isLoading: false });
  // }

  divisions() {
    return invokeApig({ path: '/divisions' }, this.props.userToken);
  }

  renderDivisions() {
    return (
      <Segment basic style={{ backgroundColor: '#F4F8F9', color: '#27292A', paddingBottom:100 }}>
        <div style={{width:'105%', textAlign:'center', marginLeft:-15}}>
          <MediaQuery minDeviceWidth={1224}>
            <ReactPlayer style={{marginLeft:'-20px'}} width="105%" height="100%" loop url='http://test-bucket-01141993.s3-website-us-east-1.amazonaws.com/ampsight/tech.mp4' playing />
          </MediaQuery>
          <MediaQuery maxDeviceWidth={1224}>
              <Image style={{width:'100%'}} src="https://s3.amazonaws.com/test-bucket-01141993/tech.gif"/>
          </MediaQuery>
        </div>
        <div style={{width: '120%', marginLeft: -65, textAlign:'center'}}>
          {
            this.state.divisions.map((division, i) =>
              <div key={i}>
              {
                !this.state.editing
                ?
                <div style={{marginTop:50, marginLeft:50, marginRight:50, textAlign:'center'}} key={i}>
                  <Grid divided style={{boxShadow: 'none'}} >
                    <Grid.Column style={{boxShadow: 'none', width:"5%"}}>
                    </Grid.Column>
                    <Grid.Column style={{boxShadow: 'none', width:'100%',  paddingLeft:65, paddingRight:100 }}>
                      {
                        division.sections.attachment && division.sections.attachment.style === "banner-top"
                        ?
                        <Grid style={{width:'100%'}}>
                          <Grid.Column style={{width:'100%'}}>
                            <Image src={division.sections.attachment.image} />
                          </Grid.Column>
                        </Grid>
                        :
                        null
                      }
                      <Grid divided columns='equal' style={{boxShadow: 'none', width: '100%', paddingLeft:60, paddingRight:100}} >
                        <Grid.Column style={{boxShadow: 'none'}}>
                        </Grid.Column>
                        <Grid.Column style={{boxShadow: 'none', width: '100%'}}>
                          <h1 id={division.sections.header1 || null} style={{fontSize:"3rem", padding:10, marginBottom:-40}}>{division.sections.header1 || null}</h1>
                        </Grid.Column>
                        <Grid.Column style={{boxShadow: 'none'}}>
                        </Grid.Column>
                      </Grid>
                      {
                        division.sections.attachment && division.sections.attachment.style === "top"
                        ?
                        <Grid style={{width: '100%', paddingLeft:65, paddingRight:100}}>
                          <Grid.Column style={{flexGrow:1}}>
                          </Grid.Column>
                          <Grid.Column style={{minWidth:250, maxWidth:500}}>
                            <Image src={division.sections.attachment.image} />
                          </Grid.Column>
                          <Grid.Column style={{flexGrow:1}}>
                          </Grid.Column>
                        </Grid>
                        :
                        null
                      }
                        <h2 style={{fontSize:"2rem", width:'100%', paddingLeft:65, paddingRight:100}}>{division.sections.header2 || null}</h2>
                        <h3 style={{fontSize:"1rem",  width:'100%', textAlign:'center', paddingLeft:65, paddingRight:125}}>{division.sections.header3 || null}</h3>
                          <Grid>
                            {
                              division.sections.sections && division.sections.sections.map((section, i) =>
                              <Grid.Row style={{flexGrow: 1, marginBottom:-15, width:'100%',  paddingLeft:65, paddingRight:100}} key={i}>
                                {
                                  section.map((subSection, s) =>
                                  <div key={s} style={{flexGrow: 1}}>
                                    {
                                      subSection.type
                                      ?
                                      <div>
                                        {
                                          subSection.attachment
                                          ?
                                          <Image style={{maxHeight:150}} src={subSection.attachment} />
                                          :
                                          null
                                        }
                                      </div>
                                      :
                                      <p>{subSection}</p>
                                    }
                                  </div>
                                )
                              }
                              </Grid.Row>
                              )
                            }
                            </Grid>
                            {
                              division.sections.attachment && division.sections.attachment.style === "bottom"
                              ?
                              <Grid style={{width: '100%', paddingLeft:65, paddingRight:100}}>
                                <Grid.Column style={{flexGrow:1}}>
                                </Grid.Column>
                                <Grid.Column style={{minWidth:250, maxWidth:500}}>
                                  <Image src={division.sections.attachment.image} />
                                </Grid.Column>
                                <Grid.Column style={{flexGrow:1}}>
                                </Grid.Column>
                              </Grid>
                              :
                              null
                            }
                        {
                          division.sections.linkText
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
                    </Grid.Column>
                    <Grid.Column style={{boxShadow: 'none', width:"5%"}}>
                    </Grid.Column>
                  </Grid>
                </div>
                :
                <div style={{marginTop:50, marginLeft:50, marginRight:50, padding:10, textAlign:'center'}} key={i}>
                  <Grid divided style={{boxShadow: 'none'}} >
                    <Grid.Column style={{boxShadow: 'none', width:"5%"}}>
                    </Grid.Column>
                    <Grid.Column style={{boxShadow: 'none', width:'90%'}}>
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
                        <Button disabled={i === this.state.divisions.length-1} animated='fade' onClick={this.handlesMoveDownClick.bind(this, i)}>
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
                  {
                    division.sections.attachment && division.sections.attachment.style === "banner-top"
                    ?
                    <Grid style={{width: '110vw', marginLeft: -75}}>
                      <Grid.Column style={{width:'100%'}}>
                        <Image src={division.sections.attachment.image || null} />
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                  <Grid divided columns='equal' style={{boxShadow: 'none', width: '100%', paddingLeft:65, paddingRight:100}} >
                    <Grid.Column style={{boxShadow: 'none'}}>
                    </Grid.Column>
                    <Grid.Column style={{boxShadow: 'none', width: '100%'}}>
                      <h1 style={{fontSize:"3rem", padding:10, marginBottom:-40}}>{division.sections.header1 || null}</h1>
                    </Grid.Column>
                    <Grid.Column style={{boxShadow: 'none'}}>
                    </Grid.Column>
                  </Grid>
                    {
                      division.sections.attachment && division.sections.attachment.style === "top"
                      ?
                      <Grid style={{width: '100%', paddingLeft:65, paddingRight:100}}>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                        <Grid.Column style={{minWidth:250, maxWidth:500}}>
                          <Image src={division.sections.attachment.image} />
                        </Grid.Column>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                      </Grid>
                      :
                      null
                    }
                    <h2 style={{fontSize:"2rem", width:'100%', paddingLeft:65, paddingRight:100}}>{division.sections.header2 || null}</h2>
                  <h3 style={{fontSize:"1rem", width:'100%', paddingLeft:65, paddingRight:125}}>{division.sections.header3 || null}</h3>
                  <Grid style={{width: '100%', paddingLeft:65, paddingRight:100}}>
                    {
                      division.sections.sections && division.sections.sections.map((section, i) =>
                      <Grid.Row style={{flexGrow: 1}} key={i}>
                        {
                          section.map((subSection, s) =>
                          <div key={s} style={{flexGrow: 1, marginBottom:-15}}>
                            {
                              subSection.type
                              ?
                              <div>
                                {
                                  subSection.attachment
                                  ?
                                  <Image style={{maxHeight:150}} src={subSection.attachment} />
                                  :
                                  null
                                }
                              </div>
                              :
                              <p>{subSection}</p>
                            }
                          </div>
                        )
                      }
                      </Grid.Row>
                      )

                    }
                    </Grid>
                    {
                      division.sections.attachment && division.sections.attachment.style === "bottom"
                      ?
                      <Grid style={{width: '100%', paddingLeft:65, paddingRight:100}}>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                        <Grid.Column style={{minWidth:250, maxWidth:500}}>
                          <Image src={division.sections.attachment.image} />
                        </Grid.Column>
                        <Grid.Column style={{flexGrow:1}}>
                        </Grid.Column>
                      </Grid>
                      :
                      null
                    }
                  {
                    division.sections.linkText
                    ?
                    <Grid divided columns='equal' style={{boxShadow: 'none', width: '100%', paddingLeft:65, paddingRight:100}} >
                      <Grid.Column style={{boxShadow: 'none'}}>
                      </Grid.Column>
                      <Grid.Column style={{boxShadow: 'none', minWidth:250}}>
                        <p style={{border:'2px solid gray', maxWidth:300, color:'gray', padding:10, fontSize:11, textTransform:'upper'}}><a  style={{ color:'gray'}}href={division.sections.linkHref || '/'} target="_blank">{division.sections.linkText || ''}</a></p>
                      </Grid.Column>
                      <Grid.Column style={{boxShadow: 'none'}}>
                      </Grid.Column>
                    </Grid>
                    :
                    null
                  }
                </Grid.Column>
                <Grid.Column style={{boxShadow: 'none', width:"5%"}}>
                </Grid.Column>
              </Grid>
                </div>

              }
              </div>
            )
          }
        </div>
      </Segment>
    );
  }
  deleteDivision(division) {
    return invokeApig({
      path: `/divisions/${division.id}`,
      method: 'DELETE',
      body: division,
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
        await this.deleteDivision({pageId: '1', id:divisions[index].id});
        divisionsOrderObject.divisionsOrder.splice(divisionsOrderObject.divisionsOrder.indexOf(divisions[index].id), 1);
        divisions.splice(index, 1);
        await this.saveDivision({
          ...divisionsOrderObject,
          pageId: '1'
        });
        this.setState({editing: !this.state.editing, isLoading: false})
        this.setState({divisions, divisionsOrderObject})
        this.forceUpdate()
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
    divisionsOrderObject.divisionsOrder.splice(index, 1);
    divisions.splice(index - 1, 0, item);
    divisionsOrderObject.divisionsOrder.splice(index - 1, 0, item.id);
    this.setState({divisions, divisionsOrderObject})
    this.forceUpdate()
  }
  handlesMoveDownClick = (index, event) => {
    var divisions = this.state.divisions;
    var divisionsOrderObject = this.state.divisionsOrderObject;
    var item = divisions[index]
    divisions.splice(index, 1);
    divisionsOrderObject.divisionsOrder.splice(index, 1);
    divisions.splice(index + 1, 0, item);
    divisionsOrderObject.divisionsOrder.splice(index + 1, 0, item.id);
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

  handleCancelModal = () => {
    this.setState({showNewEditDivisionModal: !this.state.showNewEditDivisionModal, currentItem:{}})
  }

  handlesSaveClick = async(event) => {
    this.setState({ isLoading: true });
    var divisionsOrderObject = this.state.divisionsOrderObject;
    divisionsOrderObject.divisionsOrder = this.state.divisionsOrderObject.divisionsOrder;
    await this.saveDivision({
      ...divisionsOrderObject,
      pageId: '1'
    });
    this.setState({editing: !this.state.editing, isLoading: false})
    this.props.history.push('/');
  }

  handleSubmitDivision = (divisions) => {
    this.setState({divisions, currentItem:{}, showNewEditDivisionModal: !this.state.showNewEditDivisionModal})
    this.forceUpdate()
  }

  handlesNewDivisionClick = () => {
    this.setState({showNewEditDivisionModal: !this.state.showNewEditDivisionModal})
  }

  saveDivision(division) {
    return invokeApig({
      path: `/divisions/${division.id}`,
      method: 'PUT',
      body: division,
    }, this.props.userToken);
  }

  render() {
    if (this.state.isLoading) {
        return (
          <Dimmer active>
            <Loader size='massive'>Loading</Loader>
          </Dimmer>
        )
    }
    return (
      <div className="Home">
        {this.renderDivisions()}
        {
          this.state.isLoggedIn
          ?
          <AdminToolbar handleEditingButton={ this.toggleEdit } handleSaveButton={ this.handlesSaveClick } handleNewDivisionButton={ this.handlesNewDivisionClick } isEditing={this.state.editing}></AdminToolbar>
          :
          null
        }
        {
          this.state.showNewEditDivisionModal
          ?
          <CreateEditDivision handleCancelModal={this.handleCancelModal} currentItem={this.state.currentItem} divisionsOrderObject={this.state.divisionsOrderObject} showModal={true} userToken={this.props.userToken} handleDivisionButton={this.handleSubmitDivision} divisions={this.state.divisions}></CreateEditDivision>
          :
          null
        }
      </div>
    );
  }
}

Home.propTypes = {
    // view props:
    // currentView: PropTypes.string.isRequired,
}

export default withRouter(Home);
