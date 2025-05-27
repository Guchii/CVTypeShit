import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import Greeting from "@/components/greeting.mdx";

type LLMConfigSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AboutSheet({
  open,
  onOpenChange,
}: LLMConfigSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] gap-0 sm:w-[540px] border-zinc-800 p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="prose prose-invert prose-headings:m-0 prose-li:text-white prose-headings:mb-4 prose-img:m-0 prose-img:my-2">
            <Greeting />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
