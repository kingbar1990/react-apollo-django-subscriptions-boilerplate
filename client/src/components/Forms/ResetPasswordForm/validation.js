import * as Yup from "yup";
import { MIN_PASSWORD_LENGTH } from "../../../constants";


export const ResetPasswordSchema = yup.object().shape({
  newPassword1: yup.string()
    .min(MIN_PASSWORD_LENGTH, `Password has to be longer than ${MIN_PASSWORD_LENGTH} characters!`)
    .required("Password is required!"),
  newPassword2: yup.string()
    .min(MIN_PASSWORD_LENGTH, `Password has to be longer than ${MIN_PASSWORD_LENGTH} characters!`)
    .required("Password is required!"),
});
