"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import cursorImage from '../../../public/cursos.png';
import styles from './Cursor.module.css';

interface Position {
  x: number;
  y: number;
}

const Cursor = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    document.body.style.cursor = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', handleResize);
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (isMobile) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        body, * {
          cursor: none !important;
        }
      `}</style>
      
      <div 
        className={`${styles.cursor} ${isHovering ? styles.hover : ''}`} 
        style={{ left: `${position.x - 12}px`, top: `${position.y - 10}px`, position: 'absolute' }}
      >
        <Image src={cursorImage} alt="Custom Cursor" width={40} />
      </div>
    </>
  );
};

export default Cursor;

