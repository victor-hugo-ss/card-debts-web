import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getMe, queryKeys } from "../shared/api/endpoints";
import { clearToken, getToken, setToken } from "../shared/lib/storage";
import { queryClient } from "../shared/lib/query-client";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: Boolean(getToken()),
  });
}

export function useLogout() {
  const navigate = useNavigate();

  return () => {
    clearToken();
    queryClient.clear();
    navigate("/login", { replace: true });
  };
}

export function persistSession(token: string) {
  setToken(token);
  queryClient.invalidateQueries({ queryKey: queryKeys.me });
}
