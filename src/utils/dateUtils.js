
/**
 * Formats a date string (YYYY-MM-DD) into a localized string (Month Day, Year).
 * Handles timezone issues by treating the input as UTC.
 * @param {string} dateString - The date string in YYYY-MM-DD format.
 * @returns {string} - The formatted date string.
 */
export const formatEffectiveDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  if (dateString) {
      // Optimization: Avoid array creation from split().map(Number)
      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(5, 7), 10);
      const day = parseInt(dateString.substring(8, 10), 10);

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
          // Fallback for invalid format, though input type="date" enforces it mostly
           return new Date().toLocaleDateString('en-US', options);
      }

      // Create date using UTC to avoid timezone shifts
      const date = new Date(Date.UTC(year, month - 1, day));
      return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date);
  }

  return new Date().toLocaleDateString('en-US', options);
};
