import { css } from "./lit.ts";

export default css`
:host {
	color: #dcddde;
	display: flex;
	font-size: 0.9em;
	margin: 1em 0 !important;
	padding: 0.25rem 1rem !important;
}

:host:hover {
	background-color: #32353b;
}

.discord-light-theme :host {
	color: #2e3338;
}

.discord-light-theme :host:hover {
	background-color: #fafafa;
}

:host a {
	color: #0096cf;
	font-weight: normal;
	text-decoration: none;
}

:host a:hover {
	text-decoration: underline;
}

.discord-light-theme :host a {
	color: #00b0f4;
}

:host .discord-author-avatar {
	margin-top: 1px;
	margin-right: 16px;
	width: 40px;
  height: 40px;
}

:host .discord-author-avatar img {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}

:host .discord-message-timestamp {
	color: #72767d;
	font-size: 12px;
	margin-left: 3px;
}

.discord-light-theme :host .discord-message-timestamp {
	color: #747f8d;
}

:host .discord-message-edited {
	color: #72767d;
	font-size: 10px;
}

.discord-light-theme :host .discord-message-edited {
	color: #99aab5;
}

:host .discord-message-content {
	width: 100%;
	line-height: 160%;
	font-weight: normal;
	overflow-wrap: anywhere;
}

.discord-light-theme :host .discord-message-timestamp,
.discord-compact-mode :host:hover .discord-message-timestamp,
.discord-compact-mode.discord-light-theme :host:hover .discord-message-timestamp {
	color: #99aab5;
}

.discord-compact-mode.discord-light-theme :host .discord-message-timestamp {
	color: #d1d9de;
}

.discord-compact-mode :host {
	margin: 0.15em 0;
	padding-left: 0.25em;
	padding-right: 0.25em;
}

.discord-compact-mode .discord-author-avatar {
	display: none;
}
`;
