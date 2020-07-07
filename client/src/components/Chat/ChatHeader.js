import React, { useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import styles from '../Contact/contact-jss';
import { BACKEND_URL, MEDIA_URL } from "../../constants/index";


const ChatHeader = (props) => {
  const {
    classes,
    room,
    me
  } = props;
  
  const penPal = room.users.find(item => item.id !== me.id);

  useEffect (() => {
    const ctn = document.getElementById('roomContainer');
    if(ctn){
      ctn.scrollTo(0, ctn.scrollHeight);
    }
  })
  
  return (
    <AppBar
      position="absolute"
      className={classNames(classes.appBar, classes.fixHeight, classes.appBarShift)}
    >
      <div className={classes.cover}>
        {penPal.avatar ? (
          <Avatar alt="avatar" src={`${BACKEND_URL}${MEDIA_URL}${penPal.avatar}`} className={classes.avatar} />
        ):(
          <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png" className={classes.avatar} />
        )}
        <Typography variant="h6" component="h2" color="inherit" noWrap>
          {penPal.fullName}
          <Typography variant="caption" className={classes.status} color="inherit" noWrap>
            {penPal.online ? (
              <>
                <span className={classes.online} />
                &nbsp;Online
              </>
            ):(
              <>
                <span className={classes.offline} />
                &nbsp;Offline
              </>
            )}
          </Typography>
        </Typography>
      </div>
    </AppBar>
  );
}

export default withStyles(styles)(ChatHeader);
