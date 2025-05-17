import { userSheetOpenAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const TextScramble: React.FC<{
  finalText: string;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}> = ({ finalText, text, setText }) => {
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setText(() =>
        finalText
          .split("")
          .map((_, index) => {
            if (index < iteration) {
              return finalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= finalText.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return text;
};

export default function Greeting() {
  const setUserSheetOpen = useSetAtom(userSheetOpenAtom);
  const [text, setText] = useState("");
  return (
    <div className="w-full rounded-lg flex flex-col overflow-hidden mt-14">
      <h1 className="font-bold text-2xl md:text-3xl leading-tight">
        <TextScramble {...{ text, setText }} finalText="Resume Builder" />
      </h1>
      {text === "Resume Builder" && (
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
      )}
    </div>
  );
}
