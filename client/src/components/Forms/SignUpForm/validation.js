import * as yup from 'yup';
import { MIN_PASSWORD_LENGTH } from '../../../constants'

export const SignupSchema = yup.object().shape({
  fullName: yup.string()
    .min(2, 'Name has to be longer than 2 characters!')
    .max(64, 'Name has to be shorter than 64 characters!')
    .required('Name is required!'),
  email: yup.string()
    .email('E-mail is not valid!')
    .required('E-mail is required!'),
  password1: yup.string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password has to be longer than ${MIN_PASSWORD_LENGTH} characters!`
    )
    .required('Password is required!'),
  password2: yup.string()
    .required('Password confirmation is required!')
    .min(
      MIN_PASSWORD_LENGTH,
      `Password has to be longer than ${MIN_PASSWORD_LENGTH} characters!`
    )
})
