import { useContext, useState } from "react";
import { useRouter } from "next/navigation";

import { UserContext } from "@/contexts/user";

import { useSendClientRequest } from "./use-send-client-request";

export function useLogout() {
  const router = useRouter();

  const { logout } = useContext(UserContext);

  const { sendClientRequest } = useSendClientRequest();

  const [isWaitingLogoutResponse, setIsWaitingLoboutResponse] = useState(false);

  return {
    isWaitingLogoutResponse,

    logout: () =>
      sendClientRequest({
        state: {
          isWaitingResponse: {
            setIsWaitingResponse: setIsWaitingLoboutResponse,
            willRestoreOnSuccess: false,
          },
        },

        request: {
          url: "/api/logout",
        },

        response: {
          handler: {
            notOk: () => alert("로그아웃에 실패했습니다."),

            ok: () => {
              logout();
              router.push("/");
            },
          },
        },
      }),
  };
}
