import React, { Component } from 'react';
import { connect } from 'react-redux'
import MediaQuery from 'react-responsive';

import { Sidebar, Menu, Image, Dropdown, Icon, Segment } from 'semantic-ui-react'

class AdminToolbar extends Component {
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
    console.log('nextProps.selectedPage', this.props.selectedPage)
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
    console.log('nextProps.selectedPage', nextProps.selectedPage)
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
      <nav className="navbar navbar-default" style={{backgroundColor: '#1B1C1D', marginLeft:-20, zIndex:500, width:'100vw', bottom:0, position:'fixed'  }}>
        <Menu inverted secondary style={{height:50, paddingLeft:10, marginLeft:10, width:'100vw'}}>
            <Menu.Item name='Admin Toolbar'>
              Admin Toolbar
            </Menu.Item>
            <Menu.Item position='right' name='Admin Toolbar' >

              <MediaQuery maxDeviceWidth={1224} style={{float: 'left', height:50}}>
                  <Dropdown item icon='content' upward>
                    <Dropdown.Menu style={{right: 0, left: 'auto'}}>
                      {
                        this.state.isEditing
                        ?
                        <Dropdown.Item name='save' onClick={this.handleSaveButton}>
                          Save
                        </Dropdown.Item>
                        :
                        <Dropdown.Item name='edit' onClick={this.handleEditingButton}>
                          Edit
                        </Dropdown.Item>
                      }
                      <Dropdown.Item name='newPage' onClick={this.handleNewPageButton}>
                        + New Page
                      </Dropdown.Item>
                      <Dropdown.Item name='newDivision' onClick={this.handleNewDivisionButton}>
                        + New Section
                      </Dropdown.Item>
                      {
                        this.state.activePage
                        ?
                        <Dropdown.Item name='removeNav' onClick={this.handleRemoveNavButton}>
                          - Remove Page From Navbar
                        </Dropdown.Item>
                        :
                        <div>
                          {
                            this.state.activePage === undefined || 'site_plan'
                            ?
                            null
                            :
                            <Dropdown.Item name='addNav' onClick={this.handleAddNavButton}>
                              + Add Page To Navbar
                            </Dropdown.Item>

                          }
                        </div>
                      }
                      {
                        this.props.selectedPage !== 'site_plan'
                        ?
                          <Dropdown.Item name='newPage' onClick={this.handlesDeletePageClick} style={{color:'red'}}>
                              Delete Page
                          </Dropdown.Item>
                        :
                        null
                      }
                    </Dropdown.Menu>
                  </Dropdown>
              </MediaQuery>
            </Menu.Item>
              <MediaQuery minDeviceWidth={1224} style={{width:'auto', marginRight:15}}>

                {
                  this.state.isEditing
                  ?
                  <Menu.Item name='save' onClick={this.handleSaveButton} style={{float: 'left', height:50}}>
                    Save
                  </Menu.Item>
                  :
                  <Menu.Item name='edit' onClick={this.handleEditingButton} style={{float: 'left', height:50}}>
                    Edit
                  </Menu.Item>
                }
                <Menu.Item name='newPage' onClick={this.handleNewPageButton} style={{float: 'left', height:50}}>
                  + New Page
                </Menu.Item>
                {
                  this.props.selectedPage !== 'site_plan'
                  ?
                    <Menu.Item name='newDivision' onClick={this.handleNewDivisionButton} style={{float: 'left', height:50}}>
                      + New Section
                    </Menu.Item>
                  :
                  null
                }
                {console.log('THIS>STATE>ACTIVEPAGE ', this.state.activePage)}
                {
                  this.state.activePage
                  ?
                  <Menu.Item name='removeNav' onClick={this.handleRemoveNavButton} style={{float: 'left', height:50}}>
                    - Remove Page From Navbar
                  </Menu.Item>
                  :
                  <div>
                    {
                      this.props.selectedPage === undefined || 'site_plan'
                      ?
                      null
                      :
                      <Menu.Item name='addNav' onClick={this.handleAddNavButton} style={{float: 'left', height:50}}>
                        + Add Page To Navbar
                      </Menu.Item>

                    }
                  </div>
                }
                {
                  this.props.selectedPage !== 'site_plan'
                  ?
                    <Menu.Item name='newPage' onClick={this.handlesDeletePageClick} style={{color:'red', float: 'left', height:50}}>
                        Delete Page
                    </Menu.Item>
                  :
                  null
                }
              </MediaQuery>
        </Menu>
      </nav>
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

export default connect(mapStateToProps)(AdminToolbar);
