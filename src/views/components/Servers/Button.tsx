import { cx } from "twind";

export interface Props {
  active?: boolean;
  unread?: boolean;
  ["aria-label"]: string;
  children: JSX.Element;
}

/*
&.server-friends {
  margin-bottom: 46px;
  text-align: center;

  &.active::before {
    display: none;
  }

  &::after {
    content: "2 ONLINE";
    color: rgba($body-color, 0.3);
    pointer-events: none;
    font-weight: 300;
    font-size: 0.65rem;
    position: absolute;
    bottom: -35px;
    left: 3px;
    padding-bottom: 10px;
    border-bottom: 2px solid lighten($servers-bg, 5%);
  }
}

 */

export default function ServerButton(props: Props) {
  const classname = cx(
    "server focusable",
    "w-[50px] h-[50px] mb-2 rounded-full bg-server-bg bg-no-repeat cursor-pointer relative",
    "before:(absolute -left-4 block w-2.5 rounded-full)",
    props.unread && "unread before:bg-server-marker-unread",
    props.active && [
      "active rounded-4 bg-server-bg-active",
      "before:(bg-server-marker-active h-10 top-1)",
      "before:hidden",
    ],
    !props.active && [
      "animate-server-hover-out hover:animate-server-hover-in focus:animate-server-hover-in",
      "before:(top-5 h-2.5)",
    ],
    props.active && props.unread &&
      "before:(transition-all duration-200 ease-in-out)",
  );
  return (
    <div
      class={classname}
      role="button"
      aria-label={cx(props["aria-label"], props.unread && "unread")}
    >
      <div class="rounded-[inherit] w-full h-full flex items-center justify-center [& img]:(rounded-[inherit] max-w-full) [& svg]:(max-w-[60%] max-h-[60%])">
        {props.children}
      </div>
    </div>
  );
}
