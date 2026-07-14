import status from "http-status";

export function parseRequestBody<T>(
  bodyText: string,
  validator: (param: unknown) => param is T,
) {
  let body: unknown;

  try {
    body = JSON.parse(bodyText);
  } catch (error) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  if (validator(body)) {
    return body;
  } else {
    return new Response(null, { status: status.BAD_REQUEST });
  }
}
