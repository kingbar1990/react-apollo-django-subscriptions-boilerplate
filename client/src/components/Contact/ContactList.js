import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import classNames from 'classnames';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import SearchIcon from '@material-ui/icons/Search';
import PermContactCalendar from '@material-ui/icons/PermContactCalendar';
import Add from '@material-ui/icons/Add';
import Star from '@material-ui/icons/Star';
import IconButton from '@material-ui/core/IconButton';
import styles from './contact-jss';
import { BACKEND_URL, MEDIA_URL } from '../../constants/index';


class ContactList extends React.Component {
  state = {
    filter: 'all',
  };

  handleChange = (event, value) => {
    this.setState({ filter: value });
  };

  render() {
    const {
      classes,
      dataContact,
      itemSelected,
      showDetail,
      search,
      keyword,
      clippedRight,
      addContact,
      addFn, total,
      changeRoom,
      currentRoom,
      me
    } = this.props;
    const { filter } = this.state;
    //const favoriteData = dataContact.filter(item => item.get('favorited') === true);
    const favoriteData = ""
    const getItem = dataArray => dataArray.map(data => {
      return (
        <ListItem
          button
          key={data.id}
          className={currentRoom.includes(data.id) ? classes.selected : ''}
          onClick={() => changeRoom(data.id, me.id)}
        >
          <ListItemAvatar>
            {data.avatar ? (
              <Avatar alt="avatar" src={`${BACKEND_URL}${MEDIA_URL}${data.avatar}`} className={classes.avatar} />
            ):
            (
              <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png" className={classes.avatar} />
            )}
          </ListItemAvatar>
          <ListItemText primary={data.fullName} secondary={data.fullName} />
        </ListItem>
      );
    });
    return (
      <Fragment>
        <Drawer
          variant="permanent"
          anchor="left"
          open
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div>
            <div className={classNames(classes.toolbar, clippedRight && classes.clippedRight)}>
              <div className={classes.flex}>
                <div className={classes.searchWrapper}>
                  <div className={classes.search}>
                    <SearchIcon />
                  </div>
                  <input className={classes.input} onChange={(event) => search(event)} placeholder="Search" />
                </div>
                {addFn && (
                  <Tooltip title="Add New Contact">
                    <IconButton className={classes.buttonAdd} onClick={() => addContact()} color="secondary" aria-label="Delete">
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
            <div className={classes.total}>
              {total}
              &nbsp;
              Contacts
            </div>
            <List>
              {filter === 'all' ? getItem(dataContact) : getItem(favoriteData)}
            </List>
          </div>
        </Drawer>
        <BottomNavigation value={filter} onChange={this.handleChange} className={classes.bottomFilter}>
          <BottomNavigationAction label="All" value="all" icon={<PermContactCalendar />} />
          <BottomNavigationAction label="Favorites" value="favorites" icon={<Star />} />
        </BottomNavigation>
      </Fragment>
    );
  }
}

ContactList.defaultProps = {
  clippedRight: false,
  addContact: () => {},
  addFn: false,
};

export default withStyles(styles)(ContactList);
