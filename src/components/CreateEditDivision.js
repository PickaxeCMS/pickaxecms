import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Guid from 'guid';
import { connect } from 'react-redux'
import _ from 'lodash';
import { Icon, Modal, Button, Form, Grid, Image, Loader, Dimmer } from 'semantic-ui-react'
import config from '../config.js';
import { invokeApig, s3Upload } from '../libs/awsLib';
import ReactPlayer from 'react-player'
import './CreateDivision.css';
import {
  selectPage,
  fetchDivisionsIfNeeded,
  invalidatepage
} from '../redux/actions/divisionsActions'
const SectionOptions = [
  { key: 'i', text: 'Image', value: 'image' },
  { key: 't', text: 'Text', value: 'text' },
]

class CreateEditDivision extends Component {
  constructor(props) {
    super(props);
    this.file = null;
    this.handleDivisionButton = this.handleSubmitDivision.bind(this);
    this.handleCancelModal = this.handleCancelModal.bind(this);

    var currentItem = props.currentItem;
    if(!currentItem.sections){
      currentItem.sections = {}
    }
    if(!currentItem.category){
      currentItem.category = 'division'
    }
    if(!currentItem.sections.attachment){
      currentItem.sections.attachment = {style:'top'}
    }
    this.state = {
      isLoading: null,
      content: '',
      currentItem: currentItem || {},
      loadingVideo: false,
      showModal: props.showModal,
      divisions: props.divisions,
      divisionsObject: props.divisionsOrderObject
    };

  }

  handleChange = (e, { value }) => this.setState({ value })

  handleFileChange = async (event) => {
    this.setState({loadingVideo:true})
    console.log('event.target.files[0]', event.target.files[0])
    var type = event.target.files[0].type.split('/');
    try {
      const uploadedFilename = null
      await s3Upload(event.target.files[0], this.props.userToken).then(data =>{
        var currentItem = this.state.currentItem;
        currentItem.sections.attachment = {file: data.Location, type:type[0], style:'top'};
        this.setState({currentItem})
        this.setState({loadingVideo:false})

      })

      }
      catch(e) {
        alert(e);
        this.setState({ isLoading: false });
      }
  }

  handleSectionFileChange = async (index, subSectionIndex, event) => {
    var type = event.target.files[0].type.split('/');
    try {
        const uploadedFilename = null
        await s3Upload(event.target.files[0], this.props.userToken).then(data =>{
          var currentItem = this.state.currentItem;
          currentItem.sections.sections[index][subSectionIndex].attachment = {file: data.Location, type:type[0], style:'top'};
          this.setState({currentItem})
          this.setState({loadingVideo:false})

        })
      }
      catch(e) {
        alert(e);
        this.setState({ isLoading: false });
      }

  }

  handleCarouselFileChange = async (index, subSectionIndex, event) => {
    var type = event.target.files[0].type.split('/');
    try {
        const uploadedFilename = null
        await s3Upload(event.target.files[0], this.props.userToken).then(data =>{
          var currentItem = this.state.currentItem;
          currentItem.sections.carousel.push({file: data.Location, type:type[0]});
          this.setState({currentItem})
          this.setState({loadingVideo:false})
        })
      }
      catch(e) {
        alert(e);
        this.setState({ isLoading: false });
      }

  }

  handleNewSection = (e, {value}) => {
    var currentItem = this.state.currentItem;
    if(!currentItem.sections.sections){
      currentItem.sections.sections = []
      currentItem.sections.sections[0] = [];
    }
    else{
      currentItem.sections.sections[currentItem.sections.sections.length ] = []
    }
    this.setState({currentItem})
  }

  handleCancelModal = (event) => {
    event.preventDefault();
    this.props.handleCancelModal();
  }

