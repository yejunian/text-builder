"use client";

import { usePathname, useRouter } from "next/navigation";

import status from "http-status";

import { getLoginUrl } from "@/utils/get-login-url";
import { sendRequest, SendRequestParams } from "@/utils/send-request";

export function useSendClientRequest() {
  const router = useRouter();
  const pathname = usePathname();

  return {
    sendClientRequest: <Req = null, Res = null, ResErr = null>({
      request,
      response,
    }: SendRequestParams<Req, Res, ResErr>): Promise<boolean> =>
      sendRequest({
        request,

        response: {
          ...response,

          handler: {
            ...response.handler,

            [status.UNAUTHORIZED]: () => {
              alert("로그인이 필요합니다.");
              router.push(getLoginUrl(pathname));
              return false;
            },

            [status.CONFLICT]: () => {
              alert("이미 로그인했습니다.");
              router.push("/works");
              return false;
            },
          },
        },
      }),
  };
}
