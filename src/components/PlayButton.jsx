import { useState } from "react";
import PlayIcon from "./PlayIcon";
import PauseIcon from "./PauseIcon";

export default function PlayButton({ isPlaying, togglePlay }) {
  let Icon = isPlaying ? PauseIcon : PlayIcon;

  return (
    <button
      type="button"
      className="h-10 w-10 flex items-center justify-center rounded-full text-violet-100 bg-violet-700 shadow-md"
      onClick={togglePlay}>
      <Icon className="h-5 w-5 fill-current" />
    </button>
  );
}
