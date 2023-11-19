export interface Props {
  "aria-label": string;
  children: JSX.Element;
}

export default function ChannelsFooterButton(props: Props) {
  return (
    <button
      role="button"
      aria-label={props["aria-label"]}
      class="button border-0 text-inherit cursor-pointer font-inherit leading-normal overflow-visible appearance-none select-none
      flex justify-center
[& > svg, & > img]:(max-w-full max-h-full)"
    >
      {props.children}
      <span class="tooltip">{props["aria-label"]}</span>
    </button>
  );
}