  handleSubmitDivision = async (event) => {
    event.preventDefault();

    this.setState({ isLoading: true });
    try {
      var guid = Guid.create();
      var division = {
        ...this.state.currentItem,
        pageId: this.props.selectedPage,
        id: this.state.currentItem.id || guid.value,
      }
      await this.saveDivision(division);


      /* Update the order array */
      var divisionsObject = this.state.divisionsObject
      if(_.has(divisionsObject, "divisions")){
        var divisions = [];
        if(divisionsObject.divisions.indexOf(division.id) === -1){
          divisionsObject.divisions.splice(this.state.divisionsObject.divisions.length, 0, guid.value)
          await this.saveDivision({
            ...divisionsObject
          });
          divisions = this.state.divisions;
          divisions.push(division);
          this.setState({divisions})
        }else{
          await this.saveDivision({
            ...divisionsObject
          });
          divisions = this.state.divisions;
          divisions.splice(divisionsObject.divisions.indexOf(division.id), 1, division);
          this.setState({divisions})
        }
      }
      this.setState({showModal:false, isLoading: false, currentItem:{ sections:{attachment: {style:'top'}}}})
      const { router } = this.context
      if(this.props.selectedPage === 'site_plan'){
        this.props.dispatch(fetchDivisionsIfNeeded('site_plan'))
        router.push({ pathname: `/` })
      }
      else{
        this.props.dispatch(fetchDivisionsIfNeeded(this.props.selectedPage))
        router.push({ pathname: `/pages/${divisionsObject.pageId}` })
      }
    }
    catch(e) {
      alert(e);
      this.setState({ isLoading: false });
    }

  }

  saveDivision(division) {
    return invokeApig({
      path: `/posts/${division.id}`,
      method: 'PUT',
      body: division,
      queryParams:{'pageId': this.props.selectedPage, "TableName": process.env.REACT_APP_AppName}
    }, this.props.userToken);
  }

