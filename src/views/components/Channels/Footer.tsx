import ChannelsFooterButton from "./Footer/Button.tsx";

export interface Props {
  username: string;
}

export default function ChannelsFooter(props: Props) {
  return (
    <footer class="flex items-center flex-[0 0 70px] mt-auto bg-black/[.07] px-[10px] border-t-([1px] border-accent)">
      <img
        class="avatar w-[30px] h-[30px] rounded-full"
        alt="Avatar"
        src="https://cdn.discordapp.com/avatars/809848854106341429/1fa599f86ca81117c97e5dacd7b0d1a0.png?size=48"
      />
      <div class="ml-[10px]">
        <span class="username block font-light text-sm">{props.username}</span>
        <span class="tag block font-light text-xs text-body-color/45">
          online
        </span>
      </div>
      <div class="button-group ml-auto rounded-sm flex [& .button]:(w-[32px] h-[32px] [& svg]:w-4 [&:hover svg, &:focus svg]:[filter: brightness(200%)]) ">
        <ChannelsFooterButton aria-label="Mute">
          <svg>
            <use xlink:href="#icon-mute" />
          </svg>
        </ChannelsFooterButton>

        <ChannelsFooterButton aria-label="Deafen">
          <svg>
            <use xlink:href="#icon-deafen" />
          </svg>
        </ChannelsFooterButton>

        <ChannelsFooterButton aria-label="Settings">
          <svg>
            <use xlink:href="#icon-settings" />
          </svg>
        </ChannelsFooterButton>
      </div>
    </footer>
  );
}
