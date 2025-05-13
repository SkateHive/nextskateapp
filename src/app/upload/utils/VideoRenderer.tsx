import { Box, Button, HStack, IconButton } from "@chakra-ui/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  RefObject,
  Dispatch,
  SetStateAction,
} from "react";
import { FiMaximize, FiMinimize, FiVolume2, FiVolumeX } from "react-icons/fi";
import { LuPause, LuPlay, LuRotateCw } from "react-icons/lu";
import LoadingComponent from "../../mainFeed/components/loadingComponent";

// Add useInView hook for detecting visibility
interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

function useInView(options: IntersectionOptions = {}) {
  const [ref, setRef] = useState<Element | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { ref: setRef, isInView };
}

type RendererProps = {
  src?: string;
  loop?: boolean;
  [key: string]: any;
};

// Define interface for VideoControls props
interface VideoControlsProps {
  isPlaying: boolean;
  handlePlayPause: () => void;
  volume: number;
  setVolume: Dispatch<SetStateAction<number>>;
  showVolumeSlider: boolean;
  setShowVolumeSlider: Dispatch<SetStateAction<boolean>>;
  isFullscreen: boolean;
  handleFullscreenToggle: () => void;
  progress: number;
  handleProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleMouseLeave: () => void;
  hoverTime: number | null;
  videoDuration: number | undefined;
  progressSliderStyle: React.CSSProperties;
  volumeSliderStyle: React.CSSProperties;
  videoRef: RefObject<HTMLVideoElement>;
}

// Memoized LoadingComponent to prevent unnecessary re-renders
const MemoizedLoadingComponent = React.memo(LoadingComponent);

