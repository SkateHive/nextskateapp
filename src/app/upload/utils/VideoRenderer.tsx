import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, IconButton, HStack } from '@chakra-ui/react';
import { FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';
import { LuPause, LuPlay } from 'react-icons/lu';
import { FaRegComment } from 'react-icons/fa';

type RendererProps = {
    src?: string;
    onCommentIconClick?: () => void;
    [key: string]: any;
};

const VideoRenderer = ({ src, onCommentIconClick, ...props }: RendererProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [poster, setPoster] = useState<string>('/home_animation_body.gif');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hoverTime, setHoverTime] = useState<number | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const captureThumbnail = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    video.currentTime = 2;
                    video.addEventListener('seeked', function capture() {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        setPoster(canvas.toDataURL('image/jpeg'));
                        setIsHorizontal(video.videoWidth > video.videoHeight);
                        video.removeEventListener('seeked', capture);
                    });
                }
            };
            if (video.readyState >= 2) {
                captureThumbnail();
            } else {
                video.addEventListener('loadeddata', captureThumbnail);
            }
        }
    }, [src]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            if (!videoRef.current) return;
            videoRef.current.play();
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        handlePlay();
                    } else {
                        handlePause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(video);

        return () => {
            observer.unobserve(video);
        };
    }, [src]);

    const handlePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleVolumeChange = useCallback(() => {
        if (videoRef.current) {
            const newVolume = volume === 0 ? 1 : 0;
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
        }
    }, [volume]);

    const handleFullscreenToggle = useCallback(() => {
        if (videoRef.current) {
            if (isFullscreen) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
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
        const video = videoRef.current;
        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
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
            minHeight='auto'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <picture>
                <video
                    {...props}
                    muted={true}
                    loop={true}
                    ref={videoRef}
                    controls={false}
                    src={src}
                    poster={poster}
                    crossOrigin='anonymous'
                    playsInline={true}
                    autoPlay={true}
                    style={{
                        background: 'transparent',
                        marginBottom: '20px',
                        width: '100%',
                    }}
                />
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
                >
                    <HStack gap={0}>
                        <Button
                            onClick={handlePlayPause}
                            size='md'
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                        >
                            {isPlaying ? <LuPause /> : <LuPlay />}
                        </Button>
                        <IconButton
                            aria-label='Volume'
                            onClick={handleVolumeChange}
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            size='md'
                        >
                            {volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                        </IconButton>
                        <IconButton
                            aria-label='Toggle comments'
                            icon={<FaRegComment />}
                            colorScheme='teal'
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onCommentIconClick) {
                                    onCommentIconClick();
                                }
                            }}
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            size='md'
                        />
                        <IconButton
                            aria-label='Fullscreen'
                            onClick={handleFullscreenToggle}
                            p={2}
                            variant={'ghost'}
                            color={'white'}
                            _hover={{ bg: 'transparent', color: 'black' }}
                            size='md'
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
