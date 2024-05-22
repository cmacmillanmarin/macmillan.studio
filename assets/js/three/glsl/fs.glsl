precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uOpacity;
uniform float uPixel;
uniform vec2 uPixelSize;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;  
uniform vec2 uPlaneSize;    

void main() {
  float time = 0.5 * sin(uTime) + 0.5; // from 0 to 1

  // Texture cover
  vec2 s = uPlaneSize;         
  vec2 i = uTextureSize;        
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  
  vec2 uv = vUv * s / new + offset;
  uv -= vec2(0.5);
  uv += vec2(0.5);

  vec2 pixel = floor(vUv * uPixelSize) / uPixelSize;
  pixel = pixel * s / new + offset;
  pixel -= vec2(0.5);
  pixel += vec2(0.5);

  vec4 coveredTexture = texture2D(uTexture, uv);
  vec4 pixelatedTexture = texture2D(uTexture, pixel);
  vec4 mixedTexture = mix(coveredTexture, pixelatedTexture, time);

  gl_FragColor = vec4(mixedTexture.xyz, uOpacity);
}