import { Context } from "hono/mod.ts";
import { LitElement } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

declare global {
  type Env = {
    Bindings: undefined;
    Variables: {
      sessionId: string | undefined;
    };
  };

  // deno-lint-ignore no-empty-interface
  interface DDSHonoContext extends Context<Env> {
  }

  interface HTMLDDSMessage extends LitElement {
    "timestamp": string | Date;
    "author": string;
  }
  var HTMLDDSMessage: {
    prototype: HTMLDDSMessage;
    new (): HTMLDDSMessage;
  };

  interface HTMLElementTagNameMap {
    "dds-message": HTMLDDSMessage;
  }
}
