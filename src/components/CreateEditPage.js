import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, Modal, Button, Form } from 'semantic-ui-react'
import config from '../config.js';
import { invokeApig, s3Upload } from '../libs/awsLib';

class CreateEditPage extends Component {
  constructor(props) {
    super(props);
    this.file = null;
    this.handlePageButton = this.handleSubmitPage.bind(this);
    this.handleCancelModal = this.handleCancelModal.bind(this);

    var currentItem = props.currentItem;
    if(!currentItem.sections){
      currentItem.sections = {}
    }
    if(!currentItem.category){
      currentItem.category = 'page'
    }
    if(!currentItem.sections.attachment){
      currentItem.sections.attachment = {style:'top'}
    }

    this.state = {
      isLoading: null,
      content: '',
      currentItem: currentItem || {},
      showModal: props.showModal,
      currentPages: props.navItems
    };

  }

  handleChange = (e, { value }) => this.setState({ value })

  handleFileChange = async (event) => {
    if (event.target.files[0] && event.target.files[0].size > config.MAX_ATTACHMENT_SIZE) {
      alert('Please pick a file smaller than 5MB');
      return;
    }
    try {
      const uploadedFilename = (event.target.files[0])
        ? (await s3Upload(event.target.files[0], this.props.userToken)).Location
        : null;
        var currentItem = this.state.currentItem;
        currentItem.sections.attachment = {image: uploadedFilename, style:'top'};
        this.setState({currentItem})
      }
      catch(e) {
        alert(e);
        this.setState({ isLoading: false });
      }
  }

  handleSectionFileChange = async (index, event) => {
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert('Please pick a file smaller than 5MB');
      return;
    }
    try {
      const uploadedFilename = (event.target.files[0])
        ? (await s3Upload(event.target.files[0], this.props.userToken)).Location
        : null;
        var currentItem = this.state.currentItem;
        currentItem.sections.sections[index].attachment = uploadedFilename;
        this.setState({currentItem})
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
      currentItem.sections.sections[currentItem.sections.length] = []
    }
    this.setState({currentItem})
  }

  handleNewSubSection = (index, {value}) => {
    var currentItem = this.state.currentItem;

    if(!currentItem.sections.sections[index]){
      currentItem.sections.sections[index] = []
    }
    if(value !== 'image'){
      currentItem.sections.sections[index].push('');
    }
    else{
      currentItem.sections.sections[index].push({type:'image'});
    }
    this.setState({currentItem})
  }

  handleCancelModal = (event) => {
    event.preventDefault();
    this.props.handleCancelModal();
  }

  handleSubmitPage = async (event) => {
    event.preventDefault();

    var newPage = this.state.currentItem;
    newPage.divisions = [];
    var id = newPage.displayName.replace(/\s+/g, '_').toLowerCase()
    this.setState({ isLoading: true });

    try {
      var page = {
        ...newPage,
        pageId: id,
        id: id,
      }
      await this.savePage(page);
      this.setState({showModal:false, isLoading: false, currentItem:{ sections:{attachment: {style:'top'}}}})
      const { router } = this.context
      router.push({ pathname: `/pages/${page.pageId}` })
    }
    catch(e) {
      alert(e);
      this.setState({ isLoading: false });
    }

  }

  savePage(page) {
    return invokeApig({
      path: `/posts/${page.id}`,
      method: 'PUT',
      body: page,
      queryParams:{'pageId': page.pageId}
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
                label="Navbar Display Name"
                placeholder='Name to be displayed on Navbar'
                defaultValue={this.state.currentItem.displayName || null}
                onChange={(e, {value}) => {var currentItem = this.state.currentItem; currentItem.displayName = value; this.setState({currentItem})}} />
            </Form>
          :
          null
        }
        <div style={{ textAlign: 'left', marginTop: 15}}>
          <Button onClick={this.handleSubmitPage} color='teal'>Save</Button>
          <Button onClick={this.handleCancelModal}>Cancel</Button>
        </div>
        </Modal.Content>
      </Modal>
    );
  }
}

CreateEditPage.contextTypes = {
    router: PropTypes.object
}

const mapStateToProps = state => {

    return {
    }
}
export default connect(mapStateToProps)(CreateEditPage);
