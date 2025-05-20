import { appLoadingAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";

export default function AppLoader() {
  const appLoading = useAtomValue(appLoadingAtom);
  if (!appLoading) return null;
  return (
    <div className="h-full-w-full inset-0 fixed fancy-wrapper">
      <div className="fancy"></div>
    </div>
  );
}
