import { ImageResponse } from 'next/og';
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#101416',
        color: '#ffffff',
        padding: '65px 76px',
        borderBottom: '18px solid #ff9149',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontSize: 92, fontWeight: 800, display: 'flex' }}>
          AFC<span style={{ color: '#ff9149' }}>.</span>
        </span>
        <span style={{ fontSize: 27, color: '#b8c3c9' }}>ARENA FOR CREATIVES</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 65, fontWeight: 800 }}>Your creativity. Center stage.</div>
        <div style={{ fontSize: 30, color: '#c9d2d8' }}>
          Original art. Extraordinary cosplay. Every stage of the process.
        </div>
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#ff9149' }}
      >
        <span>CREATE · DISCOVER · SUPPORT</span>
        <span>arenaforcreatives.online</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
