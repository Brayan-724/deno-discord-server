import { customElement, html, LitElement, property, styleMap } from "./lit.ts";
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
