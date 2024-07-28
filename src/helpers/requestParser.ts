import { NextRequest } from 'next/server';

export async function parseBody(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await req.json();
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    // Convert specific fields to their appropriate types
    if (body.user_id) body.user_id = parseInt(body.user_id, 10);
    if (body.likes) body.likes = parseInt(body.likes, 10);
    if (body.category_id) body.category_id = parseInt(body.category_id, 10);

    return body;
  } else {
    throw new Error('Unsupported content type');
  }
}

// When data is sent using application/x-www-form-urlencoded, all values are received as strings. To handle this, you need to convert these string values to their appropriate types before parsing them with your schema.