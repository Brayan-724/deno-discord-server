import { customElement, html, LitElement, property, when } from "./lit.ts";
import { DiscordTimestamp, handleTimestamp } from "./util.ts";
import { Profile, profiles } from "./options.ts";

import ddsMessageCss from "./dds-message.css.ts";

@customElement("dds-message")
class DDSMessage extends LitElement {
  static styles = ddsMessageCss;

  /**
   * The id of the profile data to use.
   */
  @property({})
  profile!: string;

  /**
   * The message author's username.
   */
  @property({})
  author: string = "User";

  /**
   * The message author's avatar. Can be an avatar shortcut, relative path, or external link.
   */
  @property({})
  avatar: string =
    "https://cdn.discordapp.com/avatars/809848854106341429/1fa599f86ca81117c97e5dacd7b0d1a0.png?size=32";

  /**
   * Whether the message author is a bot or not.
   */
  @property({ type: Boolean })
  bot: boolean = false;

  /**
   * Whether the message has been edited or not.
   */
  @property({})
  edited: boolean = false;

  /**
   * The message author's primary role color. Can be any [CSS color value](https://www.w3schools.com/cssref/css_colors_legal.asp).
   */
  @property({})
  roleColor: string = "";

  /**
   * The timestamp to use for the message date. When supplying a string, the format must be `01/31/2000`.
   */
  @property({ mutable: true, reflect: true, type: String })
  timestamp: DiscordTimestamp = new Date();

  render() {
    // const resolveAvatar = (avatar: string): string => avatars[avatar] ?? avatar ?? avatars.default

    const defaultData: Profile = {
      author: this.author,
      bot: this.bot,
      roleColor: this.roleColor,
    };
    const profileData: Profile = profiles[this.profile] ?? {};
    const profile: Profile = Object.assign(defaultData, profileData, {
      avatar: this.avatar,
    });

    // const highlightMention: boolean = Array.from(this.el.children).some((child): boolean => {
    // 	return child.tagName.toLowerCase() === 'discord-mention' && child.highlight && child.type !== 'channel'
    // })

    return html`
      <style> ${DDSMessage.styles} </style>
      <div class="discord-author-avatar">
        <img src=${profile.avatar} alt=${profile.author} />
      </div>
      <div class="discord-message-content">
        <div>
          <author-info author=${profile.author} bot=${profile.bot} />
          <span class="discord-message-timestamp">${
      handleTimestamp(this.timestamp)
    }</span>
        </div>

        <div class="discord-message-body">
          <pre>
            <slot></slot>
          </pre>
          ${
      when(
        this.edited,
        html`<span class="discord-message-edited">(edited)</span>`,
        undefined,
      )
    }
        </div>
        <slot name="embeds"></slot>
      </div>
    `;
  }
}
