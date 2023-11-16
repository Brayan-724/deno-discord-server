import { css } from "./lit.ts";

export default css`
:host {
	display: inline-flex;
	align-items: center;
	font-size: 15px;
}

:host .discord-author-username {
	color: #fff;
	font-size: 1.1em;
	font-weight: 500;
	letter-spacing: 0.5px;
}

.discord-light-theme :host .discord-author-username {
	color: #23262a;
}

:host .discord-bot-tag {
	background-color: #7289da;
	font-size: 0.65em;
	margin-left: 5px;
	padding: 3px;
	border-radius: 3px;
	line-height: 100%;
	text-transform: uppercase;
}

.discord-light-theme :host .discord-bot-tag {
	color: #fff;
}

.discord-compact-mode :host .discord-author-username {
	margin-left: 4px;
	margin-right: 4px;
}

.discord-compact-mode :host .discord-bot-tag {
	margin-left: 0;
	margin-right: 5px;
	padding-left: 3px;
	padding-right: 3px;
	font-size: 0.6em;
}
`;
