import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import classNames from 'classnames';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import SearchIcon from '@material-ui/icons/Search';
import styles from './contact-jss';
import { BACKEND_URL, MEDIA_URL } from '../../constants/index';


const ContactList = (props) => {
  const {
    classes,
    dataContact,
    search,
    clippedRight,
    total,
    changeRoom,
    currentRoom,
    me
  } = props;

  // Render HTML with all contacts
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
            <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png"  className={classes.avatar} />
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
            </div>
          </div>
          <div className={classes.total}>
            {total}
            &nbsp;
            Contacts
          </div>
          <List>
            {getItem(dataContact)}
          </List>
        </div>
      </Drawer>
    </Fragment>
  );
}

export default withStyles(styles)(ContactList);
