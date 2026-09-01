export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const canvasSizes: Record<LogoSize, number> = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 200,
};

export function getLogoLayout(size: LogoSize) {
  const canvasSize = canvasSizes[size];

  return {
    canvasSize,
    viewportWidth: canvasSize,
    viewportHeight: canvasSize / 5,
    offsetTop: -(canvasSize * 2) / 5,
  };
}
