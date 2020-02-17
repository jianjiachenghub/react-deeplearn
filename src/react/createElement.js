export default function createElement(tag, attrs, ...children) {
  return {
    tag,
    attrs,
    children
  };
}
