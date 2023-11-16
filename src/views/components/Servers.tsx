import ServerButton from "./Servers/Button.tsx";
import ServersOnlineFeed from "./Servers/OnlineFeed.tsx";

export default function Servers() {
  return (
    <aside class="servers h-full flex flex-col flex-[0 0 70px] items-center overflow-y-auto py-3 bg-servers-bg">
      <div class="servers-collection">
        <ServerButton aria-label="Friends" unread>
          <svg>
            <use xlink:href="#icon-friends" />
          </svg>
        </ServerButton>

        <ServersOnlineFeed />
      </div>

      <div class="servers-collection">
        <ServerButton aria-label="Discord Developers" unread>
          <img src="https://cdn.discordapp.com/icons/41771983423143937/edc44e98a690a1f76c5ddec68a0a6b9e.png" />
        </ServerButton>
        <ServerButton aria-label="My Server" active>
          <img src="https://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png" />
        </ServerButton>
      </div>
    </aside>
  );
}