  render() {
    return (
      <Modal style={{maxWidth:"85%"}} open={this.state.showModal} trigger={
        <Button animated='fade' onClick={() => {this.setState({currentItem: {}, showModal: !this.state.showModal})}}>
          <Button.Content visible><Icon style={{color:'#1678C2'}} name='edit' /></Button.Content>
          <Button.Content style={{color:'#1678C2'}} hidden>
            Edit
          </Button.Content>
        </Button>
        }>
        <Modal.Content>
        {
          !this.state.preview
          ?
          <Form>
            <Form.Input
                label="Largest Header (h1)"
                placeholder='Largest Header'
                defaultValue={this.state.currentItem.sections.header1 || null}
                onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.header1 = value; this.setState({currentItem})}} />
              <Form.TextArea
                label="Medium Header (h2)"
                placeholder='Medium Header'
                defaultValue={this.state.currentItem.sections.header2 || null}
                onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.header2 = value; this.setState({currentItem})}} />

              <Form.TextArea
                label="Small Header (h3)"
                placeholder='Small Header'
                defaultValue={this.state.currentItem.sections.header3 || null}
                onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.header3 = value; this.setState({currentItem})}} />

              <Grid style={{width:'100%'}}>
                {
                  this.state.currentItem.sections.sections && this.state.currentItem.sections.sections.map((section, i) =>
                    <Grid.Row style={{flexGrow: 1}} key={i}>
                      {
                        section.map((subSection, s) =>
                        <div key={s} style={{flexGrow: 1}}>
                        {
                          subSection.type
                          ?
                          <div style={{flexGrow: 1}}>
                            <Button basic compact negative size='tiny' style={{float:'right', marginBottom:0}} icon='delete' onClick={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.sections.splice(i, 1);  this.setState({currentItem})}} />
                              {
                                subSection.attachment
                                ?
                                  <Image style={{maxHeight:150}} src={subSection.attachment} />
                                :
                                  null
                              }
                              <Form.Input
                                type="file"
                                onChange={this.handleSectionFileChange.bind(this, i, s)}
                                id="file"
                                accept="image/*"
                              />
                          </div>
                          :
                          <div style={{flexGrow: 1, marginLeft:10, marginRight:5}}>
                              <Button basic compact negative size='tiny' style={{float:'right', marginBottom:-20}} icon='delete' onClick={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.sections.splice(i, 1);  this.setState({currentItem})}} />
                              <Form.TextArea
                                style={{width:'100%'}}
                                label="Section"
                                placeholder='Text'
                                defaultValue={this.state.currentItem.sections.sections[i][s] || null}
                                onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.sections[i][s] = value; this.setState({currentItem})}} />
                          </div>
                        }
                      </div>
                    )

                  }
                  <div>
                    {
                      !this.state.currentItem.sections.sections[i].length || this.state.currentItem.sections.sections[i].length !== 3
                      ?
                      <Grid.Column style={{flexGrow: 1}}>
                        <Form.Select label='Add New Column' options={SectionOptions} placeholder='Section' onChange={(e, {value}) => {
                          var currentItem = this.state.currentItem;
                          if(!currentItem.sections.sections[i]){
                            currentItem.sections.sections[i] = []
                          }
                          if(value !== 'image'){
                            currentItem.sections.sections[i].push('');
                          }
                          else{
                            currentItem.sections.sections[i].push({type:'image'});
                          }
                          this.setState({currentItem})
                          }} />
                      </Grid.Column>
                      :
                      null
                    }
                  </div>
                  </Grid.Row>

                  )
                }
                <div>
                  {
                    !this.state.currentItem.sections.sections || this.state.currentItem.sections.sections.length < 10
                    ?
                    <Grid.Row style={{flexGrow: 1, marginTop:15, marginBottom:20}}>
                      {
                        !this.state.currentItem.sections.sections
                        ?
                        <Button onClick={this.handleNewSection}>+ Text Section</Button>
                        :
                        <Button onClick={this.handleNewSection}>+ New Row</Button>
                      }
                    </Grid.Row>
                    :
                    null
                  }
                </div>
              </Grid>

              <Form.Input
                  label="Link"
                  placeholder='Link'
                  defaultValue={this.state.currentItem.sections.linkHref || null}
                  onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.linkHref = value; this.setState({currentItem})}} />

              <Form.Input
                  label="Link Label"
                  placeholder='Link Label'
                  defaultValue={this.state.currentItem.sections.linkText || null}
                  onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.linkText = value; this.setState({currentItem})}} />
                {
                  this.state.loadingVideo
                  ?
                  <Dimmer active={true}>
                   <Loader indeterminate active={true}>Uploading File</Loader>
                 </Dimmer>
                  :
                  null
                }
                <label><b>Add Image/Video</b></label>
                  <Form.Input
                  type="file"
                  onChange={this.handleFileChange}
                  id="file"
                />
                <Grid.Column style={{flexGrow: 1}}>
                  <Form.Group inline>
                    <label>Image Location</label>
                    <Form.Radio label='Banner' value='banner-top' checked={this.state.currentItem.sections.attachment.style === 'banner-top'} onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.attachment.style = value; this.setState({currentItem})}} />
                    <Form.Radio label='Top' value='top' checked={this.state.currentItem.sections.attachment.style === 'top'} onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.attachment.style = value; this.setState({currentItem})}} />
                    <Form.Radio label='Bottom' value='bottom' checked={this.state.currentItem.sections.attachment.style === 'bottom'} onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.sections.attachment.style = value; this.setState({currentItem})}} />
                  </Form.Group>
                </Grid.Column>
              <Button onClick={this.handleSubmitDivision} color='teal'>Save</Button>
              <Button onClick={() => this.setState({preview: !this.state.preview})}>Show Preview</Button>
              <Button onClick={this.handleCancelModal}>Cancel</Button>
            </Form>
            :
            <div style={{ textAlign: 'center'}}>
              {
                this.state.currentItem.sections.attachment && this.state.currentItem.sections.attachment.style === "banner-top"&& this.state.currentItem.sections.attachment.type === "image"
                ?
                <Image src={this.state.currentItem.sections.attachment.file} style={{width:'100%'}} />
                :
                null
              }
              {
                this.state.currentItem.sections.attachment && this.state.currentItem.sections.attachment.style === "banner-top" && this.state.currentItem.sections.attachment.type === "video"
                ?
                <Grid style={{width:'104%'}}>
                    <ReactPlayer style={{marginLeft:'-20px'}} width="100%" height="100%" loop url={this.state.currentItem.sections.attachment.file} playing />
                </Grid>
                :
                null
              }
              {
                this.state.currentItem.sections.attachment && this.state.currentItem.sections.attachment.style === "top" && this.state.currentItem.sections.attachment.type === "image"
                ?
                <Grid style={{width:'100%'}}>
                  <Grid.Column style={{flexGrow:1}}>
                  </Grid.Column>
                  <Grid.Column style={{minWidth:250, maxWidth:500}}>
                    <Image src={this.state.currentItem.sections.attachment.file} />
                  </Grid.Column>
                  <Grid.Column style={{flexGrow:1}}>
                  </Grid.Column>
                </Grid>
                :
                null
              }
              {
                this.state.currentItem.sections.attachment && this.state.currentItem.sections.attachment.style === "top" && this.state.currentItem.sections.attachment.type === "video"
                ?
                <Grid style={{width:'104%'}}>
                  <Grid.Column style={{flexGrow:1}}>
                  </Grid.Column>
                  <Grid.Column style={{textAlign:'center', width:'auto'}}>
                    <ReactPlayer loop url={this.state.currentItem.sections.attachment.file} playing />
                  </Grid.Column>
                  <Grid.Column style={{flexGrow:1}}>
                  </Grid.Column>
                </Grid>
                :
                null
              }
              <h1>{this.state.currentItem.sections.header1 || null}</h1>
              <h2>{this.state.currentItem.sections.header2 || null}</h2>
              <h3>{this.state.currentItem.sections.header3 || null}</h3>
              <Grid style={{width:'100%'}}>
                {
                  this.state.currentItem.sections.sections && this.state.currentItem.sections.sections.map((section, i) =>
                  <Grid.Row style={{flexGrow: 1, marginBottom:-15, width:'100%',  paddingLeft:65, paddingRight:100}} key={i}>
                    {
                      section.map((subSection, s) =>
                      <Grid.Column key={s} style={{flexGrow: 1}}>
                        {
                          subSection.type
                          ?
                          <div>
                            {
                              subSection.attachment
                              ?
                              <Image style={{flexGrow: 1}} src={subSection.attachment.file} />
                              :
                              null
                            }
                          </div>
                          :
                          <div dangerouslySetInnerHTML={{ __html: this.props.match.description }} />
                        }
                      </Grid.Column>
                    )
                  }
                  </Grid.Row>
                  )
                }
                </Grid>

                {
                  this.state.currentItem.sections.attachment && this.state.currentItem.sections.attachment.style === "bottom" && this.state.currentItem.sections.attachment.type === "image"
                  ?
                  <Grid style={{width:'104%'}}>
                      <ReactPlayer style={{marginLeft:'-20px'}} width="100%" height="100%" loop url={this.state.currentItem.sections.attachment.file} playing />
                  </Grid>
                  :
                  null
                }
                {
                  this.state.currentItem.sections.attachment && this.state.currentItem.sections.attachment.style === "bottom" && this.state.currentItem.sections.attachment.type === "video"
                  ?
                  <Grid style={{width:'104%'}}>
                    <Grid.Column style={{flexGrow:1}}>
                    </Grid.Column>
                    <Grid.Column style={{textAlign:'center', width:'auto'}}>
                      <ReactPlayer loop url={this.state.currentItem.sections.attachment.file} playing />
                    </Grid.Column>
                    <Grid.Column style={{flexGrow:1}}>
                    </Grid.Column>
                  </Grid>
                  :
                  null
                }
              {
                this.state.currentItem.sections.linkText
                ?
                <Grid divided columns='equal' style={{boxShadow: 'none'}} >
                  <Grid.Column style={{boxShadow: 'none'}}>
                  </Grid.Column>
                  <Grid.Column style={{boxShadow: 'none', minWidth:250}}>
                    <p style={{border:'2px solid gray', maxWidth:300, color:'gray', padding:10, fontSize:11, textTransform:'upper'}}><a  style={{ color:'gray'}}href={this.state.currentItem.sections.linkHref || '/'} target="_blank">{this.state.currentItem.sections.linkText || ''}</a></p>
                  </Grid.Column>
                  <Grid.Column style={{boxShadow: 'none'}}>
                  </Grid.Column>
                </Grid>
                :
                null
              }
              <div style={{ textAlign: 'left', marginTop: 15}}>
                <Button onClick={this.handleSubmitDivision} disable={!this.state.loadingVideo} color='teal'>Save</Button>
                <Button onClick={() => this.setState({preview: !this.state.preview})}>Close Preview</Button>
                <Button onClick={this.handleCancelModal}>Cancel</Button>
              </div>
            </div>
        }

        </Modal.Content>
      </Modal>
    );
  }
}

CreateEditDivision.contextTypes = {
    router: PropTypes.object
}

const mapStateToProps = state => {
  const { selectedPage, divisionsBypage, dispatch } = state

  return {
    selectedPage,
    dispatch,
    divisionsBypage
  }
}
export default connect(mapStateToProps)(CreateEditDivision);
