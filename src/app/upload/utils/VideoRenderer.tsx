import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaRegComment } from 'react-icons/fa';
import { FiMaximize, FiMinimize, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { LuPause, LuPlay } from 'react-icons/lu';
import LoadingComponent from '../../mainFeed/components/loadingComponent'; // added import

type RendererProps = {
    src?: string;
    loop?: boolean;
    onCommentIconClick?: () => void;
    [key: string]: any;
};

const VideoRenderer = ({ src, onCommentIconClick, ...props }: RendererProps) => {

    const videoRef = useRef<HTMLVideoElement>(null);
    // Removed poster state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [volume, setVolume] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false); // loading state



    const handleLoadedData = useCallback(() => {
        setIsVideoLoaded(true);
        if (videoRef.current) {
            setIsHorizontal(videoRef.current.videoWidth > videoRef.current.videoHeight);
        }
    }, []);

    const handlePlayPause = useCallback(() => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.pause() : videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleVolumeChange = useCallback(() => {
        if (videoRef.current) {
            const newVolume = volume === 0 ? 1 : 0;
            videoRef.current.volume = newVolume;
            videoRef.current.muted = newVolume === 0;
            setVolume(newVolume);
        }
    }, [volume]);

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
                const newTime = (videoRef.current.duration * parseFloat(e.target.value)) / 100;
                videoRef.current.currentTime = newTime;
                setProgress(parseFloat(e.target.value));
            }
        },
        []
    );

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
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

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
            return () => {
                videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [handleTimeUpdate]);

    const sliderBackground = `
        linear-gradient(
            to right,
            rgba(50, 205, 50, 0.8) 0%,
            rgba(50, 205, 50, 0.8) ${progress}%,
            #ccc ${progress}%,
            #ccc 100%
        )
    `;

    return (
        <Box
            position='relative'
            display='flex'
            justifyContent='center'
            alignItems='center'
            paddingTop='10px'
            minWidth='100%'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <picture style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                    {...props}
                    ref={videoRef}
                    src={src}
                    muted={volume === 0}
                    controls={false}
                    playsInline={props.loop ? false : true}
                    autoPlay={true}
                    preload="metadata"
                    onLoadedData={handleLoadedData}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'transparent',
                        marginBottom: '20px',
                        width: '100%',
                        zIndex: 2,
                    }}
                />
                {!isVideoLoaded && (
                    <Box
                        position='absolute'
                        top={0}
                        left={0}
                        width='100%'
                        height='100%'
                        zIndex={3}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        overflow='hidden'
                    >
                        <LoadingComponent />
                    </Box>
                )}
            </picture>
            {isHovered && (
                <Box
                    position='absolute'
                    bottom={4}
                    left={0}
                    right={0}
                    px={4}
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    zIndex={3} // Ensure controls are on top
                >
                    <HStack gap={0}>
                        <Button
                            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} // Prevent page flip
                            size='md'
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            zIndex={3} // Ensure button is on top
                        >
                            {isPlaying ? <LuPause /> : <LuPlay />}
                        </Button>
                        <IconButton
                            aria-label='Volume'
                            onClick={(e) => { e.stopPropagation(); handleVolumeChange(); }} // Prevent page flip
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            size='md'
                            zIndex={3} // Ensure button is on top
                        >
                            {volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                        </IconButton>
                        <IconButton
                            aria-label='Toggle comments'
                            icon={<FaRegComment />}
                            colorScheme='teal'
                            onClick={(e) => { e.stopPropagation(); if (onCommentIconClick) { onCommentIconClick(); } }} // Prevent page flip
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            size='md'
                            zIndex={3} // Ensure button is on top
                        />
                        <IconButton
                            aria-label='Fullscreen'
                            onClick={(e) => { e.stopPropagation(); handleFullscreenToggle(); }} // Prevent page flip
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            size='md'
                            zIndex={3} // Ensure button is on top
                        >
                            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                        </IconButton>
                    </HStack>

                    <Box position='relative' flex='1' mx={4}>
                        <input
                            type='range'
                            min='0'
                            max='100'
                            value={progress}
                            onChange={handleProgressChange}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                width: '100%',
                                WebkitAppearance: 'none',
                                background: sliderBackground,
                                height: '8px',
                                borderRadius: '4px',
                                outline: 'none',
                                cursor: 'pointer',
                                zIndex: 3, // Ensure slider is on top
                            }}
                        />

                        <style jsx>{`
                            input[type='range']::-webkit-slider-runnable-track {
                                -webkit-appearance: none;
                                height: 8px;
                                background: transparent;
                            }
                            input[type='range']::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                height: 24px;
                                width: 24px;
                                background: url('/skateboardloader.webp') no-repeat center;
                                background-size: contain;
                                border: none;
                                border-radius: 0%;
                                cursor: pointer;
                                margin-top: -16px;
                                box-shadow: none; /* Remove shadow */
                            }
                            input[type='range']::-webkit-slider-thumb:active {
                                background: url('/skateboardloader.webp') no-repeat center;
                                background-size: contain;
                                box-shadow: none; /* Remove shadow */
                            }
                        `}</style>

                        {hoverTime !== null && videoRef.current?.duration && (
                            <Box
                                position='absolute'
                                top='-25px'
                                left={`${(hoverTime / videoRef.current.duration) * 100}%`}
                                transform='translateX(-50%)'
                                bg='black'
                                color='white'
                                p={1}
                                rounded='md'
                                fontSize='xs'
                            >
                                {new Date(hoverTime * 1000).toISOString().substr(11, 8)}
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default VideoRenderer;
