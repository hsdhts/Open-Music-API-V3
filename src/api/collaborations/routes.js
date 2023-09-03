const routes = (handler) => [
    {
      method: 'POST',
      path: '/collaborations',
      handler: handler.postCollaborationHandler,
      options: {
        auth: 'music_api',
      },
    },
    {
      method: 'DELETE',
      path: '/collaborations',
      handler: handler.deleteCollaborationHandler,
      options: {
        auth: 'music_api',
      },
    },
  ];
  
  module.exports = routes;