type FinishScreenProps = {
  onReset: () => void;
};

export function FinishScreen({ onReset }: FinishScreenProps) {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_25%,rgb(255_222_121_/_64%),transparent_28%),linear-gradient(160deg,#dff2eb_0%,#fff7e5_64%,#f8ddca_100%)] p-[max(16px,env(safe-area-inset-top,0px))_max(16px,env(safe-area-inset-right,0px))_max(16px,env(safe-area-inset-bottom,0px))_max(16px,env(safe-area-inset-left,0px))] max-[430px]:place-items-stretch max-[430px]:content-center">
      <section
        className="w-full max-w-[500px] rounded-[clamp(24px,6vw,36px)] border border-white/75 bg-paper p-[clamp(18px,4vw,30px)] text-center shadow-soft backdrop-blur-[20px] max-[430px]:max-w-none max-[430px]:rounded-[28px] max-[430px]:px-[18px] max-[430px]:py-5"
        aria-labelledby="finish-title"
      >
        <div className="finish-illustration" aria-hidden="true">
          <span className="finish-sun" />
          <span className="finish-hill finish-hill--back" />
          <span className="finish-hill finish-hill--front" />
        </div>
        <p className="mb-1.5 text-[0.73rem] font-extrabold tracking-[0.16em] text-[#526776] uppercase">
          たのしかったね
        </p>
        <h1
          id="finish-title"
          className="text-[clamp(2.25rem,9vw,3.35rem)] leading-none font-black tracking-[0.06em] text-ink max-[430px]:text-[clamp(2.1rem,11vw,2.6rem)]"
        >
          おしまい
        </h1>
        <button
          className="mt-[18px] min-h-12 w-full rounded-2xl bg-ink font-black tracking-[0.04em] text-white shadow-[0_9px_20px_rgb(23_52_81_/_20%)] transition-[translate,box-shadow,background-color] duration-150 hover:translate-y-[-1px] hover:bg-[#0b2439] focus-visible:translate-y-[-1px] focus-visible:bg-[#0b2439] max-[430px]:min-h-[52px]"
          onClick={onReset}
          type="button"
        >
          はじめの画面へ
        </button>
        <p className="mt-2.5 text-center text-[0.62rem] leading-[1.5] text-[#5c6f7b]">
          自動では再開しません。続けるときは、もう一度設定してください。
        </p>
      </section>
    </main>
  );
}
