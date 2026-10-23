/**
 * Global singleton video playback manager.
 * Ensures only one video plays at a time across the feed.
 * Automatically pauses video when the page or tab is hidden.
 */

type PlaybackListener = (activeVideoId: string) => void;

class VideoPlaybackManager {
  private activeVideoId: string | null = null;
  private listeners: Set<PlaybackListener> = new Set();
  private isVisibilityListenerBound = false;

  constructor() {
    this.initVisibilityListener();
  }

  private initVisibilityListener() {
    if (typeof document === 'undefined' || this.isVisibilityListenerBound) return;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.activeVideoId) {
        this.pauseAll();
      }
    });

    window.addEventListener('pagehide', () => {
      if (this.activeVideoId) {
        this.pauseAll();
      }
    });

    this.isVisibilityListenerBound = true;
  }

  public register(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setActiveVideo(videoId: string) {
    if (this.activeVideoId === videoId) return;
    this.activeVideoId = videoId;
    this.listeners.forEach((listener) => {
      try {
        listener(videoId);
      } catch (err) {
        console.error('VideoPlaybackManager listener error:', err);
      }
    });
  }

  public pauseAll() {
    this.activeVideoId = null;
    this.listeners.forEach((listener) => {
      try {
        listener('');
      } catch (err) {
        console.error('VideoPlaybackManager pause error:', err);
      }
    });
  }

  public getActiveVideoId(): string | null {
    return this.activeVideoId;
  }
}

export const videoPlaybackManager = new VideoPlaybackManager();
