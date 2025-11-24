// account actions
export const ACCOUNT_ACTIONS = 'Account Actions';
export const ACCOUNT_ACTIONS_SAVE = 'Save Changes';

//avatar states
export const AVATAR_ONLINE = 'online';
export const AVATAR_OFFLINE = 'offline';
export const AVATAR_STUDYING = 'studying';
export const AVATAR_STATES = [
  AVATAR_ONLINE,
  AVATAR_OFFLINE,
  AVATAR_STUDYING,
] as const;
export type AvatarState = (typeof AVATAR_STATES)[number];

// change password
export const CHANGE_PASSWORD_HEADER = 'Change Password';
export const CHANGE_PASSWORD_TEXT = 'Update your password';
export const CHANGE_PASSWORD_BUTTON_TEXT = 'Change';

// delete account
export const DELETE_ACCOUNT_HEADER = 'Delete Account';
export const DELETE_ACCOUNT_TEXT =
  'Permanently delete your account and all data';
export const DELETE_ACCOUNT_BUTTON_TEXT = 'Delete';

//badge route
export const BADGE_COLLECTION_HEADER = 'Badge Collection';
export const BADGE_EARN_BADGES_TEXT =
  'Earn badges by completing and hitting milestones';

// badge collection
export const NO_UNLOCKED_BADGES_LINE_1 = 'No badges unlocked yet!';
export const NO_UNLOCKED_BADGES_LINE_2 = 'Start studying to earn badges!';
export const NO_BADGES_LINE_1 = 'There are no badges to display here';
export const NO_BADGES_LINE_2 = 'Please try again later';
export const BADGES_UNLOCKED = 'Unlocked';
export const BADGES_LOCKED = 'Locked';

// badge statistics
export const BADGES_TOTAL = 'Total';
export const BADGES_COMPLETE = 'Complete';
export const BADGES_PROGRESS = 'Collection Progress';
export const BADGES_UNLOCKED_SUFFIX = 'badges unlocked';

// error boundary
export const ERROR_BOUNDARY_PAGE_TEXT =
  'Uh oh! Something went wrong! Please try again later or refresh the page.';

// forgot password
export const FORGOT_PASSWORD_HEADER = 'Forgot your password?';
export const FORGOT_PASSWORD_EMAIL = 'Enter your email to get a reset link';
export const BACK_TO_LOGIN = 'Back to the login page';
export const RESET_PASSWORD_BUTTON_TEXT = 'Reset password';

// login
export const LOGIN_HEADER = 'Welcome to Studly';
export const LOGIN_DESCRIPTION =
  'Sign in to your account and continue your learning journey';
export const LOGIN_FORGOT_PASSWORD_BUTTON_TEXT = 'Forgot password?';
export const LOGIN_BUTTON_TEXT = 'Sign In';
export const LOGIN_SIGN_UP_PREFIX = "Don't have an account?";
export const LOGIN_SIGN_UP_BUTTON_TEXT = 'Sign Up';

// navbar
export const NAVBAR_HEADER = 'Studly';
export const NAVBAR_HOME = 'Home';
export const NAVBAR_STUDY = 'Study Session';
export const NAVBAR_BADGES = 'Badges';
export const NAVBAR_PROFILE = 'Profile';
export const NAVBAR_SETTINGS = 'Settings';
export const NAVBAR_LOGOUT = 'Logout';
export const NAVBAR_LEADERBOARDS = 'Leaderboard';

// recent study sessions
export const RECENT_HEADER = 'Recent Sessions';
export const RECENT_COLUMN_1 = 'Session Ended';
export const RECENT_COLUMN_2 = 'Subject';
export const RECENT_COLUMN_3 = 'Length';
export const RECENT_NO_SESSIONS = 'No sessions completed yet';
export const RECENT_START_SESSION = 'Start your first session!';

// setup study session
export const STUDY_HEADER = 'Session Setup';
export const STUDY_QUICK_SESSION_HEADER = 'Quick Session Length';
export const STUDY_QUICK_15_MINS = '15 minutes';
export const STUDY_QUICK_30_MINS = '30 minutes';
export const STUDY_QUICK_45_MINS = '45 minutes';
export const STUDY_QUICK_1_HOUR = '1 hour';

// sign up
export const SIGN_UP_RULE_1 =
  '• Password must be at least one 8 characters long';
export const SIGN_UP_RULE_2 =
  '• Password must contain at least one lowercase letter';
export const SIGN_UP_RULE_3 =
  '• Password must contain at least one uppercase letter';
export const SIGN_UP_RULE_4 =
  '• Password must contain at least one digit (0-9)';
export const SIGN_UP_RULE_5 =
  '• Password must contain at least one special character (@, #, $, %, ^, &, *, (, ), -, _, +, =)';
export const SIGN_UP_HEADER = 'Join Studly';
export const SIGN_UP_DESCRIPTION =
  'Create your account and start your gamified learning journey';
