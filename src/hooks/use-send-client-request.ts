"use client";

import { useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import status from "http-status";

import { UserContext } from "@/contexts/user";
import { getLoginUrl } from "@/utils/get-login-url";
import { sendRequest, SendRequestParams } from "@/utils/send-request";

export function useSendClientRequest() {
  const router = useRouter();
  const pathname = usePathname();

  const { logout } = useContext(UserContext);

  return useMemo(
    () => ({
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
                logout();
                router.push(getLoginUrl(pathname));
                return false;
              },

              [status.CONFLICT]: () => {
                alert("로그인 상태가 충돌하여 로그아웃됩니다.");
                router.push(getLoginUrl(pathname));
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
    }),
    // 무시하는 항목: router
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname],
  );
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
