precision highp float;

varying vec2 vUv;

uniform int uNoise;
uniform float uTime;
uniform float uOpacity;
uniform float uPixel;
uniform vec2 uPixelSize;
uniform int uTextureType;
uniform vec2 uTextureSize;  
uniform sampler2D uTextureImage;
uniform sampler2D uTextureVideo;

uniform vec2 uPlaneSize;  

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float time = 0.5 * sin(uTime) + 0.5; // from 0 to 1

  float gradient = smoothstep(0.0, 1.0, vUv.x);
  float distanceFromCenter = 1.0 - max(distance(vUv, vec2(0.5)) * 8.0, 1.0);

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

  // vec2 pixel = floor(vUv * (uPixelSize - (uPixelSize - 1.0) * time)) / (uPixelSize - (uPixelSize - 1.0) * time);
  vec2 pixel = floor(vUv * uPixelSize) / uPixelSize;
  pixel = pixel * s / new + offset;
  pixel -= vec2(0.5);
  pixel += vec2(0.5);

  vec4 lime = vec4(197.0/255.0, 255.0/255.0, 32.0/255.0, 1.0);  
  vec4 coveredTexture = texture2D(uTextureVideo, uv);
  if (uTextureType == 1) {
    coveredTexture = vec4(1.0, 0.0, 0.0, 1.0);
    coveredTexture = texture2D(uTextureImage, uv);
  }
  vec4 pixelatedTexture = texture2D(uTextureVideo, pixel) * lime;
  if (uTextureType == 1) {
    pixelatedTexture = texture2D(uTextureImage, pixel) * lime;
  }
  vec4 mixedTexture = mix(coveredTexture, pixelatedTexture, 1.0);
  

  gl_FragColor = vec4(mixedTexture.xyz, uOpacity);

  if (uNoise == 1) {
    gl_FragColor = vec4(vec3(0.0), noise(vec2(time) * vUv) * 0.2);
  }
}