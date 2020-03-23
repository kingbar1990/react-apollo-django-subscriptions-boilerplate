import * as yup from 'yup';

export const UserFormValidate = yup.object().shape({
  email: yup.string()
    .email("E-mail is not valid!")
    .required("E-mail is required!")
});
