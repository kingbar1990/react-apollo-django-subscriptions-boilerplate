import gql from "graphql-tag";

export const register = gql`
  mutation register(
    $email: String!
    $password1: String!
    $password2: String!
    $fullName: String!
  ) {
    register(
      email: $email
      password1: $password1
      password2: $password2
      fullName: $fullName
    ) {
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
      success
      token
      user {
        id
        email
        fullName
      }
    }
  }
`;

export const login = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
      token
      user {
        id
        avatar
        email
        fullName
      }
    }
  }
`;

export const editUser = gql`
  mutation editUser($fullName: String, $email: String!, $avatar: String) {
    editUser(fullName: $fullName, email: $email, avatar: $avatar) {
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
      user {
        id
        fullName
        email
        avatar
      }
    }
  }
`;

export const verifyToken = gql`
  mutation verifyToken($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

export const getUsers = gql`
  query getUsers {
    users {
      id
      fullName
      email
      avatar
      online
    }
  }
`;

export const getRoom = gql`
  query getRoom(
    $id: Int
    $firstUser: ID
    $secondUser: ID 
    $first: Int, 
    $skip: Int
    ) {
    room(id: $id, firstUser: $firstUser, secondUser: $secondUser) {
      id
      users {
        id
        fullName
        avatar
        online
      }
      messages(firstUser: $firstUser, secondUser: $secondUser, first: $first, skip: $skip, room: $id) {
        id
        seen
        text
        isDeleted
        files{
          file
          size
        }
        sender {
          id
          avatar
          fullName
        }
        time
      }
    }
  }
`;

export const getType = gql`
  query getType($id: Int, $skip: Boolean!) {
    type(id: $id) @skip(if: $skip) {
      typing
    }
  }
`;

export const getRooms = gql`
  query getRooms($userId: Int) {
    rooms(userId: $userId) {
      id
      users {
        id
        fullName
      }
      lastMessage {
        id
        sender {
          avatar
          id
        }
        seen
      }
      unviewedMessages(userId: $userId)
    }
  }
`;

export const createMessage = gql`
  mutation createMessage(
    $text: String!
    $sender: ID!
    $room: ID!
    $files: [String]
  ) {
    createMessage(
      text: $text
      sender: $sender
      room: $room
      seen: false
      files: $files
    ) {
      message {
        id
        text
        files{
          file
          size
        }
        sender {
          id
          fullName
        }
        time
      }
    }
  }
`;

export const updateMessage = gql`
  mutation updateMessage(
    $text: String!
    $sender: ID!
    $room: ID!
    $messageId: Int
  ) {
    updateMessage(
      text: $text
      sender: $sender
      room: $room
      messageId: $messageId
      seen: false
    ) {
      message {
        id
        text
      }
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
    }
  }
`;

export const deleteMessage = gql`
  mutation deleteMessage($messageId: ID) {
    deleteMessage(messageId: $messageId) {
      success
    }
  }
`;

export const User = gql`
  query me {
    me {
      id
      email
      fullName
      avatar
      hasUnreadedMessages
    }
  }
`;

export const confirmEmail = gql`
  mutation confirmEmail($email: String!) {
    confirmEmail(email: $email) {
      success
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
    }
  }
`;

export const resetPassword = gql`
  mutation resetPassword(
    $newPassword1: String!
    $newPassword2: String!
    $confirmToken: String!
    $userId: Int!
  ) {
    resetPassword(
      newPassword1: $newPassword1
      newPassword2: $newPassword2
      confirmToken: $confirmToken
      userId: $userId
    ) {
      success
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
    }
  }
`;

export const createRoom = gql`
  mutation createRoom($users: [ID]!) {
    createRoom(users: $users) {
      error {
        __typename
        ... on ValidationErrors {
          validationErrors {
            field
            messages
          }
        }
      }
      room {
        id
      }
    }
  }
`;

export const newMessageSubscription = gql`
  subscription(
    $channelId: ID!
  ) {
    newMessage(channelId: $channelId) {
      room{
        id
      }
      id
      files{
        file
        size
      }
      seen
      text
      time
      isDeleted
      sender {
        id
        fullName
      }
    }
  }
`;

export const onlineUsersSubsciption = gql `
  subscription {
    onlineUsers{
      id
      fullName
      email
      online
    }
  }
`;

export const unviewedMessageSubscription = gql`
  subscription(
    $userId: Int!
  ) {
    notifications(userId: $userId) {
      id
      unviewedMessages(userId: $userId)
      typing
    }
  }
`;

export const readMessages = gql`
  mutation readMessages(
    $roomId: ID!
    ) {
    reedMessages(roomId: $roomId) {
      success
      errors
    }
  }
`;

export const updateRoom = gql`
  mutation updateRoom($isTyping: Boolean!, $roomId: ID!) {
    updateRoom(isTyping: $isTyping, roomId: $roomId) {
      errors
      success
    }
  }
`;

export const onFocus = gql`
  query onFocus(
    $focused: Boolean,
    $roomId: ID
    ) {
    onFocus(focused: $focused, roomId: $roomId)
  }
`;

export const onFocusSubscription = gql`
  subscription onFocus(
    $roomId: ID!
  ) {
    onFocus(roomId: $roomId)
  }
`;

export const hasUnreadedMessagesSubscription = gql`
  subscription hasUnreadedMessages(
    $userId: ID!
  ) {
    hasUnreadedMessages(userId: $userId)
  }
`;