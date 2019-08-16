import {red, green, blue, orange, grey} from '@material-ui/core/colors';

const colors = {
  'activation': green[500],
  'ids_activation': green[200],
  'loss': red[500],
  'ids_loss': red[300],
  'temperature': blue[500],
  'distance': grey[500],
  'distribution': orange[500],
};

/**
 * Used throughout the application to get the color for a specific type.
 *
 * @param {string} type - the type of the visualization to get the color for.
 * @param {number} shade - the shade version of the desired color.
 * @return {object} the color code for the requested color type.
 */
export function getColor(type) {
  return colors[type];
}

/**
 * Get the colors that the requested card type can use.
 *
 * @param {string} type - the type of card that we want to get colors for.
 * @return {array} the colors that this card type can use.
 */
export function getCardColors(type) {
  switch (type) {
    case 'dream':
      return ['temperature', 'activation', 'ids_activation'];
    case 'resemble':
      return ['temperature', 'loss', 'ids_loss'];
    case 'resemble_shifted':
      return ['temperature', 'loss', 'ids_loss'];
    case 'magnitudes':
      return ['temperature', 'loss', 'ids_loss'];
    case 'layerMagnitudes':
      return ['loss', 'ids_loss'];
    case 'top_words':
      return ['distribution'];
    case 'similar_embeddings':
      return ['distance', 'activation'];
    default:
      return [];
  }
}
