const autoBind = require('auto-bind');

class Listener {
  constructor(playlistSongsService, mailSender) {
    this._playlistSongsService = playlistSongsService;
    this._mailSender = mailSender;

    autoBind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlist = await this._playlistSongsService.getPlaylistsById(playlistId);
      const songs = await this._playlistSongsService.getPlaylistSongsByPlaylistId(playlistId);
      playlist.songs = songs;
      console.log({ playlist });

      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify({ playlist }));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;