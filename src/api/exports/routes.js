const routes = (handler) => [
    {
      method: 'POST',
      path: '/export/playlists/{playlistId}',
      handler: handler.postExportPlaylistSongsHandler,
      options: {
        auth: 'music_api',
      },
    },
  ];
  
  module.exports = routes;