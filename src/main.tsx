import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { products, total, toggle, restore, stories, receipt } from "./shop.ts";
import {
  archiveText,
  choose,
  endings,
  load,
  save,
  scenes,
  start,
  type State,
} from "./adventure.ts";
import { downloadTextImage } from "./export.ts";
import { AdventureView } from "./AdventureView.tsx";
import "./style.css";
const RUN_KEY = "parallel-life-adventure";
const COLLECTION_KEY = "parallel-life-endings";
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
function readCollection() {
  try {
    const v: unknown = JSON.parse(read(COLLECTION_KEY) ?? "[]");
    return Array.isArray(v)
      ? [
          ...new Set(
            v.filter(
              (id): id is string =>
                typeof id === "string" && endings.some((e) => e.id === id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
const initialRun = load(read(RUN_KEY));
type View = "shop" | "confirm" | "receipt" | "adventure";
function App() {
  const [ids, setIds] = useState(() => restore(read("parallel-life")));
  const [category, setCategory] = useState("全部奇遇");
  const [view, setView] = useState<View>(initialRun ? "adventure" : "shop");
  const [basketOpen, setBasketOpen] = useState(false);
  const [run, setRun] = useState<State | null>(initialRun);
  const [collection, setCollection] = useState(readCollection);
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState("");
  const [storageError, setStorageError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (text: string) => {
    setNotice(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 4200);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!run) return;
    if (!write(RUN_KEY, save(run))) setStorageError(true);
    const ending = scenes[run.node].ending;
    if (ending)
      setCollection((prev) =>
        prev.includes(ending) ? prev : [...prev, ending],
      );
  }, [run]);
  useEffect(() => {
    write(COLLECTION_KEY, JSON.stringify(collection));
  }, [collection]);
  useEffect(() => {
    setFallback("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, run?.node]);
  const go = (v: View) => {
    setView(v);
    setBasketOpen(false);
    setFallback("");
  };
  const changeProduct = (id: string) => {
    const result = toggle(ids, id);
    if (result.error) {
      notify(result.error);
      return;
    }
    setIds(result.ids);
    write("parallel-life", JSON.stringify({ version: 1, ids: result.ids }));
    notify(
      `已选 ${result.ids.length} 件，剩余 ${100 - total(result.ids)} 枚人生币。`,
    );
  };
  const begin = () => {
    if (
      run &&
      !scenes[run.node].ending &&
      !confirm("当前冒险会被新的一局替换，确定重新开始？")
    )
      return;
    try {
      setRun(start(ids));
      go("adventure");
    } catch (e) {
      notify((e as Error).message);
    }
  };
  const pick = (id: string) => {
    if (!run) return;
    try {
      setRun(choose(run, id));
    } catch (e) {
      notify((e as Error).message);
    }
  };
  const exportText = () =>
    view === "adventure" && run ? archiveText(run) : receipt(ids);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportText());
      notify("已复制，可以发给另一个宇宙的朋友。");
    } catch {
      setFallback(exportText());
      notify("复制权限不可用，请在下方文本框手动复制。");
    }
  };
  const download = async () => {
    try {
      await downloadTextImage(
        exportText(),
        view === "adventure" ? "平行人生档案.png" : "平行人生小票.png",
      );
      notify("图片已生成。");
    } catch {
      notify("图片保存失败，可以复制文字保存。");
    }
  };
  const selected = products.filter((p) => ids.includes(p.id));
  return (
    <>
      <header hidden={view === "adventure"}>
        <a
          className="brand"
          href="./"
          onClick={(e) => {
            e.preventDefault();
            go("shop");
          }}
        >
          <span className="brand-icon">✳</span>
          <span>
            平行人生<span className="brand-sub">PARALLEL LIFE MART</span>
          </span>
        </a>
        <span className="open">
          <i /> 营业中 · 直到宇宙打烊
        </span>
        <span className="edition">VOL. 002 / 明天暂停营业</span>
      </header>
      <main id="main" className={view === "adventure" ? "game-main" : ""}>
        {view === "adventure" && run ? (
          <AdventureView
            run={run}
            collection={collection}
            storageError={storageError}
            onPick={pick}
            onBack={() => go("shop")}
            onReplay={() => {
              if (
                confirm(
                  "用相同能力重走这一天？当前进度会被替换，结局图鉴会保留。",
                )
              )
                setRun(start(run.loadout));
            }}
            onDownload={download}
            onCopy={copy}
          />
        ) : view === "receipt" ? (
          <section className="result">
            <div className="eyebrow">YOUR NEXT CHAPTER IS READY</div>
            <h1>
              小票是入场券<span>。</span>
            </h1>
            <p className="muted">
              你买下了能力。现在，去看看它们会把这一天带向哪里。
            </p>
            <button className="primary enter-adventure" onClick={begin}>
              去过这一天 →
            </button>
            <p className="adventure-pitch">
              《明天暂停营业》 · 五幕分支剧情 · 选择会被记住
            </p>
            <article className="receipt">
              <div className="ticket-logo">✳</div>
              <h2>平行人生小卖部</h2>
              <div className="ticket-sub">PARALLEL LIFE · 人生入场券</div>
              <div className="rule" />
              {selected.map((p) => (
                <div className="ticket-item" key={p.id}>
                  <strong>
                    {p.icon} {p.name}
                    <span>{p.price} 币</span>
                  </strong>
                  <p>{p.power}</p>
                  <small>附赠代价：{p.side}</small>
                </div>
              ))}
              <div className="rule" />
              <div className="ticket-total">
                人生支出 <b>{total(ids)} 币</b>
              </div>
              <div className="ticket-total">
                留给未知 <b>{100 - total(ids)} 币</b>
              </div>
              {stories(ids).map((s) => (
                <section className="story" key={s.title}>
                  <span>✦ 你的能力可能擦出这样的火花</span>
                  <h3>{s.title}</h3>
                  <p>{s.story}</p>
                </section>
              ))}
              <p className="motto">故事从你推开门的那一刻开始。</p>
              <div className="barcode" />
              <p className="ticket-sub">纯属脑洞，概不预测人生。</p>
            </article>
            <div className="result-actions">
              <button className="primary" onClick={begin}>
                带上能力，进入故事 ↗
              </button>
              <button className="secondary" onClick={download}>
                ↓ 保存小票
              </button>
              <button className="secondary" onClick={copy}>
                复制文字
              </button>
              <button className="text-button" onClick={() => go("shop")}>
                ← 回店里再逛逛
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span>✦</span> SOMEWHERE BETWEEN REALITY & WHAT IF
                </div>
                <h1>
                  如果人生可以选购，
                  <br />
                  你会
                  <span className="highlight">
                    带走什么
                    <svg viewBox="0 0 380 15" aria-hidden="true">
                      <path d="M3 10 Q160 -5 375 7" />
                    </svg>
                  </span>
                  ？
                </h1>
                <p>
                  用 100 枚人生币，换一个不太普通的明天。
                  <br />
                  选好能力，走进《明天暂停营业》的分支故事。
                </p>
                <div className="hero-note">
                  <span>↳</span> 五幕冒险 · 八种结局 ·
                  你答应过的事，有人会记得。
                </div>
                {run && (
                  <button
                    className="resume-button"
                    onClick={() => go("adventure")}
                  >
                    ↗{" "}
                    {scenes[run.node].ending
                      ? "查看上一次人生档案"
                      : `继续冒险 · ${scenes[run.node].title}`}
                  </button>
                )}
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <span className="star star-a">✦</span>
                <span className="star star-b">✧</span>
                <div className="coin">
                  <span>人生通货</span>
                  <b>100</b>
                  <span>LIFE COINS</span>
                </div>
                <span className="art-label">预算有限，脑洞无限。</span>
                <span className="star star-c">✳</span>
              </div>
            </section>
            <div className="shop-layout">
              <section className="shelves">
                <div className="section-title">
                  <h2>
                    {view === "confirm"
                      ? "最后确认一下这场人生"
                      : "今晚，想要哪种奇遇？"}
                  </h2>
                  <span>
                    {view === "confirm"
                      ? "CHECK YOUR NEXT LIFE"
                      : "18 件奇遇 · 每件限购一次"}
                  </span>
                </div>
                {view === "confirm" ? (
                  <div className="confirm-box">
                    <span className="big-symbol">✧</span>
                    <h2>准备推开另一扇门了吗？</h2>
                    <p>
                      选中 {ids.length} 件奇遇，花费 {total(ids)} 枚人生币。
                      <br />
                      能力和副作用会一起送达，剧情里将由你决定如何使用。
                    </p>
                    <button
                      className="primary"
                      data-action="finish"
                      onClick={() => go("receipt")}
                    >
                      确认，打印入场券 →
                    </button>
                    <button className="text-button" onClick={() => go("shop")}>
                      再想想，返回货架
                    </button>
                  </div>
                ) : (
                  <>
                    <nav className="filters" aria-label="商品分类">
                      {["全部奇遇", "奇妙日常", "时空漏洞", "脑内宇宙"].map(
                        (c, i) => (
                          <button
                            key={c}
                            data-category={c}
                            aria-pressed={category === c}
                            className={category === c ? "active" : ""}
                            onClick={() => setCategory(c)}
                          >
                            {["✳", "☀", "⌛", "☾"][i]} {c}
                          </button>
                        ),
                      )}
                    </nav>
                    <div className="products">
                      {products
                        .filter(
                          (p) =>
                            category === "全部奇遇" || p.category === category,
                        )
                        .map((p) => (
                          <article
                            key={p.id}
                            className={`product ${ids.includes(p.id) ? "selected" : ""}`}
                          >
                            <div className="product-top">
                              <span className="tag">{p.tag}</span>
                              <span className="product-number">
                                NO.{" "}
                                {String(products.indexOf(p) + 1).padStart(
                                  2,
                                  "0",
                                )}
                              </span>
                            </div>
                            <div
                              className={`product-art art-${p.category === "奇妙日常" ? "daily" : p.category === "时空漏洞" ? "time" : "mind"}`}
                            >
                              <span>{p.icon}</span>
                              <i>✦</i>
                            </div>
                            <div className="product-heading">
                              <h3>{p.name}</h3>
                              <span>
                                <b>{p.price}</b> 币
                              </span>
                            </div>
                            <p className="power">{p.power}</p>
                            <div className="side">
                              <span>⚡ 附赠副作用</span>
                              <p>{p.side}</p>
                            </div>
                            <button
                              className={`add ${ids.includes(p.id) ? "added" : ""}`}
                              data-product={p.id}
                              aria-pressed={ids.includes(p.id)}
                              onClick={() => changeProduct(p.id)}
                            >
                              {ids.includes(p.id)
                                ? "✓ 已装入人生 · 点击放回"
                                : "+ 装进我的人生"}
                            </button>
                          </article>
                        ))}
                    </div>
                    <p className="shelf-end">
                      ✦ 选好能力后结账，故事才刚刚开始。 ✦
                    </p>
                  </>
                )}
              </section>
              <aside className={`basket ${basketOpen ? "expanded" : ""}`}>
                <button
                  className="basket-mobile"
                  onClick={() => setBasketOpen(!basketOpen)}
                  aria-expanded={basketOpen}
                >
                  🧺 我的人生篮子 · {ids.length}/5{" "}
                  <b>
                    剩余 {100 - total(ids)} 币 {basketOpen ? "⌄" : "⌃"}
                  </b>
                </button>
                <div className="basket-content">
                  <div className="basket-title">
                    <h2>🧺 我的人生篮子</h2>
                    <span>{ids.length} / 5</span>
                  </div>
                  <div className="balance">
                    <span>可支配人生币</span>
                    <strong>
                      {100 - total(ids)}
                      <small> / 100</small>
                    </strong>
                    <div className="balance-track">
                      <i style={{ width: `${100 - total(ids)}%` }} />
                    </div>
                    <span className="balance-note">
                      给未知留点预算，也不错。
                    </span>
                  </div>
                  <div className="basket-items">
                    {selected.length ? (
                      selected.map((p) => (
                        <div key={p.id} className="basket-row">
                          <span>{p.icon}</span>
                          <div>
                            <strong>{p.name}</strong>
                            <small>{p.price} 枚人生币</small>
                          </div>
                          <button
                            data-product={p.id}
                            onClick={() => changeProduct(p.id)}
                            aria-label={`移除${p.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty">
                        <span>⋆</span>
                        <p>篮子还是空的</p>
                        <small>把心动的「如果」装进来吧。</small>
                      </div>
                    )}
                  </div>
                  <div className="basket-bottom">
                    <div className="subtotal">
                      <span>本次人生支出</span>
                      <strong>{total(ids)} 币</strong>
                    </div>
                    <button
                      className="primary checkout"
                      onClick={() =>
                        go(view === "confirm" ? "receipt" : "confirm")
                      }
                      disabled={!ids.length}
                    >
                      {view === "confirm" ? "打印人生入场券" : "就选这场人生"}{" "}
                      <span>↗</span>
                    </button>
                    <button
                      className="text-button reset"
                      disabled={!ids.length}
                      onClick={() => {
                        if (confirm("把所有奇遇放回货架，重新选一次？")) {
                          setIds([]);
                          write(
                            "parallel-life",
                            JSON.stringify({ version: 1, ids: [] }),
                          );
                        }
                      }}
                    >
                      清空，重新想象
                    </button>
                  </div>
                  <div className="shopkeeper">
                    <span>✳ 店主悄悄说</span>
                    <p>
                      「能力只是开场，
                      <br />
                      你如何使用它，才是故事。」
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
        {fallback && (
          <div className="copy-sheet" role="region" aria-label="复制人生档案">
            <button className="copy-close" onClick={() => setFallback("")}>
              关闭复制文本 ×
            </button>
            <textarea
              id="copy-fallback"
              aria-label="手动复制人生档案"
              readOnly
              value={fallback}
              onFocus={(e) => e.target.select()}
              autoFocus
            />
          </div>
        )}
      </main>
      <footer hidden={view === "adventure"}>
        <span>一家贩卖「如果」的小店。</span>
        <span>无需付款 · 无需登录 · 故事与存档都在本地</span>
        <span>© 平行人生小卖部</span>
      </footer>
      <div
        id="notice"
        role="status"
        aria-live="polite"
        className={notice ? "visible" : ""}
      >
        {notice}
      </div>
    </>
  );
}
createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
