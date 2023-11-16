import { extract, install } from "twind";
import presetTailwind from "esm.sh/@twind/preset-tailwind@1.1.4";
import { Next } from "hono/mod.ts";
import { StatusCode } from "hono/utils/http-status.ts";

install({
  presets: [
    presetTailwind(),
    {
      theme: {
        animation: {
          "server-hover-out": "server-hover-out 0.6s ease",
          "server-hover-in": "server-hover-in 0.8s ease forwards",
        },
        keyframes: {
          "server-hover-in": {
            "0%": {
              borderRadius: "25px",
              backgroundColor: "server-bg",
            },

            "40%": {
              borderRadius: "12px",
            },

            "70%": {
              borderRadius: "16.7px",
            },

            "80%": {
              backgroundColor: "server-bg-active",
            },

            "100%": {
              borderRadius: "15px",
              backgroundColor: "server-bg-active",
            },
          },
          "server-hover-out": {
            "0%": {
              "border-radius": "15px",
              backgroundColor: "server-bg-active",
            },

            "45%": {
              borderRadius: "25px",
              backgroundColor: "server-bg",
            },

            "65%": {
              borderRadius: "25px",
            },

            "75%": {
              borderRadius: "23.5px",
            },

            "100%": {
              borderRadius: "25px",
            },
          },
        },
        fontSize: {
          xs: "0.7rem",
          sm: "0.8rem",
          base: "1rem",
          xl: "1.25rem",
          "2xl": "1.563rem",
          "3xl": "1.953rem",
          "4xl": "2.441rem",
          "5xl": "3.052rem",
        },
        fontFamily: {
          sans: ["Helvetica", "sans-serif"],
          serif: ["Times", "serif"],
        },
        colors: {
          "white": "#FFF",
          "black": "#000",
          "body-bg": "#121416",
          "body-color": "#FFF",
          "servers-bg": "#1E2124",
          "channels-bg": "#2E3136",
          "border-accent": "#272a2e",
          "chat-bg": "#36393E",
          "menu-bg": "#36393E",
          "server-bg": "#2E3136",
          "server-bg-active": "#7289DA",
          "server-marker-unread": "#8A8E94",
          "server-marker-active": "#FFF",
          "button-bg": "#2E3136",
          "button-bg-active": "lighten(#2E3136, 5%)",
        },
      },
    },
  ],

  rules: [
    ["text-inherit", { color: "inherit" }],
    ["font-inherit", { font: "inherit" }],
    [
      "channels-list",
      ` 
flex-1 overflow-y-auto px-4
[& ul]:[list-style: none]
[& .channels-list-header]:(
  cursor-pointer mt-4 text-body-color/30 text-sm relative
  [text-transform: uppercase] [letter-spacing: 0.04rem] [transition: color 0.2s linear] [line-height: 30px]
  [&:hover, &:focus]:(text-body-color after:opacity-100)
  after:( 
    absolute top-[10px] right-0 [content: ' '] w-[10px] h-[10px] opacity-30 [transition: opacity 0.2s linear]
    bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTguOTksMy45OUg2LjAxVjEuMDFDNi4wMSwwLjQ1Miw1LjU1OCwwLDUsMFMzLjk5LDAuNDUyLDMuOTksMS4wMVYzLjk5SDEuMDFDMC40NTIsMy45OSwwLDQuNDQyLDAsNWMwLDAuNTU4LDAuNDUyLDEuMDEsMS4wMSwxLjAxSDMuOTlWOC45OUMzLjk5LDkuNTQ4LDQuNDQyLDEwLDUsMTBzMS4wMS0wLjQ1MiwxLjAxLTEuMDFWNi4wMUg4Ljk5QzkuNTQ4LDYuMDEsMTAsNS41NTgsMTAsNUMxMCw0LjQ0Miw5LjU0OCwzLjk5LDguOTksMy45OXoiLz48L3N2Zz4=)]
    bg-[no-repeat 50%]
  )
)
`,
    ],
    [
      "dds-button",
      `
bg-button-bg border-0 text-inherit cursor-pointer font-inherit leading-normal overflow-visible appearance-none select-none
[& > svg, & > img]:(max-w-full max-h-full)
`,
    ],
  ],
});

type HeaderRecord = Record<string, string | string[]>;

export async function twind(c: DDSHonoContext, next: Next) {
  const org = c.html;
  c.html = (
    content: string,
    arg?: StatusCode | ResponseInit,
    headers?: HeaderRecord,
  ) => {
    const { html, css } = extract(content);
    return org(
      html.replace("</head>", `<style data-twind>${css}</style></head>`),
      arg as StatusCode,
      headers,
    );
  };

  return await next();
}
