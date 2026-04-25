/**
 * Input validation schema for Listing Kit AI
 * Prevents injection attacks and invalid data
 */

/**
 * Validates generate kit request
 */
export function validateGenerateRequest(body) {
  const errors = [];

  // property_type (required)
  if (!body.property_type || typeof body.property_type !== 'string') {
    errors.push('property_type is required and must be a string');
  } else if (body.property_type.length < 1 || body.property_type.length > 100) {
    errors.push('property_type must be between 1 and 100 characters');
  }

  // location (required)
  if (!body.location || typeof body.location !== 'string') {
    errors.push('location is required and must be a string');
  } else if (body.location.length < 1 || body.location.length > 500) {
    errors.push('location must be between 1 and 500 characters');
  }

  // price (required) - validate currency format
  if (!body.price || typeof body.price !== 'string') {
    errors.push('price is required and must be a string');
  } else if (!body.price.match(/^\$?[\d,]+(\.\d{2})?$/)) {
    errors.push('price must be in valid currency format (e.g., $250,000 or 250000.00)');
  }

  // bedrooms (optional)
  if (body.bedrooms && typeof body.bedrooms !== 'string') {
    errors.push('bedrooms must be a string');
  } else if (body.bedrooms && body.bedrooms.length > 50) {
    errors.push('bedrooms must be less than 50 characters');
  }

  // bathrooms (optional)
  if (body.bathrooms && typeof body.bathrooms !== 'string') {
    errors.push('bathrooms must be a string');
  } else if (body.bathrooms && body.bathrooms.length > 50) {
    errors.push('bathrooms must be less than 50 characters');
  }

  // square_footage (optional)
  if (body.square_footage && typeof body.square_footage !== 'string') {
    errors.push('square_footage must be a string');
  } else if (body.square_footage && body.square_footage.length > 50) {
    errors.push('square_footage must be less than 50 characters');
  }

  // key_features (optional, but limit length to prevent prompt injection)
  if (body.key_features && typeof body.key_features !== 'string') {
    errors.push('key_features must be a string');
  } else if (body.key_features && body.key_features.length > 2000) {
    errors.push('key_features must be less than 2000 characters');
  }

  // property_description (optional)
  if (body.property_description && typeof body.property_description !== 'string') {
    errors.push('property_description must be a string');
  } else if (body.property_description && body.property_description.length > 2000) {
    errors.push('property_description must be less than 2000 characters');
  }

  // target_audience (optional, but from enum)
  const validAudiences = ['investor', 'family buyer', 'luxury buyer', 'first-time buyer', 'seller audience', 'relocation buyer'];
  if (body.target_audience && !validAudiences.includes(body.target_audience)) {
    errors.push(`target_audience must be one of: ${validAudiences.join(', ')}`);
  }

  // tone (optional, but from enum)
  const validTones = ['luxury', 'professional', 'friendly', 'bold', 'investor-focused', 'emotional storytelling'];
  if (body.tone && !validTones.includes(body.tone)) {
    errors.push(`tone must be one of: ${validTones.join(', ')}`);
  }

  // platform_focus (optional, but from enum)
  const validPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'Email', 'All Platforms'];
  if (body.platform_focus && !validPlatforms.includes(body.platform_focus)) {
    errors.push(`platform_focus must be one of: ${validPlatforms.join(', ')}`);
  }

  // language (optional, but from enum)
  const validLanguages = ['English', 'French', 'Spanish'];
  if (body.language && !validLanguages.includes(body.language)) {
    errors.push(`language must be one of: ${validLanguages.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates admin credit operation
 */
export function validateAdminCreditOperation(body) {
  const errors = [];

  const { user_id, amount, reason, action } = body;

  if (!user_id || typeof user_id !== 'string') {
    errors.push('user_id is required and must be a string');
  }

  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    errors.push('amount is required and must be a number');
  } else if (Number(amount) < -10000 || Number(amount) > 10000) {
    errors.push('amount must be between -10000 and 10000');
  }

  if (!['add_credits', 'remove_credits', 'reset_credits'].includes(action)) {
    errors.push('Invalid action');
  }

  if (reason && typeof reason !== 'string') {
    errors.push('reason must be a string');
  } else if (reason && reason.length > 500) {
    errors.push('reason must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates plan request
 */
export function validatePlanRequest(body) {
  const errors = [];

  if (!body.plan_id || typeof body.plan_id !== 'string') {
    errors.push('plan_id is required and must be a string');
  } else if (body.plan_id === 'free_trial') {
    errors.push('Cannot request free_trial plan');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input (basic protection against injection)
 */
export function sanitizeString(str, maxLength = 5000) {
  if (typeof str !== 'string') return '';
  return str
    .substring(0, maxLength)
    .trim()
    .replace(/[\x00-\x1F]/g, ''); // Remove control characters
}
