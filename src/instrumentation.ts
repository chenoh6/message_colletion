export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 启动时检查 localStorage 配置（通过文件标记）
    const fs = await import("fs/promises");
    const path = await import("path");
    const marker = path.join(process.cwd(), "data", ".auto-fetch");
    try {
      const val = await fs.readFile(marker, "utf-8");
      if (val.trim() === "true") {
        const { startScheduler } = await import("./lib/scheduler");
        await startScheduler();
      }
    } catch {
      // 没有标记文件，不启动
    }
  }
}
