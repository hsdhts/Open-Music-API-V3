const routes = (handler) => [
    {
      method: 'POST',
      path: '/playlists',
      handler: handler.postPlaylistHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'GET',
      path: '/playlists',
      handler: handler.getPlaylistsHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{id}',
      handler: handler.deletePlaylistByIdHandler,
      options: {
        auth: 'music_api',
      },
    },
  ];
  
  module.exports = routes;