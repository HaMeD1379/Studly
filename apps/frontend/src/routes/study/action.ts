import type { ActionFunctionArgs } from 'react-router';
import { startSession, stopSession } from '~/api';
import { setSessionId } from '~/utilities/session';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const type = formData.get('type');

  if (type === 'start') {
    const subject = String(formData.get('subject'));
    const startTime = Number(formData.get('startTime'));
    const endTime = Number(formData.get('endTime'));

    const result = await startSession(startTime, endTime, subject);
    const sessionId = result.data && (await result.data)?.session.id;

    if (sessionId) {
      setSessionId(sessionId);
    }

    return result;
  } else if (type === 'stop') {
    const result = await stopSession();
    return result;
  }

  return { data: false };
};
