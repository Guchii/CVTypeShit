import { LoaderPinwheel } from "lucide-react";
import { memo } from "react";
import { atomWithQuery } from "jotai-tanstack-query";
import { useAtomValue } from "jotai";

const REPO = "guchii/resume-builder";

const VERY_LARGE_NUMBER = 50000000; // Fallback value for error handling

const starsAtom = atomWithQuery<number>(() => ({
  queryKey: ["stars"],
  queryFn: async ({ signal }) => {
    const response = await fetch(`https://api.github.com/repos/${REPO}`, {
      signal,
    });
    const json = await response.json();
    if (!response.ok) {
      return VERY_LARGE_NUMBER;
    }
    return json.stargazers_count;
  },
  retry: 0,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
}));

const GithubStar = ({ className }: { className: string }) => {
  const { data: stars, isLoading } = useAtomValue(starsAtom);

  const content = isLoading ? (
    <LoaderPinwheel className="animate-spin" />
  ) : (
    stars
  );
  return (
    <a target="_blank" href={`https://github.com/${REPO}`} className={"block " + className}>
      {content} GitHub Stars and counting :)
    </a>
  );
};

export default memo(GithubStar);
