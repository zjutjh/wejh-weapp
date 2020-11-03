// API endpoint used by the whole app
const defaultEndpoint = "https://server.wejh.imcr.me/";

// Servers for switching in debug menu
const endpoints = [
  {
    name: "production",
    url: "http://",
  },
];

module.exports = {
  defaultEndpoint,
  endpoints,
};
