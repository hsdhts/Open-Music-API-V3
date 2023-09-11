const routes = (handler) => [
    {
      method: 'POST',
      path: '/playlists/{id}/songs',
      handler: handler.postPlaylistSongHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'GET',
      path: '/playlists/{id}/songs',
      handler: handler.getPlaylistSongsHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{id}/songs',
      handler: handler.deletePlaylistSongHandler,
      options: {
        auth: 'music_api',
      },
    },
  ];
  
  module.exports = routes;