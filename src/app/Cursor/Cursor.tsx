"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import cursorImage from '../../../public/cursos.png';
import styles from './Cursor.module.css';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: { clientX: any; clientY: any; }) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    document.body.style.cursor = 'none';

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div>
      <style jsx global>{`
        body, * {
          cursor: none !important;
        }
      `}</style>
      
      <div className={styles.cursor} style={{ left: position.x, top: position.y }}>
        <Image src={cursorImage} alt="Custom Cursor" />
      </div>
    </div>
  );
};

export default Cursor;

