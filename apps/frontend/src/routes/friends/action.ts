import type { ActionFunctionArgs } from 'react-router';
import { searchFriends, sendFriendRequest, updateFriendRequest } from '~/api';
import { REQUEST_ACCEPTED_STATUS, REQUEST_REJECTED_STATUS } from '~/constants';
import type { FriendsActionResponse } from '~/types';

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<FriendsActionResponse> => {
  const formData = await request.formData();
  const formType = formData.get('formtype')?.toString();

  if (!formType) return { error: 'Missing form type' };

  switch (formType) {
    case 'searchFriend': {
      const userName = formData.get('searchUser')?.toString();
      if (!userName) return { error: 'Missing credentials' };

      const res = await searchFriends(userName);
      if (res.error) return { error: res.error.message ?? 'Unknown error' };

      const parsed = res.data?.data;
      if (!parsed) return { error: 'Invalid API response' };

      return {
        data: res.data?.data,
        formtype: 'searchFriends',
      } as FriendsActionResponse;
    }

    case 'sendFriendRequest': {
      const userId = formData.get('userId')?.toString();
      const requestUserId = formData.get('requestUserId')?.toString();
      if (!userId || !requestUserId) return { error: 'Missing credentials' };
      const res = await sendFriendRequest(userId, requestUserId);
      if (res.error) return { error: res.error.message ?? 'Unknown error' };

      return {
        data: res.data,
        formtype: 'sendFriendRequest',
        message: 'Friend request sent',
      } as FriendsActionResponse;
    }
    case 'acceptRequest': {
      const from_user = formData.get('from_user')?.toString();
      const to_user = formData.get('to_user')?.toString();
      if (!from_user || !to_user) return { error: 'Missing credentials' };
      const res = await updateFriendRequest(
        from_user,
        to_user,
        REQUEST_ACCEPTED_STATUS,
      );
      if (res.error) return { error: res.error.message ?? 'Unknown error' };

      return {
        data: res.data,
        formtype: 'sendFriendRequest',
        message: 'Friend request sent',
      } as FriendsActionResponse;
    }
    case 'rejectRequest': {
      const from_user = formData.get('from_user')?.toString();
      const to_user = formData.get('to_user')?.toString();
      if (!from_user || !to_user) return { error: 'Missing credentials' };
      const res = await updateFriendRequest(
        from_user,
        to_user,
        REQUEST_REJECTED_STATUS,
      );
      if (res.error) return { error: res.error.message ?? 'Unknown error' };
      return {
        data: res.data,
        formtype: 'sendFriendRequest',
        message: 'Friend request sent',
      } as FriendsActionResponse;
    }

    default:
      return { error: 'Unknown form type' };
  }
};
