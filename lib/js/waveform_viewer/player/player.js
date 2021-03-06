/**
 * Player API
 *
 * Functionality layer for interfacing with the html5 audio API.
 *
 * player.init - takes a player object and sets up the player
 *
 * player.play - starts the audio playback and updates internal variables
 *
 * player.stop - stops playback
 *
 * player.seek - seek to a certain percentage
 *
 * player.timeUpdate - assignable function that is called on player update during playback (normalised)
 *
 * player.getPercentage - get the percentage playthrough
 *
 * player.getTime - get a nicely formatted string representing the current timecode
 *
 * player.getDuration - get a nice formatted time representing the clip duration
 *
 * player.getTimeFromPercentage - get the time in track of a percentage playthrough without setting
 *
 * player.setVolume
 */

define(["m/bootstrap", "m/player/waveform/waveform.mixins"], function (bootstrap, mixins) {

  var radio = function () {

    var _helpers = {
      timeFromPercentage: function (time, percentage) {
        return time*(percentage/100);
      }
    };

    return {

      init: function (audioElement) {
        var that = this;
        this.player = audioElement;
        this.duration = this.player.duration;

        if (this.player.readyState === 4) {
          bootstrap.pubsub.emit("player_load", that);
        }

        this.player.addEventListener("timeupdate", function () {
          bootstrap.pubsub.emit("player_time_update", that.getTime());
        });

        this.player.addEventListener("play", function () {
          bootstrap.pubsub.emit("player_play", that.getTime());
        });

        this.player.addEventListener("pause", function () {
          bootstrap.pubsub.emit("player_pause", that.getTime());
        });

        this.player.addEventListener("seeked", function () {
          bootstrap.pubsub.emit("waveform_seek", that.getTime());
        });

      },

      setSource: function(source) {
        this.player.setAttribute('src', source);
      },

      getSource: function() {
        return this.player.src;
      },

      play: function () {
        this.player.play();
        bootstrap.pubsub.emit("radio_play", this.getTime());
      },

      pause: function () {
        this.player.pause();
        bootstrap.pubsub.emit("radio_pause", this.getTime());
      },

      getTime: function () {
        return this.player.currentTime;
      },

      getTimeFromPercentage: function (p) {
        return mixins.niceTime(this.duration * p / 100, false);
      },

      getSecsFromPercentage: function (p) {
        return Math.floor(this.duration * p / 100);
      },

      getDuration: function () {
        return this.duration;
      },

      getPercentage: function () {
        return this.getPercentageFromSeconds(this.player.currentTime);
      },

      getPercentageFromSeconds: function (s) {
        var percentage = (s / this.duration) * 100;
        return Math.round(percentage * 100) / 100; // 2DP
      },

      seek: function (percentage) {
        this.player.currentTime = _helpers.timeFromPercentage(this.duration, percentage);
      },

      seekBySeconds: function (seconds) {
        this.player.currentTime = seconds;
      }
    };
  };

  return radio;
});
