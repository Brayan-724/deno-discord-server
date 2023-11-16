import {
  html,
  LitElement,
  nothing,
} from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
import {
  customElement,
  property,
} from "https://cdn.jsdelivr.net/npm/lit@3/decorators.js/+esm";
import { styleMap } from "https://cdn.jsdelivr.net/npm/lit@3/directives/style-map.js/+esm";
import authorInfoCss from "./author-info.css.ts";

@customElement("author-info")
class AuthorInfo extends LitElement {
  @property({ converter: (v) => v === "true" })
  bot!: boolean;

  @property({})
  author!: string;

  @property({})
  roleColor!: string;

  protected render() {
    return html`
      <style> ${authorInfoCss} </style>
      <span class="discord-author-username" style=${
      styleMap({ color: this.roleColor })
    }>${this.author}</span>
      ${this.bot && html`<span class="discord-bot-tag">Bot</span>` || nothing}
      <slot />
    `;
  }
}
