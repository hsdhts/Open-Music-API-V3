const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class AlbumLikesService {
  constructor(cacheService, dbConfig) {
    this._pool = new Pool(dbConfig);
    this._cacheService = cacheService;
  }

  // check album likes
  async checkAlbumLike(userId, albumId) {
    const query = {
      text: `SELECT id FROM user_album_likes
      WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  // add like album
  async addAlbumLike(userId, albumId) {
    const isLiked = await this.checkAlbumLike(userId, albumId);
    if (isLiked) {
      throw new ClientError('Album sudah pernah di-like');
    }

    const id = `album_like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal di-like ditambahkan');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
    return result.rows[0].id;
  }

  // delete like album
  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like pada album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  // get album likes
  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albumLikes:${albumId}`);
      const parsedResult = JSON.parse(result);
      const response = { likes: parsedResult.rowCount, cache: true };

      return response;
    } catch (error) {
      const query = {
        text: `SELECT id FROM user_album_likes
        WHERE album_id = $1`,
        values: [albumId],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(`albumLikes:${albumId}`, JSON.stringify(result));

      const response = { likes: result.rowCount, cache: false };

      return response;
    }
  }
}

module.exports = AlbumLikesService;
