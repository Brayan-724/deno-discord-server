export default function Message() {
  const parent: HTMLDiscordMessagesElement = this.el
    .parentElement as HTMLDiscordMessagesElement;

  if (parent.tagName.toLowerCase() !== "discord-messages") {
    throw new Error(
      "All <discord-message> components must be direct children of <discord-messages>.",
    );
  }

  const resolveAvatar = (avatar: string): string =>
    avatars[avatar] ?? avatar ?? avatars.default;

  const defaultData: Profile = {
    author: this.author,
    bot: this.bot,
    roleColor: this.roleColor,
  };
  const profileData: Profile = profiles[this.profile] ?? {};
  const profile: Profile = Object.assign(defaultData, profileData, {
    avatar: resolveAvatar(this.avatar ?? profileData.avatar),
  });

  const highlightMention: boolean = Array.from(this.el.children).some(
    (child: HTMLDiscordMentionElement): boolean => {
      return child.tagName.toLowerCase() === "discord-mention" &&
        child.highlight && child.type !== "channel";
    },
  );

  return (
    <div>
      <div class="discord-author-avatar">
        <img src={profile.avatar} alt={profile.author} />
      </div>
      <div class="discord-message-content">
        {!parent.compactMode
          ? (
            <div>
              <AuthorInfo
                author={profile.author}
                bot={profile.bot}
                roleColor={profile.roleColor}
              />
              <span class="discord-message-timestamp">{this.timestamp}</span>
            </div>
          )
          : ""}
        <div class="discord-message-body">
          {parent.compactMode
            ? (
              <span>
                <span class="discord-message-timestamp">{this.timestamp}</span>
                <AuthorInfo
                  author={profile.author}
                  bot={profile.bot}
                  roleColor={profile.roleColor}
                />
              </span>
            )
            : ""}
          <slot></slot>
          {this.edited
            ? <span class="discord-message-edited">(edited)</span>
            : ""}
        </div>
        <slot name="embeds"></slot>
      </div>
    </div>
  );
}
