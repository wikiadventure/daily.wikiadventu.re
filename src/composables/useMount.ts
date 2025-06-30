import { useEffect } from "react";

export function useMount(fn:()=>void) {
    return useEffect(fn, []);
}