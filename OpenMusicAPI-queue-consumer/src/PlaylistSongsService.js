const { Pool } = require('pg');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  //TODO:etPlaylistsById
  async getPlaylistsById(playlistId) {
    const query = {
      text: `SELECT id, name FROM playlists
      WHERE id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows[0];
  }

  // TODO:getPlaylistSongsByPlaylistId
  async getPlaylistSongsByPlaylistId(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongsService;