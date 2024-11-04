precision highp float;

varying vec2 vUv;

uniform int uNoise;
uniform int uFrame;
uniform float uTime;
uniform float uFade;
uniform float uPixel;
uniform float uOpacity;
uniform vec2 uPixelSize;
uniform vec2 uPlaneSize;  
uniform int uTextureType;
uniform vec2 uTextureSize;
uniform int uTextureLoaded;
uniform float uTextureFade;  
uniform sampler2D uTextureImage;
uniform sampler2D uTextureVideo;
uniform float uBorderRadius;
uniform vec4 uMultiplyColor;
uniform vec4 uColor;
uniform float uZoom;

float hash(uint n) {
    n = (n << 13U) ^ n;
    n = n * (n * n * 15731U + 789221U) + 1376312589U;
    return float(n & uint(0x7fffffffU)) / float(0x7fffffff);
}

float roundedBoxSDF(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return length(max(q, 0.0)) - r;
}

void main() {
  // Convert UV coordinates to pixel coordinates
  vec2 bruv = vUv * uPlaneSize;

  // Calculate the center position relative to the plane
  vec2 center = bruv - uPlaneSize * 0.5;

  // Calculate the half size of the plane
  vec2 halfSize = uPlaneSize * 0.5;

  // Calculate the SDF for the rounded rectangle
  float sdf = roundedBoxSDF(center, halfSize, uBorderRadius);

  // Discard fragments outside the rounded corners
  if (sdf > 0.0) {
    discard;
  }

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
  
  // Apply zoom
  vec2 uv = (vUv - 0.5) / uZoom + 0.5;
  uv = uv * s / new + offset;
  uv -= vec2(0.5);
  uv += vec2(0.5);

  // vec2 pixel = floor(vUv * (uPixelSize - (uPixelSize - 1.0) * time)) / (uPixelSize - (uPixelSize - 1.0) * time);
  vec2 pixel = floor(uv * uPixelSize) / uPixelSize;
  pixel = pixel * s / new + offset;
  pixel -= vec2(0.5);
  pixel += vec2(0.5);

  vec4 coveredTexture = texture2D(uTextureVideo, uv);
  if (uTextureType == 1) {
    coveredTexture = vec4(1.0, 0.0, 0.0, 1.0);
    coveredTexture = texture2D(uTextureImage, uv);
  }
  vec4 pixelatedTexture = texture2D(uTextureVideo, pixel) * uMultiplyColor;
  if (uTextureType == 1) {
    pixelatedTexture = texture2D(uTextureImage, pixel) * uMultiplyColor;
  }
  vec4 mixedTexture = mix(coveredTexture, pixelatedTexture, uPixel);

  if (uNoise == 1) {
    uvec2 psI = uvec2(uPlaneSize.xy);
    uvec2 uvI = uvec2(uv.xy * uPlaneSize);
    uint frameI = uint(uFrame);
    float random = hash(uvI.x + psI.x * uvI.y + (psI.x * psI.y) * frameI);
    gl_FragColor = vec4(vec3(random), uFade * .75);
  } else if (uTextureLoaded == 0) {
    gl_FragColor = vec4(uColor.xyz, uFade * uOpacity);
  } else if (uTextureFade != 1.0) {
    gl_FragColor = vec4(mix(uColor.xyz, mixedTexture.xyz, uTextureFade), uFade * uOpacity);
  } else {
    gl_FragColor = vec4(mixedTexture.xyz, uFade * uOpacity);
  }
}