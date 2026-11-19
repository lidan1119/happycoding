import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  acts,
  choices,
  endings,
  epilogue,
  has,
  people,
  promises,
  relationship,
  scenes,
  type State,
  type Person,
} from "./adventure.ts";
import { products } from "./shop.ts";
import { SceneBoundary } from "./SceneBoundary.tsx";
import { useDialogueVoice } from "./dialogueVoice.ts";
import { stageFor, cast, type Npc } from "./staging.ts";
const World = lazy(() => import("./World.tsx"));
type Props = {
  run: State;
  collection: string[];
  storageError: boolean;
  onPick: (id: string) => void;
  onBack: () => void;
  onReplay: () => void;
  onDownload: () => void;
  onCopy: () => void;
};
const observations = [
  [
    "店门上的营业时间写着“直到你愿意出发”。门后已经没有店主了。",
    "橘猫的名片反面有一句小字：离别风险，请提前申报。",
    "路边的 0 路车没有熄火。司机似乎还在等某个具体的人。",
  ],
  [
    "站牌上“以后”两个字正在褪色。“今天”那一栏却写得格外清楚。",
    "最后一班车还开着门。车票背面印着：不保证终点，保证同行。",
    "天窗透下一束光。这里并非没有出口，只是指示牌都藏在广告后面。",
  ],
  [
    "档案馆的每扇窗里，存着一个尚未发生的清晨。",
    "门口写着：失物招领，不收“早知道”。",
    "一本没关好的账本上，所有默认选项都被打了勾。",
  ],
  [
    "桥下不是水，是全城人说过但还没做的“下次一定”。",
    "控制台的灯还有电。你离它很近，离某些承诺却很远。",
    "道路尽头有车灯一闪。你认识的人，可能还在等你开口。",
  ],
  [
    "东方有一点亮色，但今天的清晨还没决定属于谁。",
    "控制台上没有“最佳选择”按钮。每条路都有未完的部分。",
    "末班车门始终开着。有人把一张空白目的地牌留给了你。",
  ],
];
export function AdventureView({
  run,
  collection,
  storageError,
  onPick,
  onBack,
  onReplay,
  onDownload,
  onCopy,
}: Props) {
  const node = scenes[run.node];
  const [reading, setReading] = useState({ node: node.id, line: 0 });
  const line = reading.node === node.id ? reading.line : 0;
  const setLine = (value: number) => setReading({ node: node.id, line: value });
  const [inspection, setInspection] = useState("");
  const [look, setLook] = useState(0);
  const drawer = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const decisionHeading = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setLine(0);
    setInspection("");
    heading.current?.focus({ preventScroll: true });
  }, [node.id]);
  const final = !!node.ending;
  const deciding = line >= node.text.length;
  const options = choices(run);
  useEffect(() => {
    if (deciding) decisionHeading.current?.focus({ preventScroll: true });
  }, [deciding]);
  const stage = stageFor(node, line);
  const voice = useDialogueVoice();
  const audioLine = final
    ? node.text.join("。")
    : deciding
      ? ""
      : node.text[line];
  const primaryNpc = stage.npcs.length === 1 ? stage.npcs[0] : undefined;
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const talk = (description: string, npc?: Npc) => {
    setInspection(npc ? `${cast[npc].name}：“${description}”` : description);
    if (npc && voice.enabled) voice.speak(description, npc);
  };
  useEffect(() => {
    if (voiceRef.current.enabled && audioLine)
      voiceRef.current.speak(audioLine, primaryNpc);
    else voiceRef.current.stop();
  }, [node.id, line, audioLine, primaryNpc]);
  const inspect = () => {
    const subjects = [
      ...stage.npcs.map((id) => `${cast[id].name}：“${cast[id].line}”`),
      ...observations[node.act - 1],
    ];
    setInspection(subjects[look % subjects.length]);
    setLook(look + 1);
  };
  useEffect(() => {
    setInspection("");
    setLook(0);
  }, [node.id, stage.beat]);
  const advance = () => {
    setLine(Math.min(line + 1, node.text.length));
    next.current?.focus({ preventScroll: true });
  };
  return (
    <div className={`game-shell ${final ? "game-finale" : ""}`}>
      <div className="game-world">
        <SceneBoundary>
          <Suspense
            fallback={
              <div className="world loading-world">正在点亮街角的灯…</div>
            }
          >
            <World stage={stage} ending={final} onInspect={talk} />
          </Suspense>
        </SceneBoundary>
      </div>
      <div className="game-vignette" />
      <nav className="game-hud" aria-label="游戏菜单">
        <button onClick={onBack} className="hud-back">
          ← 小卖部
        </button>
        <div className="game-chapter">
          <span>明天暂停营业</span>
          <small>
            第 {node.act} 幕 / {acts[node.act - 1]}
          </small>
        </div>
        <div className="hud-right">
          <button onClick={inspect}>⌖ 环顾四周</button>
          {voice.supported && (
            <button
              aria-pressed={voice.enabled}
              onClick={() => {
                if (voice.enabled) voice.stop();
                else voice.speak(audioLine || "语音已开启。", primaryNpc);
                voice.setEnabled(!voice.enabled);
              }}
            >
              {voice.enabled ? "关闭语音" : "开启语音"}
            </button>
          )}
          <button onClick={() => drawer.current?.showModal()}>
            ☷ 行囊与足迹
          </button>
        </div>
      </nav>
      <div className="scene-caption" key={`${node.id}-${stage.beat}`}>
        <span>PARALLEL LIFE / 0{node.act}</span>
        <h2>
          {node.id === "opening" && stage.set === "street"
            ? "宇宙拐角 · 店外"
            : node.place}
        </h2>
        <div className="scene-dots" aria-label={`第${node.act}幕`}>
          {acts.map((a, i) => (
            <i key={a} className={i < node.act ? "lit" : ""} />
          ))}
        </div>
      </div>
      {!final && stage.npcs.length > 0 && (
        <div className="npc-actions" role="group" aria-label="交谈对象">
          {stage.npcs.map((id) => (
            <button key={id} onClick={() => talk(cast[id].line, id)}>
              与{cast[id].name}交谈
            </button>
          ))}
        </div>
      )}
      {voice.enabled && voice.failed && (
        <p className="voice-warning" role="status">
          当前设备没有可用的中文语音。你可以继续阅读字幕。
        </p>
      )}
      {inspection && (
        <div className="inspection" role="status">
          <span>⌖ 你注意到</span>
          <p>{inspection}</p>
          <button aria-label="关闭观察" onClick={() => setInspection("")}>
            ×
          </button>
        </div>
      )}
      {storageError && (
        <div className="game-storage-warning" role="status">
          当前无法存档，请保持页面打开。
        </div>
      )}
      {final ? (
        <section className="finale-window narrative" aria-label="人生结局">
          <div className="ending-reveal">
            <span className="eyebrow">THIS IS HOW YOUR TOMORROW BEGINS</span>
            <h1 ref={heading} tabIndex={-1}>
              {node.title}
              <span>。</span>
            </h1>
            <div className="ending-stamp">
              人生档案{" "}
              {String(
                endings.findIndex((e) => e.id === node.ending) + 1,
              ).padStart(2, "0")}{" "}
              / 08 · {run.history.length} 次选择
            </div>
          </div>
          <div className="story-prose">
            {node.text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <section className="afterword">
            <h2>他们后来怎样了</h2>
            {epilogue(run).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
          <section className="promise-note">
            <h2>尚未完成的事</h2>
            <ul>
              {promises(run).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>
          <section className="ending-actions">
            <button className="primary" onClick={onDownload}>
              ↓ 保存完整人生档案
            </button>
            <button className="secondary" onClick={onCopy}>
              复制文字
            </button>
            <button className="secondary" onClick={onReplay}>
              同样的能力，换一种走法
            </button>
            <button className="text-button" onClick={onBack}>
              回小卖部，换一种人生 →
            </button>
          </section>
          <p className="fiction-note">纯属脑洞，概不预测人生。</p>
        </section>
      ) : (
        <>
          <section
            className={`dialogue-stage narrative ${deciding ? "decision-mode" : ""}`}
            aria-label="剧情对话"
            key={node.id}
          >
            <div className="dialogue-top">
              <span className="dialogue-speaker">{stage.speaker}</span>
              <h1 ref={heading} tabIndex={-1}>
                {node.title}
              </h1>
              <small>
                {deciding
                  ? "命运分岔口"
                  : `${Math.min(line + 1, node.text.length)} / ${node.text.length}`}
              </small>
            </div>
            {!deciding ? (
              <>
                <div className="spoken-line" key={line} aria-live="polite">
                  <p>{node.text[line]}</p>
                </div>
                <div className="dialogue-controls">
                  <span>
                    {run.journal.length
                      ? "↳ " + run.journal.at(-1)!.outcome
                      : "一切始于你买下的那张小票。"}
                  </span>
                  <button
                    className="skip-dialogue"
                    onClick={() => setLine(node.text.length)}
                  >
                    直接行动
                  </button>
                  <button
                    ref={next}
                    className="advance-dialogue"
                    data-action="advance"
                    onClick={advance}
                  >
                    {line === node.text.length - 1 ? "作出选择" : "继续"}{" "}
                    <b>▸</b>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className="decision-intro"
                  tabIndex={-1}
                  ref={decisionHeading}
                >
                  <span>你会怎么做？</span>
                  <button className="text-button" onClick={() => setLine(0)}>
                    ↺ 回看对话
                  </button>
                </div>
                <div className="game-choices">
                  {options.map((option) => (
                    <button
                      className="game-choice"
                      key={option.id}
                      data-choice={option.id}
                      onClick={() => onPick(option.id)}
                    >
                      <span className="choice-mark">◇</span>
                      <span>
                        <strong>{option.label}</strong>
                        {option.hint && <small>{option.hint}</small>}
                      </span>
                      <span>↗</span>
                    </button>
                  ))}
                </div>
                <small className="choice-whisper">有人会记住这个选择。</small>
              </>
            )}
          </section>
        </>
      )}
      <dialog className="memory-drawer" ref={drawer}>
        <div className="drawer-header">
          <span>属于这一天的记忆</span>
          <button aria-label="关闭行囊" onClick={() => drawer.current?.close()}>
            ×
          </button>
        </div>
        <div className="journey-panel">
          <div className="journey-title">
            {storageError
              ? "仅保存在当前页面"
              : "本机自动存档 · 离开后可以继续"}
          </div>
          <h2>随身带着的「如果」</h2>
          <div className="inventory">
            {products
              .filter((p) => run.loadout.includes(p.id))
              .map((p) => (
                <div key={p.id} className={has(run, p.id) ? "" : "surrendered"}>
                  <span>{p.icon}</span>
                  <strong>{p.name}</strong>
                  <small>{has(run, p.id) ? "随身能力" : "已交还"}</small>
                </div>
              ))}
          </div>
          <h2>他们如何看你</h2>
          <div className="relationships">
            {(Object.keys(people) as Person[]).map((person) => (
              <div key={person}>
                <span>{people[person]}</span>
                <b className={run.relations[person] < 0 ? "strained" : ""}>
                  {relationship(run.relations[person])}
                </b>
              </div>
            ))}
          </div>
          <details className="journal">
            <summary>
              这一天的足迹 <span>{run.journal.length} 条</span>
            </summary>
            <ol>
              {run.journal.map((j, i) => (
                <li key={i}>
                  <strong>{j.scene}</strong>
                  <p>{j.choice}</p>
                  <small>{j.outcome}</small>
                </li>
              ))}
            </ol>
          </details>
          <details className="ending-collection">
            <summary>
              平行人生图鉴 <span>{collection.length} / 8</span>
            </summary>
            <ul>
              {endings.map((e) => (
                <li
                  key={e.id}
                  className={collection.includes(e.id) ? "unlocked" : ""}
                >
                  {collection.includes(e.id)
                    ? "✦ " + e.title
                    : "◇ 尚未经历的人生"}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </dialog>
    </div>
  );
}
