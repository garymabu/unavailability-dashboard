// Helper function to get the width of a text string with a given font size and style
const getRenderedStringWidth = (
  text: string,
  font: string,
  fontSize: number
) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  context.font = `${font} ${fontSize}px`;
  return context.measureText(text).width;
};

export default getRenderedStringWidth;
