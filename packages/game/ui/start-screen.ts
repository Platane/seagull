import { css } from "@linaria/core";

export const startButton = document.createElement("button");
startButton.className = css`
  padding:16px;
  margin: auto;
  min-width: 160px;
`;
startButton.textContent = "Start";
