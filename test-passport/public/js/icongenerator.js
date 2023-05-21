function generateIcon(input, color) {
  // Validate input length
  if (input.length > 6) {
    throw new Error('Input must be no longer than 6 characters');
  }

  // Create canvas and context
  const canvas = document.createElement('canvas');
  canvas.width = 50;
  canvas.height = 50;
  const context = canvas.getContext('2d');

  // Define background color
  const backgroundColor = color == null ? '#555' : color;

  // Set the canvas background to the chosen color
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Define text color
  const textColor = '#fff';
  const borderColor = '#000';

  // Set the context font and align text to center
  context.font = 'bold 14px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Add border to the text
  context.lineWidth = 2;
  context.strokeStyle = borderColor;
  context.strokeText(input.toUpperCase(), canvas.width / 2, canvas.height / 2);

  // Draw the input text onto the canvas
  context.fillStyle = textColor;
  context.fillText(input.toUpperCase(), canvas.width / 2, canvas.height / 2);

  // Return the canvas element
  return canvas;
}

function displayIcon(input, color, containerId) {
  try {

    console.log(containerId);
    const icon = generateIcon(input, color);
    const iconContainer = document.getElementById(containerId);
    iconContainer.innerHTML = ''; // Clear any existing content
    iconContainer.appendChild(icon);

    // Get the data URL of the generated icon
    const iconDataURL = icon.toDataURL();

    // Set the generated icon data to the hidden input field
    const generatedIconInput = document.getElementById('generatedIcon');
    generatedIconInput.value = iconDataURL;
  } catch (error) {
    console.error(error);
  }
}