// Extract VideoControls to a separate component to prevent unnecessary re-renders
const VideoControls = React.memo(
  ({
    isPlaying,
    handlePlayPause,
    volume,
    setVolume,
    showVolumeSlider,
    setShowVolumeSlider,
    isFullscreen,
    handleFullscreenToggle,
    progress,
    handleProgressChange,
    handleMouseMove,
    handleMouseLeave,
    hoverTime,
    videoDuration,
    progressSliderStyle,
    volumeSliderStyle,
    videoRef,
  }: VideoControlsProps) => {
    // Check if video has ended (progress is at or very close to 100%)
    const isVideoEnded = progress >= 99.9;

    return (
      <Box
        position="absolute"
        bottom={4}
        left={0}
        right={0}
        px={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        zIndex={3}
      >
        <HStack gap={0}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            size="md"
            p={2}
            variant={"ghost"}
            color={"white"}
            _hover={{ bg: "transparent", color: "limegreen" }}
            zIndex={3}
          >
            {isVideoEnded ? (
              <LuRotateCw />
            ) : isPlaying ? (
              <LuPause />
            ) : (
              <LuPlay />
            )}
          </Button>
          <Box display="flex" alignItems="center" position="relative">
            <IconButton
              aria-label="Volume"
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumeSlider((prev: boolean) => !prev);
              }}
              p={2}
              variant={"ghost"}
              color={"white"}
              _hover={{ bg: "transparent", color: "limegreen" }}
              size="md"
              zIndex={3}
            >
              {volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
            </IconButton>
            {showVolumeSlider && (
              <Box
                position="absolute"
                bottom="100%"
                left="50%"
                transform="translate(-50%, -8px)"
                zIndex={4}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (videoRef.current) {
                      videoRef.current.volume = newVolume;
                      videoRef.current.muted = newVolume === 0;
                    }
                  }}
                  style={volumeSliderStyle}
                />
              </Box>
            )}
          </Box>
          <IconButton
            aria-label="Fullscreen"
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreenToggle();
            }}
            p={2}
            variant={"ghost"}
            color={"white"}
            _hover={{ bg: "transparent", color: "limegreen" }}
            size="md"
            zIndex={3}
          >
            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
          </IconButton>
        </HStack>

        <Box position="relative" flex="1" mx={4}>
          <input
            type="range"
            min="0"
            max="100"
            value={Number.isFinite(progress) ? progress : 0}
            onChange={handleProgressChange}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={progressSliderStyle}
          />

          <style jsx>{`
            input[type="range"]::-webkit-slider-runnable-track {
              -webkit-appearance: none;
              height: 8px;
              background: transparent;
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 24px;
              width: 24px;
              background: url("/skateboardloader.webp") no-repeat center;
              background-size: contain;
              border: none;
              border-radius: 0%;
              cursor: pointer;
              margin-top: -16px;
              box-shadow: none;
            }
          `}</style>

          {hoverTime !== null && videoDuration && (
            <Box
              position="absolute"
              top="-25px"
              left={`${(hoverTime / videoDuration) * 100}%`}
              transform="translateX(-50%)"
              bg="black"
              color="white"
              p={1}
              rounded="md"
              fontSize="xs"
            >
              {new Date(hoverTime * 1000).toISOString().substr(11, 8)}
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

// Memoize common styles outside the component
const VIDEO_STYLE = {
  background: "transparent",
  marginBottom: "20px",
  width: "100%",
  zIndex: 2,
};

const BASE_SLIDER_STYLE = {
  WebkitAppearance: "none" as React.CSSProperties["WebkitAppearance"],
  height: "8px",
  borderRadius: "4px",
  outline: "none",
  cursor: "pointer",
};

const VideoRenderer = ({ src, ...props }: RendererProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoop, setShouldLoop] = useState(false);

  // Use Intersection Observer to detect visibility
  const { ref: setVideoRef, isInView } = useInView({ threshold: 0.5 });

  const handleLoadedData = useCallback(() => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      setIsHorizontal(
        videoRef.current.videoWidth > videoRef.current.videoHeight
      );
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (progress >= 99.9) {
        // If video has ended, restart it
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        // Normal play/pause toggle
        isPlaying ? videoRef.current.pause() : videoRef.current.play();
        setIsPlaying(!isPlaying);
      }
    }
  }, [isPlaying, progress]);

  const handleFullscreenToggle = useCallback(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      if (document.fullscreenElement) {
        document.exitFullscreen
          ? document.exitFullscreen()
          : (document as any).webkitExitFullscreen?.();
      } else {
        videoElement.requestFullscreen
          ? videoElement.requestFullscreen()
          : (videoElement as any).webkitRequestFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (videoRef.current) {
        // Make sure the duration is a valid finite number before calculating newTime
        const duration = videoRef.current.duration;
        if (Number.isFinite(duration) && duration > 0) {
          try {
            const newTime = (duration * parseFloat(e.target.value)) / 100;
            if (Number.isFinite(newTime)) {
              videoRef.current.currentTime = newTime;
            }
          } catch (error) {
            console.error("Error setting video time:", error);
          }
        }
        // Still update the progress state even if we couldn't set the currentTime
        setProgress(parseFloat(e.target.value));
      }
    },
    []
  );

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const newProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(newProgress);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (videoRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newHoverTime = (x / rect.width) * videoRef.current.duration;
        setHoverTime(newHoverTime);
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (isInView && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isInView]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [handleTimeUpdate]);

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play();
        setIsPlaying(true);
        setShouldLoop(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setShouldLoop(false);
      }
    }
  }, [isInView]);

  // Memoize slider background to prevent re-computation on every render
  const sliderBackground = useMemo(
    () => `
        linear-gradient(
            to right,
            rgb(50,205,50) 0%,
            rgb(50,205,50) ${progress}%,
            #ccc ${progress}%,
            #ccc 100%
  )
  `,
    [progress]
  );

  const progressSliderStyle = useMemo(
    () => ({
      ...BASE_SLIDER_STYLE,
      width: "100%",
      background: sliderBackground,
      zIndex: 3,
    }),
    [sliderBackground]
  );

  const volumeSliderStyle = useMemo(
    () => ({
      ...BASE_SLIDER_STYLE,
      writingMode: "vertical-lr" as React.CSSProperties["writingMode"],
      WebkitAppearance:
        "slider-vertical" as React.CSSProperties["WebkitAppearance"],
      height: "80px",
      transform: "rotate(180deg)",
    }),
    []
  );

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      paddingTop="10px"
      minWidth="100%"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <picture
        style={{ position: "relative", width: "100%", height: "100%" }}
        ref={setVideoRef}
      >
        <video
          {...props}
          ref={videoRef}
          src={src}
          muted={volume === 0}
          controls={false}
          playsInline={true}
          autoPlay={true}
          loop={shouldLoop}
          preload="metadata"
          onLoadedData={handleLoadedData}
          onEnded={handleVideoEnded}
          onClick={(e) => e.stopPropagation()}
          style={VIDEO_STYLE}
        />
        {!isVideoLoaded && (
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            zIndex={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <MemoizedLoadingComponent />
          </Box>
        )}
      </picture>
      {isHovered && (
        <VideoControls
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          volume={volume}
          setVolume={setVolume}
          showVolumeSlider={showVolumeSlider}
          setShowVolumeSlider={setShowVolumeSlider}
          isFullscreen={isFullscreen}
          handleFullscreenToggle={handleFullscreenToggle}
          progress={progress}
          handleProgressChange={handleProgressChange}
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
          hoverTime={hoverTime}
          videoDuration={videoRef.current?.duration}
          progressSliderStyle={progressSliderStyle}
          volumeSliderStyle={volumeSliderStyle}
          videoRef={videoRef}
        />
      )}
    </Box>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(VideoRenderer);
