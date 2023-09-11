const routes = (handler) => [
    {
      method: 'GET',
      path: '/playlists/{id}/activities',
      handler: handler.getPlaylistSongActivitiesHandler,
      options: {
        auth: 'music_api',
      },
    },
  ];
  
  module.exports = routes;