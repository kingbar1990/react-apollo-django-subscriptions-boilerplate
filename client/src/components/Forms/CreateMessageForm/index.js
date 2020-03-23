import React, { useState, useEffect } from "react";
import { MDBFooter } from "mdbreact";
import { Mutation, graphql, compose } from "react-apollo";

import { DATA_PER_PAGE } from "../../../constants";
import { getBase64, debounce } from "../../../utils";
import { createMessage, getRoom, getType, onFocus } from "../../../queries";

const CreateMessageForm = ({
  currentRoom,
  users,
  data,
  onFocusQuery,
  inputOnFocus,
  setInputOnFocus,
  addToStoredMessages,
}) => {
  const [value, setValue] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [intervalTimerId, setIntervalTimerId] = useState(null);

  useEffect(() => {
    if (inputOnFocus) {
      let timerId = setInterval(() => {
        changeTypingStatus(true);
      }, 500);
      setIntervalTimerId(timerId);
    } else {
      clearInterval(intervalTimerId);
    }
  }, [inputOnFocus]);

  const handleImageChange = e => {
    if (!e.target.files) {
      return;
    }
    let file = e.target.files[0];
    if (file.size <= 1048576) {
      getBase64(file)
        .then(image => (file = image))
        .then(() => setAvatar(file));
    } else {
      return setError("max size 1MB");
    }
  };

  let updateStatus = () => data.refetch({ id: currentRoom, skip: false });

  const changeTypingStatus = status => {
    onFocusQuery.refetch({
      roomId: currentRoom,
      focused: status
    });
  };

  updateStatus = debounce(updateStatus, 3000);

  const handleInputChange = e => {
    setValue(e.target.value)
    if (e.target.value.length > 0){
      setInputOnFocus(true);
      changeTypingStatus(true);
      updateStatus();
    }else{
      setInputOnFocus(false);
      changeTypingStatus(false);
      updateStatus();
    }
  };

  return (
    <Mutation
      mutation={createMessage}
      variables={{
        text: value,
        sender: users[0].id,
        room: currentRoom,
        file: avatar
      }}
      update={(cache, { data: { createMessage } }) => {
        const data = cache.readQuery({
          query: getRoom,
          variables: { id: currentRoom, first: DATA_PER_PAGE }
        });
        cache.writeQuery({
          query: getRoom,
          data: {
            room: {
              messages: [...data.room.messages, createMessage.message],
              users: data.room.users,
              __typename: data.room.__typename
            }
          }
        });
      }}
      onError={() => {
        if (!navigator.onLine){
          setError("No Internet Connection!");
          addToStoredMessages(value, currentRoom, users[0].id, avatar)
        }
        else{
          setError("Message not sent :( Please try again");
        }
      }}
      onCompleted={() => {
        setValue("");
        setAvatar("");
      }}
    >
      {createTask => (
        <MDBFooter className="py-3 shade">
          {error && (
            <section className="flex-space">
              <div className="d-block invalid-feedback mb-2">{error}</div>
            </section>
          )}
          <section>
            {avatar && <span className="btn-rounded rad">Preview</span>}
            <label htmlFor="avatar" className="label btn-rounded rad">
              Attach
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <input
              className="input-send rad"
              onChange={handleInputChange}
              onBlur={() => {
                setInputOnFocus(false);
                changeTypingStatus(false);
              }}
              value={value}
              placeholder="Type something"
            />
            <button className="btn-rounded rad" onClick={createTask}>
              Send
            </button>
          </section>
        </MDBFooter>
      )}
    </Mutation>
  );
};

export default compose(
  graphql(getType, {
    options: props => ({ variables: { id: props.currentRoom, skip: true } })
  }),
  graphql(onFocus, {name: "onFocusQuery"})
)(CreateMessageForm);
