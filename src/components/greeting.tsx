import { userSheetOpenAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";

export function Greeting() {
  const setUserSheetOpen = useSetAtom(userSheetOpenAtom);
  return (
    <div className="w-full rounded-lg flex flex-col overflow-hidden mt-14">
      <h1 className="font-bold text-2xl md:text-3xl leading-tight">
        Resume Builder
      </h1>
        <div className="text-white text-base">
          <p className="font-medium my-2">Build a sick resume in minutes!</p>
          <p className="mb-4">
            1. We have just a single no BS ATS Friendly template
            <br />
            2. Tell the assistant about yourself or paste a JD or{" "}
            <span
              onClick={() => setUserSheetOpen(true)}
              className="underline cursor-pointer"
            >
              populate the resume data yourself
            </span>
            <br />
            3. Click on the export pdf button on the top right to download your
            resume
          </p>
        </div>
    </div>
  );
}
