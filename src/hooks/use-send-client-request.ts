"use client";

import { usePathname, useRouter } from "next/navigation";

import status from "http-status";

import { getLoginUrl } from "@/utils/get-login-url";
import { sendRequest, SendRequestParams } from "@/utils/send-request";

export function useSendClientRequest() {
  const router = useRouter();
  const pathname = usePathname();

  return {
    sendClientRequest: async <Req = null, Res = null, ResErr = null>({
      state,
      request,
      response,
    }: SendClientRequestParams<Req, Res, ResErr>): Promise<boolean> => {
      if (state?.isWaitingResponse?.setIsWaitingResponse) {
        state.isWaitingResponse.setIsWaitingResponse(true);
      }

      const success = await sendRequest({
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
      });

      if (state?.isWaitingResponse?.setIsWaitingResponse) {
        if (success) {
          if (state?.isWaitingResponse?.willRestoreOnSuccess !== false) {
            state.isWaitingResponse.setIsWaitingResponse(false);
          }
        } else {
          state.isWaitingResponse.setIsWaitingResponse(false);
        }
      }

      return success;
    },
  };
}

type SendClientRequestParams<
  Req = null,
  Res = null,
  ResErr = null,
> = SendRequestParams<Req, Res, ResErr> & {
  state?: SendClientRequestStates;
};

export type SendClientRequestStates = {
  isWaitingResponse?: {
    setIsWaitingResponse?: (value: boolean) => void;
    willRestoreOnSuccess?: boolean;
  };
};
