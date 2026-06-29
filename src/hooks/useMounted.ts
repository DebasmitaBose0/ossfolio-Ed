import { useEffect, useRef } from "react";

export function useMounted(): boolean {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  return mounted.current;
}
