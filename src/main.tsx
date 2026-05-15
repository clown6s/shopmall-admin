// src/main.tsx
import { Component, type ReactNode, type ErrorInfo } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";

const rootEl = document.getElementById("root");

// ── React ErrorBoundary ──
interface EBState { hasError: boolean; error: Error | null; errorInfo: string }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
    state: EBState = { hasError: false, error: null, errorInfo: "" };
    static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
        this.setState({ errorInfo: info.componentStack ?? "" });
    }
    render() {
        if (this.state.hasError && this.state.error) {
            const e = this.state.error;
            if (import.meta.env.DEV) {
                return (
                    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#1a1a2e", color: "#e0e0e0", padding: 32, fontFamily: "Consolas,monospace", fontSize: 14, whiteSpace: "pre-wrap", overflow: "auto" }}>
                        <h2 style={{ color: "#ff6b6b" }}>React Render Error</h2>
                        <p style={{ color: "#74b9ff" }}><b>{e.message}</b></p>
                        <pre style={{ color: "#b2bec3", background: "#2d2d44", padding: 16, borderRadius: 8, maxHeight: "40vh", overflow: "auto" }}>{e.stack}</pre>
                        {this.state.errorInfo && <pre style={{ color: "#b2bec3", background: "#2d2d44", padding: 16, borderRadius: 8, marginTop: 12, maxHeight: "30vh", overflow: "auto" }}>{this.state.errorInfo}</pre>}
                    </div>
                );
            }
            return (
                <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#1a1a2e", color: "#e0e0e0", padding: 32, fontFamily: "Consolas,monospace", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ color: "#ff6b6b" }}>系统错误</h2>
                        <p style={{ color: "#74b9ff" }}>页面渲染异常，请刷新页面或联系管理员</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── 全局 JS 错误 ──
window.onerror = function (msg, src, line, col, err) {
    console.error("[ONERROR]", msg, src, line, col, err);
};
window.addEventListener("unhandledrejection", function (e) {
    console.error("[UNHANDLED REJECTION]", e.reason);
});

// HTML 转义，防止 innerHTML 注入
function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// ── 挂载 ──
try {
    const root = ReactDOM.createRoot(rootEl!);
    root.render(
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
} catch (err) {
    if (rootEl) {
        const msg = escapeHtml(String(err));
        const stack = err instanceof Error ? escapeHtml(err.stack ?? "") : "";
        rootEl.innerHTML = `<div style="padding:40px;color:#ff6b6b;font-family:monospace;font-size:14px;background:#1a1a2e;min-height:100vh"><h2>FATAL</h2><p>${msg}</p>${import.meta.env.DEV ? `<pre>${stack}</pre>` : ""}</div>`;
    }
}
