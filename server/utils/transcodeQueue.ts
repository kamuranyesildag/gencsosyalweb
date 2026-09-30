import EventEmitter from "events";

type TranscodeTask = {
  id: string;
  run: () => Promise<void>;
  cancel: () => void;
};

class TranscodeQueue extends EventEmitter {
  private maxConcurrency: number;
  private runningCount: number = 0;
  private queue: TranscodeTask[] = [];

  constructor(maxConcurrency = 2) {
    super();
    this.maxConcurrency = maxConcurrency;
  }

  public enqueue(id: string, run: () => Promise<void>, cancel: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const task: TranscodeTask = {
        id,
        run: async () => {
          try {
            await run();
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        cancel,
      };

      this.queue.push(task);
      this.processNext();
    });
  }

  public cancel(id: string) {
    // If it's waiting in the queue, remove it
    const index = this.queue.findIndex(t => t.id === id);
    if (index !== -1) {
      const [removed] = this.queue.splice(index, 1);
      removed.cancel();
      return;
    }
    // If it's already running, invoke cancel
    this.emit(`cancel_${id}`);
  }

  private async processNext() {
    if (this.runningCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.runningCount++;
    console.log(`[video-queue] Starting task ${task.id}. Active: ${this.runningCount}, Queued: ${this.queue.length}`);

    const onCancel = () => {
      task.cancel();
    };
    this.once(`cancel_${task.id}`, onCancel);

    try {
      await task.run();
    } finally {
      this.removeListener(`cancel_${task.id}`, onCancel);
      this.runningCount--;
      console.log(`[video-queue] Finished task ${task.id}. Active: ${this.runningCount}, Queued: ${this.queue.length}`);
      this.processNext();
    }
  }
}

export const videoTranscodeQueue = new TranscodeQueue(2);
