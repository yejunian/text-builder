export async function sendRequest<Req = null, Res = null, ResErr = null>({
  request,
  response,
}: SendRequestParams<Req, Res, ResErr>): Promise<boolean> {
  // Fetch API 예외는 그대로 전파
  const apiResponse = await fetch(request.url, {
    method: request.method,
    body:
      request.body === undefined || request.body === null
        ? null
        : JSON.stringify(request.body),
  });

  const responseText = await apiResponse.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (apiResponse.ok) {
    if (response.handler && response.handler[apiResponse.status]) {
      // 2xx 응답 중 특정 상태 코드 처리 (기본 처리 무시)
      const success = await response.handler[apiResponse.status](
        responseBody as Res,
      );
      return success ?? true;
    } else if (response.handler?.ok) {
      // 2xx 응답 기본 처리
      const success = await response.handler.ok(responseBody as Res);
      return success ?? true;
    } else {
      // 대응하는 핸들러 없음
      return true;
    }
  } else {
    if (response.handler && response.handler[apiResponse.status]) {
      // 4xx, 5xx 응답 중 특정 상태 코드 처리 (기본 처리 무시)
      const success = await response.handler[apiResponse.status](
        responseBody as ResErr,
      );
      return success ?? false;
    } else if (response.handler?.notOk) {
      // 4xx, 5xx 응답 기본 처리
      const success = await response.handler.notOk(responseBody as ResErr);
      return success ?? false;
    } else {
      // 대응하는 핸들러 없음
      return false;
    }
  }
}

export type SendRequestParams<Req = null, Res = null, ResErr = null> = {
  request: {
    url: string;
    method?: "get" | "post" | "put" | "patch" | "delete" | "head" | "options";
    body?: Req;
  };

  response: {
    handler: {
      [code: number]: (
        body: Res | ResErr,
      ) => Promise<boolean | void> | boolean | void;
      notOk?: (body: ResErr) => Promise<boolean | void> | boolean | void;
      ok?: (body: Res) => Promise<boolean | void> | boolean | void;
    };
  };
};
