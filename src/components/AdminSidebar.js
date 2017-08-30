import React, { Component } from 'react';
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive';

import { Sidebar, Menu, Image, Dropdown, Icon, Segment, Form, Button, Input, Header } from 'semantic-ui-react'

class AdminSidebar extends Component {
  constructor(props) {
    super(props);
    this.handleEditingButton = this.handleEditingButton.bind(this);
    this.handleSaveButton = this.handleSaveButton.bind(this);
    this.handleNewDivisionButton = this.handleNewDivisionButton.bind(this);
    this.handleNewPageButton = this.handleNewPageButton.bind(this);
    this.handleAddNavButton = this.handleAddNavButton.bind(this);
    this.handleRemoveNavButton = this.handleRemoveNavButton.bind(this);
    this.handlesDeletePageClick = this.handlesDeletePageClick.bind(this);
    this.state = {
      userToken: null,
      activePage: false,
      isEditing: props.isEditing,
      navItems:[]
    };

  }

  handleEditingButton(event) {
    event.preventDefault();
    this.setState({isEditing: !this.state.isEditing})
    this.props.handleEditingButton();
  }

  handleNewDivisionButton(event) {
    event.preventDefault();
    this.props.handleNewDivisionButton();
  }

  handleNewPageButton(event) {
    event.preventDefault();
    this.props.handleNewPageButton();
  }

  handleSaveButton(event) {
    event.preventDefault();
    this.setState({isEditing: !this.state.isEditing})
    this.props.handleSaveButton();
  }

  handleAddNavButton(event) {
    event.preventDefault();
    this.props.handleAddNavButton();
  }
  handleRemoveNavButton(event) {
    event.preventDefault();
    this.props.handleRemoveNavButton();
  }
  handlesDeletePageClick(event) {
    event.preventDefault();
    this.props.handlesDeletePageClick();
  }
  componentWillMount(){
    this.setState({navItems:this.props.divisionsBypage['site_plan'].navItems})
    if(this.state.navItems[this.props.selectedPage] !== undefined){
      this.setState({activePage: true})
    }
    else{
      this.setState({activePage: false})
    }
    this.forceUpdate()
  }
  componentWillReceiveProps(nextProps){
    this.setState({navItems:nextProps.divisionsBypage['site_plan'].navItems})
    if(this.state.navItems[nextProps.selectedPage] !== undefined){
      this.setState({activePage: true})
    }
    else{
      this.setState({activePage: false})
    }
    this.forceUpdate()
  }

  render() {
      return (
          <Sidebar.Pushable as={Segment} style={{height:'100vh'}}>
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
    );
  }
}

const mapStateToProps = state => {
    const { selectedPage, divisionsBypage } = state

    return {
      selectedPage,
      divisionsBypage
    }
}

export default connect(mapStateToProps)(AdminSidebar);
