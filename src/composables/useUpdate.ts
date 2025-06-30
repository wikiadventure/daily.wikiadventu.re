import { useReducer } from "react";

const updateReducer = function (num:number) { return (num + 1) % 1000000; };

export function useUpdate() {
    var _a = useReducer(updateReducer, 0), update = _a[1];
    return update;
}