"use client";

import { Cursor, useTypewriter } from "react-simple-typewriter";

export default function HeroTypewriter({
  words = [],
  cursorColor = "#0ea5e9",
  cursorStyle = "_",
}) {
  const [text] = useTypewriter({
    words,
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <>
      {text}
      <Cursor cursorColor={cursorColor} cursorStyle={cursorStyle} />
    </>
  );
}
