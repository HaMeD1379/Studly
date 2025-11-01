import type { ActionFunctionArgs } from 'react-router';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  console.log(formData);
  console.log(formData.get('type'));
  console.log(formData.get('length'));

  // React Router actions must return a Response, data object, or null
  return { success: true };
};
