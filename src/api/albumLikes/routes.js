const routes = (handler) => [
    {
      method: 'POST',
      path: '/albums/{id}/likes',
      handler: handler.postAlbumLikeHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'DELETE',
      path: '/albums/{id}/likes',
      handler: handler.deleteAlbumLikeHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'GET',
      path: '/albums/{id}/likes',
      handler: handler.getAlbumLikesHandler,
    },
  ];
  
  module.exports = routes;