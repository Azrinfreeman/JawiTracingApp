import { distance, finitePoint } from './geometry.js';

export function dotPointAllowed(dot, point, profile) {
  return dot?.policy === 'tap' && finitePoint(point) &&
    distance(point, dot) <= Math.min(dot.hitRadius ?? profile.dotRadius, profile.dotRadius);
}

export function validateDotMotion(dot, point, travel, profile) {
  return dotPointAllowed(dot, point, profile) && Number.isFinite(travel) && travel >= 0 &&
    travel <= Math.min(dot.maxTravel ?? profile.dotTravel, profile.dotTravel);
}

export function validateDot(dot, down, up, travel, profile) {
  return dotPointAllowed(dot, down, profile) && validateDotMotion(dot, up, travel, profile);
}
