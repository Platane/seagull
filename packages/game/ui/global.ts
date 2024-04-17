import { css } from "@linaria/core";

export const globalClassName = css`
::global(){

  *,
  *:before,
  *:after {
      box-sizing: border-box;
  }

  html {
    margin:0;
    font-family: Helvetica,Arial,sans-serif;
  }

  body {
    margin: 0;
    min-height: 100vh;
  }

  #a{
      position: fixed;
      width: 100vw;
      height: 100vh;
  }
}
`;
