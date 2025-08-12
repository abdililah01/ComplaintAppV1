// app-backend/src/trx/services/clamav.service.ts
import net from "net";

const HOST = process.env.CLAMAV_HOST || "127.0.0.1";
const PORT = Number(process.env.CLAMAV_PORT || 3310);
const TIMEOUT = Number(process.env.CLAMAV_TIMEOUT_MS || 30000); // 30s for Windows
const CHUNK = 64 * 1024; // 64KB

export type AvStatus = "CLEAN" | "FOUND" | "ERROR";
export interface AvResult {
  status: AvStatus;
  raw?: string;
  reason?: string;
  method?: "INSTREAM";
}

function writeChunk(sock: net.Socket, buf: Buffer) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(buf.length, 0);
  sock.write(len);
  if (buf.length) sock.write(buf);
}

export async function scanBufferDetailed(buffer: Buffer): Promise<AvResult> {
  return new Promise<AvResult>((resolve) => {
    const s = net.createConnection({ host: HOST, port: PORT });
    let raw = ""; let done = false;

    const finish = (r: AvResult) => {
      if (done) return; done = true;
      try { s.destroy(); } catch {}
      resolve({ ...r, method: "INSTREAM" });
    };

    s.setTimeout(TIMEOUT, () => finish({ status: "ERROR", reason: "TIMEOUT" }));
    s.once("error", (e: any) => finish({ status: "ERROR", reason: e?.code || String(e) }));

    s.on("data", (d) => {
      raw += d.toString();
      if (/FOUND/i.test(raw)) return finish({ status: "FOUND", raw });
      if (/OK/i.test(raw))    return finish({ status: "CLEAN", raw });
      if (/ERROR/i.test(raw)) return finish({ status: "ERROR", raw });
    });

    s.once("connect", () => {
      // Use the null-terminated form, which is the most compatible on Windows builds
      // (Some builds reject STREAM; null-terminated INSTREAM is widely accepted.)
      s.write("zINSTREAM\0");

      for (let i = 0; i < buffer.length; i += CHUNK) {
        writeChunk(s, buffer.subarray(i, i + CHUNK));
      }
      writeChunk(s, Buffer.alloc(0)); // zero-length chunk terminates the stream
      s.end();
    });

    s.once("close", () => { if (!done) finish({ status: "ERROR", raw, reason: "CLOSED" }); });
  });
}

export async function scanBuffer(buffer: Buffer): Promise<boolean> {
  const r = await scanBufferDetailed(buffer);
  return r.status === "CLEAN";
}

export async function pingClamd(timeoutMs = TIMEOUT): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const s = net.createConnection({ host: HOST, port: PORT });
    let buf = ""; let done = false;
    const finish = (ok: boolean) => { if (done) return; done = true; try { s.destroy(); } catch {} resolve(ok); };
    s.setTimeout(timeoutMs, () => finish(false));
    s.once("error", () => finish(false));
    s.on("data", d => { buf += d.toString(); if (/PONG/i.test(buf)) finish(true); });
    s.once("connect", () => { s.write("PING\n"); s.end(); });
    s.once("close", () => finish(/PONG/i.test(buf)));
  });
}
