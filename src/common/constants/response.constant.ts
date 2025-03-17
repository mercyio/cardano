export const RESPONSE_CONSTANT = {
  AUTH: {
    REGISTER_SUCCESS:
      'Registration Successful, check email for account verification code',
    LOGIN_SUCCESS: 'Login Successful',
    EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
    PHONE_VERIFICATION_SUCCESS: 'Phone verified successfully',
    PASSWORD_RESET_EMAIL_SUCCESS: 'Password Reset Email Sent Successfully',
    PASSWORD_RESET_SUCCESS: 'Password Reset Successfully',
  },
  OTP: {
    OTP_VERIFIED_SUCCESS: 'OTP verified successfully',
    OTP_SENT_SUCCESS: 'OTP sent successfully',
  },
  USER: {
    GET_CURRENT_USER_SUCCESS: 'Current User Retrieved Successfully',
    CHANGE_EMAIL_SUCCESS:
      'Email Changed Successfully, check email for verification code',
    VERIFICATION_SUCCESS: 'Verification Successful',
    PIN_CREATED_SUCCESS: 'Transaction pin set successfully',
    PIN_UPDATED_SUCCESS: 'Transaction pin updated successfully',
  },
  CAMPAIGN: {
    CAMPAIGN_CREATE_SUCCESS: 'Campaign created successfully',
  },
  CONTRIBUTOR: {
    CONTRIBUTOR_CREATE_SUCCESS: 'Contributor created successfully',
  },
  WATCHLIST: {
    WATCHLIST_ADD_SUCCESS: 'Watchlist created successfully',
    WATCHLIST_REMOVE_SUCCESS: 'Watchlist removed successfully',
    WATCHLIST_GET_SUCCESS: 'Watchlist retrieved successfully',
  },
  WAITLIST: {
    JOIN_WAITLIST_SUCCESS: 'You have joined the waitlist successfully',
  },
  ORDER: {
    ORDER_RECEIPT_CONFIRMATION_SUCCESS:
      'Order confirmed successfully, thanks for your purchase!',
  },
};
