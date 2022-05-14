function stringifyError(e) {
  if (e.response) {
    return JSON.stringify(e.response.data) + " | " + e.stack;
  } else if (e.toJSON) {
    return JSON.stringify(e.toJSON());
  } else {
    return String(e);
  }
}

module.exports = {
  stringifyError,
};
