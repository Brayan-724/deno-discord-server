import ChannelsChannel from "./Channels/Channel.tsx";
import ChannelsFooter from "./Channels/Footer.tsx";

export interface Props {
  username: string;
}

export default function Channels(props: Props) {
  return (
    <aside class="flex flex(col [0 0 240px]) bg-channels-bg">
      <header class="channels-header focusable cursor-pointer flex items-center flex-[0 0 56px] py-7 px-6 transition shadow-sm hover:bg-channels-bg focus:[& use]:([stroke-dasharray: 14] [transform: rotate(-90deg)])">
        <h3 role="header" class="text-base font-medium">My Server</h3>
        <svg
          role="button"
          aria-label="Dropdown"
          class="w-3 h-3 ml-auto pointer-events-none"
        >
          <use
            xlink:href="#icon-dropdown"
            class="[stroke-dasharray: 7] [transform-origin: 50%] [transition: stroke-dasharray 0.2s ease, transform 0.2s ease]"
          />
        </svg>
      </header>

      <section class="channels-list">
        <header class="channels-list-header focusable">
          <h5>Text Channels</h5>
        </header>

        <ul class="channels-list-text -mx-4">
          <ChannelsChannel name="General" type="text" isActive />
          <ChannelsChannel name="General 2" type="text" />
          <ChannelsChannel name="General 3" type="text" />
          <ChannelsChannel name="Help" type="text" />
        </ul>

        <header class="channels-list-header focusable">
          <h5>Voice Channels</h5>
        </header>

        <ul class="channels-list-text -mx-4">
          <ChannelsChannel name="General" type="voice" />
        </ul>
      </section>

      <ChannelsFooter username={props.username} />
    </aside>
  );
}
