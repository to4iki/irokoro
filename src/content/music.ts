import hiyokoGakkouUrl from "../assets/sound/hiyoko-gakkou.mp3";
import techiTechiSeikatsuUrl from "../assets/sound/techi-techi-seikatsu.mp3";
import yuruyuruJugyouUrl from "../assets/sound/yuruyuru-jugyou.mp3";

export {
  MOMIJIBA_LICENSE_URL,
  MOMIJIBA_SITE_URL,
} from "./music-credits";

export type BackgroundTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  pageUrl: string;
};

/** Session BGM pool. One track is chosen per sound-on session. */
export const BACKGROUND_TRACKS = [
  {
    id: "hiyoko-gakkou",
    title: "ひよこの学校",
    artist: "もみじば",
    src: hiyokoGakkouUrl,
    pageUrl: "https://music.storyinvention.com/hiyoko-gakkou/",
  },
  {
    id: "techi-techi-seikatsu",
    title: "てちてち生活",
    artist: "もみじば",
    src: techiTechiSeikatsuUrl,
    pageUrl: "https://music.storyinvention.com/techi-techi-seikatsu/",
  },
  {
    id: "yuruyuru-jugyou",
    title: "ゆるゆる授業",
    artist: "もみじば",
    src: yuruyuruJugyouUrl,
    pageUrl: "https://music.storyinvention.com/yuruyuru-jugyou/",
  },
] as const satisfies readonly BackgroundTrack[];
