export const BAR_MAP = {
  vertical: {
    offset: "offsetHeight",
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    size: "height",
    key: "vertical",
    axis: "Y",
    client: "clientY",
    direction: "top"
  },
  horizontal: {
    offset: "offsetWidth",
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    size: "width",
    key: "horizontal",
    axis: "X",
    client: "clientX",
    direction: "left"
  }
};

export function renderThumbStyle({ move, size, bar, expand }) {
  const style = {};
  const translate = `translate${bar.axis}(${move}%)`;
  const theSize = `${size * expand}%`;

  style[bar.size] = size === 100 ? "" : theSize;
  style.transform = translate;
  style.msTransform = translate;
  style.webkitTransform = translate;

  return style;
}
