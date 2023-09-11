require("dotenv").config();

const { Pool } = require('pg');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const ClientError = require('./exceptions/ClientError');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// playlist songs
const playlistSongs = require('./api/playlistSongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistSongs');

// playlist song activities
const playlistSongActivities = require('./api/playlistSongActivities');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const PlaylistSongActivitiesValidator = require('./validator/playlistSongActivities');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// Uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// Cache
const CacheService = require('./services/redis/CacheService');

// AlbumLikes
const albumLikes = require('./api/albumLikes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

const init = async () => {
  const cacheService = new CacheService();
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/uploads/file/covers')
  );
  const albumLikesService = new AlbumLikesService(cacheService);

  const server = setupServer();

  // Registrasi plugin eksternal
  await server.register([
    { plugin: Jwt },
    { plugin: Inert },
  ]);

  setupAuthentication(server);

  // Registrasi plugin internal
  await server.register([
    { plugin: songs, options: { service: songsService, validator: SongsValidator } },
    { plugin: albums, options: { service: albumsService, validator: AlbumsValidator } },
    { plugin: users, options: { service: usersService, validator: UsersValidator } },
    { plugin: authentications, options: { authenticationsService, usersService, tokenManager: TokenManager, validator: AuthenticationsValidator } },
    { plugin: playlists, options: { service: playlistsService, validator: PlaylistsValidator } },
    { plugin: playlistSongs, options: { playlistSongsService, playlistsService, songsService, playlistSongActivitiesService, playlistSongsValidator: PlaylistSongsValidator, playlistSongActivitiesValidator: PlaylistSongActivitiesValidator } },
    { plugin: playlistSongActivities, options: { playlistSongActivitiesService, playlistsService, validator: PlaylistSongActivitiesValidator } },
    { plugin: collaborations, options: { collaborationsService, playlistsService, usersService, validator: CollaborationsValidator } },
    { plugin: _exports, options: { playlistsService, exportsService: ProducerService, validator: ExportsValidator } },
    { plugin: uploads, options: { storageService, albumsService, validator: UploadsValidator } },
    { plugin: albumLikes, options: { albumLikesService, albumsService } },
  ]);

  // setting ekstensi
  server.ext('onPreResponse', handlePreResponse);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

const setupServer = () => {
  return Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
};

const setupAuthentication = (server) => {
  server.auth.strategy('music_api', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });
};

const handlePreResponse = (request, h) => {
  const { response } = request;

  if (response instanceof Error) {
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (!response.isServer) {
      return h.continue;
    }

    console.error(response);
    const newResponse = h.response({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
    newResponse.code(500);
    return newResponse;
  }

  return h.continue;
};

init();
