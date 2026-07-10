"use client";

import Tilt from "react-parallax-tilt";

export default function DesktopTilt({ children, ...props }) {
  return <Tilt {...props}>{children}</Tilt>;
}
