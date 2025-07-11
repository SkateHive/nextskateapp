import { ImageResponse } from 'next/og';

export const alt = 'Gnars DAO';

// Aspect ratio 3:2
export const size = {
  width: 973,
  height: 649,
};
const appUrl = "https://legacy.skatehive.app";

export const revalidate = 0;
export const dynamic = 'force-dynamic';


export default async function Image() {

  console.log("opengraph image", `${appUrl}/ogimage.png`);
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
        }}
      >
        <img
          src={`${appUrl}/ogimage.png`}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          alt="Skatehive"
        />
      </div>
    ),
    { ...size }
  );
}
