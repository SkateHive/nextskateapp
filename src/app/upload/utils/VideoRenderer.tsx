import React, { useEffect, useRef, useState } from 'react';

type RendererProps = {
    src?: string;
    [key: string]: any;
};

const VideoRenderer = ({ src, ...props }: RendererProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [poster, setPoster] = useState<string>('/home_animation_body.gif');
    const [isPlaying, setIsPlaying] = useState(false);

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

    return (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '10px', minWidth: '100%', minHeight: 'auto' }}>
            <picture>
                <video
                    {...props}
                    muted={true}
                    loop={false}
                    ref={videoRef}
                    controls={true}
                    src={src}
                    poster={poster}
                    crossOrigin='anonymous'
                    playsInline={true}
                    autoPlay={true}
                    style={{ background: 'transparent', borderRadius: '10px', marginBottom: '20px', border: '0px grey solid', width: '100%', maxWidth: '100%', minHeight: '50%', maxHeight: '420px' }}
                />
            </picture>
        </div>
    );
};

export default VideoRenderer;
