import hiyokoGakkouUrl from "../assets/sound/hiyoko-gakkou.mp3";
import techiTechiSeikatsuUrl from "../assets/sound/techi-techi-seikatsu.mp3";
import yuruyuruJugyouUrl from "../assets/sound/yuruyuru-jugyou.mp3";

/** Session BGM pool. One track is chosen per sound-on session. */
export const BACKGROUND_TRACKS = [
  hiyokoGakkouUrl,
  techiTechiSeikatsuUrl,
  yuruyuruJugyouUrl,
] as const;
