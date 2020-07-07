from django import forms
from django.core.exceptions import ObjectDoesNotExist
from django.forms.widgets import TextInput
from django.contrib.auth import get_user_model
from django.core import validators
from django.contrib.auth.forms import (
    PasswordResetForm, 
    UserCreationForm, 
    SetPasswordForm
)


class LongCharField(forms.Field):
    """ Custom Field for validating files from client """
    def __init__(
        self, max_length=10**10, min_length=None, strip=True, empty_value='',
        **kwargs
    ):
        self.max_length = max_length  # Satisfy management validation.
        self.min_length = min_length
        self.strip = strip
        self.empty_value = empty_value
        super().__init__(**kwargs)

        if min_length is not None:
            self.validators.append(
                validators.MinLengthValidator(int(min_length))
            )
        if max_length is not None:
            self.validators.append(
                validators.MaxLengthValidator(int(max_length))
            )


class UserForm(UserCreationForm):
    """ Form for user Sign up """
    class Meta:
        model = get_user_model()
        fields = ['email', 'full_name']


class UserEditForm(forms.Form):
    """ Form for editing profile """
    full_name = forms.CharField(max_length=64, required=False)
    email = forms.EmailField()
    avatar = LongCharField(widget=TextInput, required=False)

    def clean_email(self):
        email = self.cleaned_data['email']
        try:
            get_user_model().objects.get(email=email)
        except ObjectDoesNotExist as e:
            raise forms.ValidationError(e)
        return email


class SendConfirmationEmailForm(PasswordResetForm):
    """ Form for sending email confirmation to reset password """
    class Meta:
        model = get_user_model()
        fields = ('email',)

    def clean_email(self):
        email = self.cleaned_data['email']
        try:
            get_user_model().objects.get(email=email)
        except ObjectDoesNotExist as e:
            raise forms.ValidationError(e)
        return email


class SetNewPasswordForm(SetPasswordForm):
    """ Form for setting new password """
    user_id = forms.IntegerField()
    confirm_token = forms.CharField()

    def __init__(self, *args, **kwargs):
        super(SetPasswordForm, self).__init__(*args, **kwargs)

    class Meta:
        model = get_user_model()
        fields = ('new_password1', 'new_password2', 'user_id', 'token')

    def clean_new_password2(self):
        # Check if passwords match
        password1 = self.cleaned_data.get('new_password1')
        password2 = self.cleaned_data.get('new_password2')
        if password1 and password2:
            if password1 != password2:
                raise forms.ValidationError(
                    self.error_messages['password_mismatch'],
                    code='password_mismatch',
                )
        return password2
