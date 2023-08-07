import { useEffect, useRef, useState } from "react";
import PlayButton from "./components/PlayButton";

let animationController;
let timeController;

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const progressBar = useRef();
  const canvasRef = useRef();
  const audioRef = useRef();
  const source = useRef();
  const analyser = useRef();

  const calculateTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);

    return `${minutes}:${('00' + seconds).slice(-2)}`;
  }

  const handleFileChange = (event) => {
    audioRef.current.src = window.URL.createObjectURL(event.target.files[0]);
    audioRef.current.load();
    audioRef.current.pause();
    setIsPlaying(false);

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(curr => !curr);
      cancelAnimationFrame(animationController);
    });
  }

  const whilePlaying = () => {
    const time = Math.floor(audioRef.current.currentTime);
    progressBar.current.value = time; //audioRef.current.currentTime;
    setCurrentTime(time); //audioRef.current.currentTime);
    timeController = requestAnimationFrame(whilePlaying);
  };

  const changeRange = (event) => {
    audioRef.current.currentTime = event.target.value;
    setCurrentTime(event.target.value);
  };

  const handlePlayAudio = () => {
    let audioContext = new AudioContext();

    if (!source.current) {
      source.current = audioContext.createMediaElementSource(audioRef.current);
      analyser.current = audioContext.createAnalyser();
      source.current.connect(analyser.current);
      analyser.current.connect(audioContext.destination);
      analyser.current.fftSize = 64;
    }

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // if (audioRef.current.paused) {
    //   setIsPlaying(false);
    //   return cancelAnimationFrame(animationController);
    // }

    const ctx = canvasRef.current.getContext("2d");
    const barWidth = canvasRef.current.width / bufferLength;
    let barHeight;
    let x;

    let gradient = ctx.createLinearGradient(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    gradient.addColorStop(0, "#0284c7");
    gradient.addColorStop(0.5, "#7c3aed");
    gradient.addColorStop(1.0, "#db2777");

    function animate() {
      x = 1;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      analyser.current.getByteFrequencyData(dataArray);

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 256 * canvasRef.current.height;
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvasRef.current.height, barWidth, -barHeight);
        x += (barWidth + 1);
      }

      animationController = requestAnimationFrame(animate);
    }

    animate();
  };

  const togglePlay = () => {
    // if (audioContext.current.state === 'suspended') {
    //   audioContext.current.resume();
    // }

    setIsPlaying(curr => !curr);

    if (!isPlaying) {
      audioRef.current.play();
      handlePlayAudio();
      timeController = requestAnimationFrame(whilePlaying);
    } else {
      audioRef.current.pause();
      cancelAnimationFrame(animationController);
      cancelAnimationFrame(timeController);
    }
  }

  return (
    <div className="container mx-auto">
      <div className="p-4 flex flex-col items-center space-y-4">
        <input type="file" onChange={handleFileChange} accept="audio/*" />
        <audio
          ref={audioRef}
          // controls
          // onPlay={}
          // onPause={() => {}}
          onDurationChange={(event) => {
            const seconds = Math.floor(event.target.duration);
            setDuration(seconds);
            progressBar.current.max = seconds;
          }}
        />
        <canvas ref={canvasRef} width={320} height={50} className="border border-neutral-300 rounded-md  shadow-md box-content" />
        <div className="w-80 flex items-center justify-between space-x-1">
          <div className="font-mono text-xs">{calculateTime(currentTime)}</div>
          <div className="relative w-full flex-1 flex items-center">
            <input
              ref={progressBar}
              type="range"
              defaultValue={0}
              onChange={changeRange}
              className="w-full appearance-none bg-transparent accent-red-500 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-neutral-500/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-700"
            />
            <div
              className="absolute h-2 rounded-l-full bg-violet-300"
              style={{width: `calc((100% - 0.5rem) * ${currentTime / duration})`}}
            />
          </div>
          <div className="font-mono text-xs">{calculateTime(duration)}</div>
        </div>
        <PlayButton isPlaying={isPlaying} togglePlay={togglePlay} />
      </div>
    </div>
  );
}