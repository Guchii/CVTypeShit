import getJQ from "./jq-wasm";
import { atomWithRefresh } from "jotai/utils";

function devNull(_: string) {
  console.log(_);
  // do nothing
}

const loadJQ = async () => {
    const jq = await getJQ({
    print: devNull,
    printErr: devNull,
    noExitRuntime: false,
  });
  return jq;
}


export const jqAtom = atomWithRefresh(async () => {
    return await loadJQ(); 
})
