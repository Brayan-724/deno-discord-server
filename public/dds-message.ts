import {
  customElement,
  html,
  LitElement,
  property,
  state,
  Task,
  when,
} from "./lit.ts";
import { DiscordTimestamp, handleTimestamp } from "./util.ts";
import { get_profile, getRandomAvatar, Profile } from "./options.ts";

import ddsMessageCss from "./dds-message.css.ts";

@customElement("dds-message")
class DDSMessage extends LitElement {
  static styles = ddsMessageCss;

  @property({})
  author: string = "User";

  @property({ type: Boolean })
  bot: boolean = false;

  @property({})
  edited: boolean = false;

  @property({})
  roleColor: string = "";

  @property({ mutable: true, reflect: true, type: String })
  timestamp: DiscordTimestamp = new Date();

  @state()
  profile: Profile = {
    "name": "Anonymous",
    "avatar": getRandomAvatar(),
    "role": "guest",
  } as Profile;

  @state()
  is_loading = true;

  _profile = new Task(this, {
    task: async ([authorId]) => {
      const profile = await get_profile(authorId);
      return profile;
    },
    args: () => [this.author],
  });

  render() {
    const profile = this._profile.value ?? this.profile;

    // const highlightMention: boolean = Array.from(this.el.children).some((child): boolean => {
    // 	return child.tagName.toLowerCase() === 'discord-mention' && child.highlight && child.type !== 'channel'
    // })

    return html`
      <style> ${DDSMessage.styles} </style>
      <div class="discord-author-avatar">
        <img src=${profile.avatar} alt=${profile.name} />
      </div>
      <div class="discord-message-content">
        <div>
          ${
      this._profile.render({
        pending: () =>
          html`
          <author-info author=${"Anonymous"} bot=${"true"} />
          <span class="discord-message-timestamp">Loading</span>
          `,
        complete: (profile: Profile) =>
          html`
          <author-info author=${profile.name} bot=${this.bot} />
          <span class="discord-message-timestamp">
            ${handleTimestamp(this.timestamp)}
          </span>
          `,
        error: () =>
          html`
          <author-info author=${"Anonymous"} bot=${"true"} />
          <span class="discord-message-timestamp">Error Loading</span>
          `,
      })
    }
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
