import { Component, type ReactNode } from "react";
export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="world world-fallback">
        <div className="fallback-city" aria-hidden="true">
          ▥ ▥ <span>✳</span> ▥ ▥
        </div>
        <div className="world-overlay">
          宇宙暂时以静态方式营业
          <small>画面加载失败不影响剧情，继续作出你的选择。</small>
        </div>
      </div>
    ) : (
      this.props.children
    );
  }
}
