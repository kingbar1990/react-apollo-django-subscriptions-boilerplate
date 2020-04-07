import React, { Component } from 'react';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';


const MessageField = (props) => {
    const {
      onChange,
      fieldType,
      value,
      ...rest
    } = props;

    const className = `emoji-text-field emoji-${fieldType}`;
    const isInput = fieldType === 'input';
    return (
      <div className={className} style={{width: 'calc(100% - 90px)', display: 'flex'}}>
        { (isInput) && (<input {...rest} onChange={onChange} type="text" value={value} />) }
        { (!isInput) && (<textarea {...rest} onChange={onChange}  value={value} />) }
      </div>
    );
}

export default MessageField;
