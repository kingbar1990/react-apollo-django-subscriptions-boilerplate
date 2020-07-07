import React, { useState } from "react";
import { graphql} from "react-apollo";
import { flowRight as compose }  from 'lodash';


import { MDBContainer, MDBRow } from "mdbreact";
import Profile from "../../components/UserProfile";
import UserEditForm from "../../components/Forms/UserEditForm";

import { getBase64 } from "../../utils";
import { User, editUser } from "../../queries";

const EditUser = props => {
  const [state, setState] = useState({
    avatar: "",
    imageError: null
  });

  const handleImageChange = e => {
    try {
      if (!e.target.files) {
        return;
      }
      let file = e.target.files[0];
      if (file.size <= 1048576) {
        getBase64(file)
          .then(image => (file = image))
          .then(() => setState({ avatar: file, imageError: null }));
      }
      setState({ ...state, imageError: "max size 1MB" });
    } catch (error) {}
  };

  const handleEditUser = (values, { setErrors }) => {
    let { firstName, email } = values;
    props
      .edit({
        variables: {
          firstName: firstName || props.user.me.firstName,
          email: email,
          avatar: state.avatar
        },
        refetchQueries: [{ query: User }]
      })
      .then(response => {
        if (response.data.editUser.error.validationErrors.length) {
          let errors = {};
          response.data.editUser.error.validationErrors.map(error => {
            if (error["field"] === "email") {
              errors["email"] = error["messages"].join(" ");
            } else {
              errors[error] = error["messages"];
            }
            return null;
          });
          setErrors(errors);
        }
      });
  };
  const user = props.user.me;
  if (props.user.loading) return null;
  return (
    <MDBContainer>
      <MDBRow className="mt-3">
        <Profile profile={user} />
        <UserEditForm
          initialValues={user}
          handleEditUser={handleEditUser}
          handleImageChange={handleImageChange}
          error={state.imageError}
        />
      </MDBRow>
    </MDBContainer>
  );
};

export default compose(
  graphql(editUser, { name: "edit" }),
  graphql(User, { name: "user" })
)(EditUser);
