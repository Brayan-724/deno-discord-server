import { cx } from "twind";

export interface Props {
  type: "text" | "voice";
  isActive?: boolean;
  name: string;
}

export default function ChannelsChannel(props: Props) {
  return (
    <li
      class={cx(
        "channel focusable",
        "channel-" + props.type,
        props.type === "text" && [
          "relative",
          `[&.active,&:hover,&:focus]:(bg-[linear-gradient(to right, #282b30 85%, #2e3136)] 
             before:([content: ' '] w-[2px] h-full absolute left-0 bg-[#7289da])
           )`,
          !props.isActive && "[&:focus,&:hover]:before:opacity-25 ",
        ],
        props.type === "voice" && [
          "relative",
          `[&.active,&:hover,&:focus]:(bg-[linear-gradient(to right, #282b30 85%, #2e3136)])`,
          !props.isActive && "[&:focus,&:hover]:before:opacity-25 ",
        ],
        props.isActive && "active",
        "cursor-pointer flex items-center p-[8px 20px 10px 20px] opacity-30 w-full",
        "[&.active,&:hover,&:focus]:(opacity-100 [& .button]:block)",
      )}
    >
      <span
        class={cx("channel-name text-sm font-light", {
          "before:(content-['#'] mr-[2px] font-normal text-[#8a8e94])":
            props.type === "text",
        })}
      >
        {props.name}
      </span>
      <button
        class="button dds-button hidden opacity-20 hover:opacity-100 focus:opacity-100 w-4 h-4 ml-auto mr-[8px]"
        role="button"
        aria-label="Invite"
      >
        <svg>
          <use xlink:href="#icon-invite" />
        </svg>
      </button>
      <button
        class="button dds-button hidden opacity-20 hover:opacity-100 focus:opacity-100 w-4 h-4"
        role="button"
        aria-label="settings"
      >
        <svg>
          <use xlink:href="#icon-channel-settings" />
        </svg>
      </button>
    </li>
  );
}
