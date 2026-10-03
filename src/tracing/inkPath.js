const NS = 'http://www.w3.org/2000/svg';
const CHUNK_SIZE = 128;

/** Immutable completed paths; only the bounded tail is serialised each frame. */
export function createInkPath(group, partId, points = []) {
  const container = document.createElementNS(NS, 'g'); container.setAttribute('class', 'pupil-ink-gesture'); group.append(container);
  let cursor = 0, node = null, commands = [], count = 0, previous = null, dirty = false;
  const write = () => {
    if (!dirty || !node) return;
    node.setAttribute('d', commands.join(' ') + (count === 1 ? ' l 0.1 0.1' : ''));
    dirty = false;
  };
  const begin = () => {
    node = document.createElementNS(NS, 'path'); node.setAttribute('class', 'pupil-ink'); container.append(node);
    commands = previous ? [`M ${previous.x} ${previous.y}`] : []; count = previous ? 1 : 0;
  };
  return {
    node: container, partId, points,
    paint() {
      while (cursor < points.length) {
        if (!node) begin();
        if (count >= CHUNK_SIZE) { write(); begin(); }
        const point = points[cursor++];
        commands.push(`${count ? 'L' : 'M'} ${point.x} ${point.y}`);
        previous = point; count++; dirty = true;
      }
      write();
    },
  };
}