export const SIGN_UP_BUTTON_TEXT = 'Sign Up';
export const SIGN_UP_ALREADY_HAVE_ACCOUNT_TEXT = 'Already have an account?';
export const SIGN_UP_SIGN_IN_BUTTON_TEXT = 'Sign In';

// study session
export const STUDY_SESSION_HEADER = 'Current Session';
export const STUDY_SESSION_DESCRIPTION = 'Configure your study session';
export const STUDY_SESSION_TIME_REMAINING = 'remaining';
export const STUDY_SESSION_START_BUTTON_TEXT = 'Start';
export const STUDY_SESSION_STOP_BUTTON_TEXT = 'Stop';

// study tips
export const STUDY_TIPS_HEADER = 'Study Tips';
export const STUDY_TIPS_1 = 'Take regular breaks to maintain focus';
export const STUDY_TIPS_2 = 'Set specific goals for each session';
export const STUDY_TIPS_3 = 'Remove distractions from your study area';
export const STUDY_TIPS_4 = 'Celebrate completing your sessions';

// todays study statistics
export const TODAYS_STUDY_HEADER = "Today's Progress";
export const TODAYS_STUDY_TIME = 'Study Time';
export const TODAYS_STUDY_SESSIONS = 'Sessions';

// update password
export const UPDATE_PASSWORD_BUTTON_TEXT = 'Update Password';

//Friends page
export const FRIENDS_HEADER = 'FRIENDS';
export const FRIENDS_HEADER_DESCRIPTION =
  'Connect with fellow students and study together';
export const FRIENDS_TAB_FRIENDS = 'Friends';
export const FRIENDS_TAB_REQUESTS = 'Requests';
export const FRIENDS_TAB_SUGGESTIONS = 'Suggestions';
export const FRIENDS_CARD_ONLINE = 'Online';
export const FRIENDS_CARD_STUDYING = 'Studying';
export const FRIENDS_SEARCHBAR_PLACEHOLDER = 'Search friends...';
export const FRIENDS_VIEW_PROFILE = 'View Profile';
// study page
export const STUDY_ROUTE_HEADER = 'Study Session';
export const STUDY_ROUTE_SUBHEADER = 'Focus and track your study time';

// leaderboards page
export const LEADERBOARD_ROUTE_HEADER = 'Leaderboard';
export const LEADERBOARD_ROUTE_SUBHEADER =
  'See how you rank among your fellow students';
export const LEADERBOARD_PAGE_STUDY_HEADER = 'Study Time Leaders';
export const LEADERBOARD_PAGE_STUDY_SUBHEADER = 'Weekly study time rankings';
export const LEADERBOARD_PAGE_BADGES_HEADER = 'Badge Leaders';
export const LEADERBOARD_PAGE_BADGES_SUBHEADER = 'Weekly badges rankings';
export const LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT = 'Friends Only';
export const LEADERBOARD_NO_DATA = 'There is no data for this leaderboard';
export const LEADERBOARD_SINGLE_BADGES_TEXT = 'badge';
export const LEADERBOARD_MULTIPLE_BADGES_TEXT = 'badges';
export const LEADERBOARD_NO_NAME = 'Unknown';

//Profile strings
export const PROFILE_EDIT_TEXT = 'Edit';
export const PROFILE_SHARE_TEXT = 'Share';
export const PROFILE_EXPERIENCE_POINTS_TEXT = 'Experience Points';
export const PROFILE_BIO_DEFAULT = 'Edit Profile to update your bio';
export const PROFILE_THIS_WEEKS_STATS_HEADER = 'Your study activity this week';
export const PROFILE_SUBJECTS_THIS_WEEK_TEXT = 'Subjects This Week:';
export const PROFILE_LATEST_ACHIEVEMENT_TEXT = 'Your latest achievements';
export const PROFILE_SUBJECT_DISTRIBUTION_TEXT = 'Subject Distribution';
export const PROFILE_TIME_SPENT_ON_DIFFERENT_SUBJECTS_TEXT =
  'Time spent on different subjects';
export const PROFILE_RECENT_BADGES = 'Recent Badges';
export const PROFILE_THIS_WEEK_HEADER = 'This Week';
export const PROFILE_INFORMATION_TEXT = 'Profile Information';
export const PROFILE_UPDATE_INFORMATION_TEXT =
  'Update your personal information and profile details';
export const PROFILE_CHANGE_AVATAR = 'Change Avatar';
export const PROFILE_AVATAR_IMAGE_SPECS = 'JPG,PNG up to 5MB';
export const PROFILE_FULL_NAME_TEXT = 'Full Name';
export const PROFILE_EMAIL_ADDRESS_TEXT = 'Email Address';
export const PROFILE_BIO_TEXT = 'Bio';
export const PROFILE_CHARACTER_LIMIT = '/200 characters';

//settings constants
export const SETTINGS_HEADER = 'Settings';
export const SETTINGS_DESCRIPTION =
  'Manage your account settings and preferences. (Profile is the only tab accessible currently)';
